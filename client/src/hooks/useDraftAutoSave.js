import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useDraftAutoSave Hook
 * 
 * Provides debounced auto-saving for article drafts with:
 * - LocalStorage backup for instant recovery across browser reloads & crashes
 * - Server-side auto-save synchronization with debounce (default 1500ms)
 * - Dirty checking to prevent duplicate/redundant database writes
 * - AbortController & sequencing to prevent race conditions
 * - Network failure resilience (retains in-memory and local state)
 * - Clear save status reporting ('idle' | 'unsaved' | 'saving' | 'saved' | 'error')
 */
export default function useDraftAutoSave({
  storageKey,
  formData,
  setFormData,
  onServerSave,
  enabled = true,
  debounceMs = 1500,
  minValidCheck = (data) => Boolean(data?.title?.trim()?.length >= 3 && data?.content?.replace(/<[^>]*>/gm, "")?.trim()?.length >= 5),
}) {
  const [saveStatus, setSaveStatus] = useState("idle"); // 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [draftRecovered, setDraftRecovered] = useState(false);
  const [serverDraftId, setServerDraftId] = useState(null);

  const lastSavedPayloadRef = useRef("");
  const saveTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const saveSequenceRef = useRef(0);
  const isMountedRef = useRef(true);
  const initialLoadDoneRef = useRef(false);

  // Helper to create a comparable snapshot of the editable fields
  const getPayloadSnapshot = useCallback((data) => {
    return JSON.stringify({
      title: data.title || "",
      category: data.category || "General",
      tags: data.tags || "",
      thumbnail: data.thumbnail || "",
      excerpt: data.excerpt || "",
      content: data.content || "",
      status: data.status || "draft",
    });
  }, []);

  // 1. Recover draft from localStorage on initial mount
  useEffect(() => {
    isMountedRef.current = true;

    if (!storageKey || initialLoadDoneRef.current) return;

    try {
      const savedRaw = localStorage.getItem(storageKey);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed && (parsed.formData?.title || parsed.formData?.content)) {
          // Check if there is meaningful data to restore
          const hasContent = parsed.formData.title?.trim() || parsed.formData.content?.replace(/<[^>]*>/gm, "")?.trim();
          if (hasContent && setFormData) {
            setFormData((prev) => ({
              ...prev,
              ...parsed.formData,
            }));
            if (parsed.serverDraftId) {
              setServerDraftId(parsed.serverDraftId);
            }
            if (parsed.savedAt) {
              setLastSavedTime(new Date(parsed.savedAt));
              setSaveStatus("saved");
            }
            lastSavedPayloadRef.current = getPayloadSnapshot(parsed.formData);
            setDraftRecovered(true);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to parse stored draft from localStorage:", e);
    } finally {
      initialLoadDoneRef.current = true;
    }

    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [storageKey, setFormData, getPayloadSnapshot]);

  // 2. Perform the actual save (local + server)
  const performSave = useCallback(
    async (currentData, isManual = false) => {
      if (!enabled) return;

      const currentSnapshot = getPayloadSnapshot(currentData);

      // Avoid redundant DB writes if payload hasn't changed since last successful save
      if (!isManual && currentSnapshot === lastSavedPayloadRef.current) {
        if (saveStatus === "unsaved") setSaveStatus("saved");
        return;
      }

      // Always save to localStorage immediately for instant client-side persistence
      if (storageKey) {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              formData: currentData,
              serverDraftId,
              savedAt: new Date().toISOString(),
            })
          );
        } catch (e) {
          console.warn("Failed to update localStorage draft:", e);
        }
      }

      // Check if minimum data criteria is met for backend auto-save
      const isEligibleForServer = minValidCheck ? minValidCheck(currentData) : true;
      if (!isEligibleForServer || !onServerSave) {
        if (isMountedRef.current) {
          setSaveStatus("saved");
          setLastSavedTime(new Date());
          lastSavedPayloadRef.current = currentSnapshot;
        }
        return;
      }

      // Prepare race-condition-safe request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const currentSeq = ++saveSequenceRef.current;

      if (isMountedRef.current) {
        setSaveStatus("saving");
        setSaveError("");
      }

      try {
        const result = await onServerSave(currentData, serverDraftId, abortControllerRef.current.signal);

        // Discard stale responses from earlier in-flight requests
        if (currentSeq !== saveSequenceRef.current || !isMountedRef.current) {
          return;
        }

        if (result && result.draftId) {
          setServerDraftId(result.draftId);
          if (storageKey) {
            try {
              localStorage.setItem(
                storageKey,
                JSON.stringify({
                  formData: currentData,
                  serverDraftId: result.draftId,
                  savedAt: new Date().toISOString(),
                })
              );
            } catch (err) {
              // ignore storage quotas
            }
          }
        }

        lastSavedPayloadRef.current = currentSnapshot;
        setSaveStatus("saved");
        setLastSavedTime(new Date());
        setSaveError("");
      } catch (err) {
        if (err.name === "AbortError" || currentSeq !== saveSequenceRef.current) {
          return; // Intentionally aborted for newer typing
        }
        if (isMountedRef.current) {
          setSaveStatus("error");
          setSaveError(err.message || "Failed to auto-save draft to server. Saved locally.");
        }
      }
    },
    [enabled, getPayloadSnapshot, minValidCheck, onServerSave, serverDraftId, storageKey, saveStatus]
  );

  // 3. Track changes and trigger debounce
  useEffect(() => {
    if (!enabled || !initialLoadDoneRef.current) return;

    const currentSnapshot = getPayloadSnapshot(formData);

    // Initial baseline sync
    if (!lastSavedPayloadRef.current) {
      lastSavedPayloadRef.current = currentSnapshot;
      return;
    }

    // If no changes, do nothing
    if (currentSnapshot === lastSavedPayloadRef.current) {
      return;
    }

    // Mark as unsaved changes in UI immediately
    setSaveStatus("unsaved");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave(formData, false);
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, enabled, debounceMs, getPayloadSnapshot, performSave]);

  // 4. Force Save / Retry method
  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    return performSave(formData, true);
  }, [formData, performSave]);

  // 5. Clear draft from localStorage (e.g. after publish or manual discard)
  const clearDraft = useCallback(() => {
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.warn("Failed to remove draft from localStorage:", e);
      }
    }
    setDraftRecovered(false);
    setServerDraftId(null);
    setSaveStatus("idle");
    setLastSavedTime(null);
    lastSavedPayloadRef.current = "";
  }, [storageKey]);

  return {
    saveStatus,
    lastSavedTime,
    saveError,
    draftRecovered,
    serverDraftId,
    setServerDraftId,
    forceSave,
    clearDraft,
    setDraftRecovered,
  };
}
