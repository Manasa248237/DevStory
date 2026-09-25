import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { articleApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";

export default function EditArticlePage() {
  const { idOrSlug } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

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
        setLoadError(err.message || "Failed to load article data for editing.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [idOrSlug, user, isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Article title is required.";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long.";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Article content cannot be empty.";
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
        navigate(`/articles/${response.article.slug || response.article._id}`);
      }
    } catch (err) {
      setApiError(err.message || "Failed to update article. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Loading article for editing..." fullScreen={false} />;
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6">
        <ErrorMessage title="Access Restricted" message={loadError} />
        <div className="text-center">
          <Button variant="primary" onClick={() => navigate("/articles")}>
            Return to Articles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Edit Article
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Make updates to your article, summary, categories, or publication status.
        </p>
      </div>

      {/* Server Error Alert */}
      {apiError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <svg className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6" noValidate>
        {/* Title */}
        <Input
          label="Article Title"
          id="article-title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
        />

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="article-category" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="article-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="article-status" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Publication Status
            </label>
            <select
              id="article-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="published">Published (Public)</option>
              <option value="draft">Draft (Private to Author)</option>
            </select>
          </div>
        </div>

        {/* Thumbnail URL */}
        <Input
          label="Featured Image URL"
          id="article-thumbnail"
          name="thumbnail"
          value={formData.thumbnail}
          onChange={handleChange}
        />

        {/* Tags */}
        <Input
          label="Tags"
          id="article-tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Node.js, React, Architecture (comma separated)"
        />

        {/* Excerpt */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="article-excerpt" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Short Summary / Excerpt
          </label>
          <textarea
            id="article-excerpt"
            name="excerpt"
            rows={2}
            value={formData.excerpt}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="article-content" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Article Content <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="article-content"
            name="content"
            rows={10}
            value={formData.content}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 font-mono leading-relaxed focus:outline-hidden ${
              errors.content
                ? "border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20"
                : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            }`}
          />
          {errors.content && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errors.content}</span>
            </p>
          )}
        </div>

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
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
