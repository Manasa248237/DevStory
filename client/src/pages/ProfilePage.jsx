import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { userApi } from "../services/api.js";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // Fetch full profile from backend
  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.getProfile();
      if (response.success && response.user) {
        setProfile(response.user);
        setFormData({
          name: response.user.name || "",
          bio: response.user.bio || "",
          avatar: response.user.avatar || "",
        });
        updateUser(response.user);
      }
    } catch (err) {
      setError(err.message || "Failed to load user profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "avatar") {
      setAvatarLoadError(false);
    }
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required.";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long.";
    } else if (formData.name.trim().length > 50) {
      errors.name = "Name cannot exceed 50 characters.";
    }

    if (formData.bio && formData.bio.trim().length > 250) {
      errors.bio = "Bio cannot exceed 250 characters.";
    }

    if (formData.avatar && formData.avatar.trim()) {
      const trimmed = formData.avatar.trim();
      if (!/^https?:\/\/.+/i.test(trimmed)) {
        errors.avatar = "Avatar must be a valid HTTP or HTTPS URL.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setSuccessMessage("");
    try {
      const response = await userApi.updateProfile({
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar.trim(),
      });

      if (response.success && response.user) {
        setProfile(response.user);
        updateUser(response.user);
        setSuccessMessage("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (err) {
      setFormErrors({ submit: err.message || "Failed to update profile." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        avatar: profile.avatar || "",
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  if (isLoading) {
    return <Loading message="Loading profile information..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Could Not Load Profile"
        message={error}
        onRetry={fetchProfile}
      />
    );
  }

  const effectiveUser = profile || authUser;
  const formattedJoinedDate = effectiveUser?.createdAt
    ? new Date(effectiveUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Member";

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
            Account Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Manage your personal information, public biography, and author credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/my-articles">
            <Button variant="outline" size="sm" className="gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              My Articles
            </Button>
          </Link>
          <Link to="/articles/create">
            <Button variant="primary" size="sm" className="gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Write Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Cover / Header Accent */}
        <div className="h-28 sm:h-32 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 relative">
          <div className="absolute top-3 right-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs border border-white/30">
              {effectiveUser?.role === "admin" ? "Platform Administrator" : "Author & Reader"}
            </span>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          {/* Avatar and Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
            {/* Avatar with fallback */}
            <div className="relative">
              {effectiveUser?.avatar && !avatarLoadError ? (
                <img
                  src={effectiveUser.avatar}
                  alt={effectiveUser.name}
                  onError={() => setAvatarLoadError(true)}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-md bg-white dark:bg-slate-900"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-white text-3xl sm:text-4xl font-extrabold uppercase select-none">
                  {effectiveUser?.name ? effectiveUser.name.charAt(0) : "U"}
                </div>
              )}
            </div>

            {/* Edit / View Toggle */}
            {!isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsEditing(true)}
                className="gap-2 self-start sm:self-end border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleCancelEdit}
                className="self-start sm:self-end text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel Editing
              </Button>
            )}
          </div>

          {/* User Details / Form Display */}
          {!isEditing ? (
            <div className="space-y-6">
              {/* Names and Email */}
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {effectiveUser?.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    @{effectiveUser?.name?.toLowerCase().replace(/\s+/g, "") || "user"}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {effectiveUser?.email}
                </p>
              </div>

              {/* Bio Section */}
              <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  About & Biography
                </h3>
                {effectiveUser?.bio ? (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {effectiveUser.bio}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    No biography provided yet. Click "Edit Profile" to share details about your background, projects, and interests.
                  </p>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Member Since
                  </span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formattedJoinedDate}</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Platform Role
                  </span>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {effectiveUser?.role || "User"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Published Articles
                  </span>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {effectiveUser?.articlesCount !== undefined ? effectiveUser.articlesCount : "—"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Profile Form */
            <form onSubmit={handleProfileSubmit} className="space-y-6 pt-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Edit Profile Details
              </h3>

              {formErrors.submit && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  {formErrors.submit}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Username / Display Name"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Alex Johnson"
                  error={formErrors.name}
                  helperText="Your public display name across DevStory."
                  required
                />

                <Input
                  label="Email Address (Read-Only)"
                  id="email"
                  name="email"
                  value={effectiveUser?.email || ""}
                  disabled
                  helperText="Email is tied to your account login and remains read-only."
                />

                <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="shrink-0">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Preview:</span>
                    {formData.avatar && !avatarLoadError ? (
                      <img
                        src={formData.avatar}
                        alt="Avatar Preview"
                        onError={() => setAvatarLoadError(true)}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 shadow-xs"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg border border-indigo-200 dark:border-indigo-800 shadow-xs">
                        {formData.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <Input
                      label="Avatar Image URL (Optional)"
                      id="avatar"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      placeholder="https://images.unsplash.com/..."
                      error={formErrors.avatar}
                      helperText="Paste a direct HTTP or HTTPS image URL for your profile picture."
                    />
                  </div>
                </div>
              </div>

              {/* Bio Field with Live Character Counter */}
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Bio (Max 250 characters)
                  </label>
                  <span className={`text-xs font-mono font-medium ${formData.bio.length > 250 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-slate-400"}`}>
                    {formData.bio.length} / 250
                  </span>
                </div>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell readers about yourself, your technical skills, or what you write about..."
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-hidden ${
                    formErrors.bio
                      ? "border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20"
                      : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-400"
                  }`}
                />
                {formErrors.bio && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{formErrors.bio}</p>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSaving}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
