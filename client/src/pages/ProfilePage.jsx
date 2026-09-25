import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Calendar,
  FileText,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  BookOpen,
  Plus,
  Camera,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { userApi } from "../services/api.js";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { SpotlightCard } from "../components/ui/SpotlightCard.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

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

  useDocumentMeta({
    title: "User Profile | DevStory",
    description: "Manage your DevStory author profile, biography, and credentials.",
  });

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
            <Sparkles className="w-3.5 h-3.5" />
            <span>Account Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Manage your personal profile, public biography, and author credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/my-articles">
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText className="w-4 h-4" />
              <span>My Articles</span>
            </Button>
          </Link>
          <Link to="/articles/create">
            <Button variant="primary" size="sm" className="gap-1.5 shadow-md shadow-indigo-500/20">
              <Plus className="w-4 h-4" />
              <span>Write Article</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white font-bold text-xs p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Profile Card */}
      <SpotlightCard className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        {/* Cover / Header Accent */}
        <div className="h-32 sm:h-36 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute top-4 right-4">
            <Badge
              variant={effectiveUser?.role === "admin" ? "primary" : "secondary"}
              className="text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-white/20 text-white border-white/30"
            >
              {effectiveUser?.role === "admin" ? "Platform Administrator" : "Author & Reader"}
            </Badge>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          {/* Avatar and Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-18 mb-6">
            {/* Avatar with fallback */}
            <div className="relative group">
              {effectiveUser?.avatar && !avatarLoadError ? (
                <img
                  src={effectiveUser.avatar}
                  alt={effectiveUser.name}
                  onError={() => setAvatarLoadError(true)}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-xl bg-white dark:bg-slate-900"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center text-white text-4xl font-extrabold uppercase select-none">
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
                className="gap-2 self-start sm:self-end"
              >
                <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleCancelEdit}
                className="self-start sm:self-end text-slate-500 dark:text-slate-400"
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
                  <Badge variant="secondary" className="text-xs">
                    @{effectiveUser?.name?.toLowerCase().replace(/\s+/g, "") || "user"}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>{effectiveUser?.email}</span>
                </p>
              </div>

              {/* Bio Section */}
              <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  About & Biography
                </h3>
                {effectiveUser?.bio ? (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {effectiveUser.bio}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                    No biography provided yet. Click "Edit Profile" to share details about your background, expertise, and projects.
                  </p>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Member Since</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formattedJoinedDate}</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Platform Role</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {effectiveUser?.role || "User"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Published Articles</span>
                  </div>
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
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formErrors.submit}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Display Name"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Alex Johnson"
                  error={formErrors.name}
                  helperText="Your public display name across DevStory."
                  startIcon={<User className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Email Address (Read-Only)"
                  id="email"
                  name="email"
                  value={effectiveUser?.email || ""}
                  disabled
                  helperText="Email is tied to your account login and remains read-only."
                  startIcon={<Mail className="w-4 h-4" />}
                />

                <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="shrink-0">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Avatar Preview:</span>
                    {formData.avatar && !avatarLoadError ? (
                      <img
                        src={formData.avatar}
                        alt="Avatar Preview"
                        onError={() => setAvatarLoadError(true)}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 shadow-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xl border border-indigo-200 dark:border-indigo-800 shadow-xs">
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
                      helperText="Paste a direct image URL (Unsplash, Cloudinary, etc.)"
                      startIcon={<LinkIcon className="w-4 h-4" />}
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
                  placeholder="Tell readers about yourself, your technical stack, or what you write about..."
                  className={`w-full px-4 py-3 rounded-2xl border text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-hidden ${
                    formErrors.bio
                      ? "border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20"
                      : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-300 dark:hover:border-slate-700"
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
                  className="gap-2 shadow-md shadow-indigo-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </SpotlightCard>
    </div>
  );
}
