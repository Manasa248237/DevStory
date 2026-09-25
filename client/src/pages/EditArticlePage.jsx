import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Edit3,
  Tag,
  FileText,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { articleApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import RichTextEditor from "../components/RichTextEditor.jsx";
import ImageUpload from "../components/ImageUpload.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

export default function EditArticlePage() {
  const { idOrSlug } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useDocumentMeta({
    title: "Edit Article | DevStory",
    description: "Update article details, content formatting, and publication settings.",
    type: "website",
  });

  const [formData, setFormData] = useState({
    title: "",
    category: "Technology",
    tags: "",
    thumbnail: "",
    excerpt: "",
    content: "",
    status: "published",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const categories = [
    "Technology",
    "Architecture",
    "React",
    "Node.js",
    "Database",
    "Design",
    "Productivity",
    "General",
  ];

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        const response = await articleApi.getByIdOrSlug(idOrSlug);
        if (response.success && response.article) {
          const art = response.article;

          // Check authorization
          const isAuthor = user && art.author && String(user.id || user._id) === String(art.author._id || art.author);
          if (!isAuthor && !isAdmin) {
            setLoadError("You are not authorized to edit this article.");
            setIsLoading(false);
            return;
          }

          setFormData({
            title: art.title || "",
            category: art.category || "General",
            tags: Array.isArray(art.tags) ? art.tags.join(", ") : art.tags || "",
            thumbnail: art.thumbnail || "",
            excerpt: art.excerpt || "",
            content: art.content || "",
            status: art.status || "published",
          });
        }
      } catch (err) {
        setLoadError(err.message || "Failed to load article for editing.");
      } finally {
        setIsLoading(false);
      }
    };

    if (idOrSlug) {
      fetchArticle();
    }
  }, [idOrSlug, user, isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
  };

  const handleThumbnailChange = (url) => {
    setFormData((prev) => ({ ...prev, thumbnail: url }));
    if (apiError) setApiError("");
  };

  const handleContentChange = (htmlContent) => {
    setFormData((prev) => ({ ...prev, content: htmlContent }));
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: "" }));
    }
    if (apiError) setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Article title is required.";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long.";
    }

    const plainTextContent = (formData.content || "").replace(/<[^>]*>/gm, "").trim();
    if (!plainTextContent) {
      newErrors.content = "Article content cannot be empty.";
    } else if (plainTextContent.length < 20) {
      newErrors.content = "Article content should contain at least 20 characters of text.";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const response = await articleApi.update(idOrSlug, payload);
      if (response.success && response.article) {
        navigate(`/articles/${response.article.slug || response.article._id || idOrSlug}`);
      }
    } catch (err) {
      setApiError(err.message || "Failed to update article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Loading article for editing..." fullScreen={false} />;
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-6">
        <ErrorMessage
          title="Access Restricted"
          message={loadError}
        />
        <div className="text-center">
          <Button variant="primary" onClick={() => navigate("/articles")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Articles</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-xs">
          <Edit3 className="w-3.5 h-3.5" />
          Editor
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Edit Article
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Update your article content, category classification, thumbnail, and publication status.
        </p>
      </div>

      {/* Server Error Alert */}
      {apiError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6" noValidate>
        {/* Title */}
        <Input
          label="Article Title"
          id="edit-article-title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Article title"
          error={errors.title}
          required
        />

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="edit-article-category" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="edit-article-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="edit-article-status" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              Publication Status
            </label>
            <select
              id="edit-article-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
            >
              <option value="published">Published (Public)</option>
              <option value="draft">Draft (Private to Author)</option>
            </select>
          </div>
        </div>

        {/* Featured Image / Thumbnail Upload */}
        <ImageUpload
          label="Featured Image / Thumbnail"
          id="edit-article-thumbnail"
          value={formData.thumbnail}
          onChange={handleThumbnailChange}
          helperText="Upload JPG, PNG, WebP or GIF (max 5MB), or paste a URL."
          disabled={isSubmitting}
        />

        {/* Tags */}
        <Input
          label="Tags"
          id="edit-article-tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Node.js, Express, Architecture (comma separated)"
          icon={<Tag className="w-4 h-4" />}
        />

        {/* Excerpt */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="edit-article-excerpt" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            Short Summary / Excerpt (Optional)
          </label>
          <textarea
            id="edit-article-excerpt"
            name="excerpt"
            rows={2}
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="A brief summary displayed on the card preview..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
          />
        </div>

        {/* Rich Text Editor Content */}
        <RichTextEditor
          label="Article Content"
          id="edit-article-content"
          value={formData.content}
          onChange={handleContentChange}
          placeholder="Write your article content here..."
          error={errors.content}
          required
          minHeight="min-h-[320px]"
          disabled={isSubmitting}
        />

        {/* Action buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="gap-2 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
