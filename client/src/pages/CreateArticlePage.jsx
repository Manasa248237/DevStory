import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { articleApi } from "../services/api.js";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import RichTextEditor from "../components/RichTextEditor.jsx";
import ImageUpload from "../components/ImageUpload.jsx";

export default function CreateArticlePage() {
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

    // Strip HTML tags and whitespace to verify actual content length
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

      const response = await articleApi.create(payload);
      if (response.success && response.article) {
        navigate(`/articles/${response.article.slug || response.article._id}`);
      }
    } catch (err) {
      setApiError(err.message || "Failed to create article. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Write a New Article
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Share your ideas, tutorials, architectural insights, or engineering perspectives.
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
          placeholder="e.g., Scaling Microservices with Node.js & RabbitMQ"
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

        {/* Featured Image / Thumbnail Upload */}
        <ImageUpload
          label="Featured Image / Thumbnail"
          id="article-thumbnail"
          value={formData.thumbnail}
          onChange={handleThumbnailChange}
          helperText="Upload JPG, PNG, WebP or GIF (max 5MB), or paste a URL."
          disabled={isSubmitting}
        />

        {/* Tags */}
        <Input
          label="Tags"
          id="article-tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Node.js, Express, MongoDB (comma separated)"
        />

        {/* Excerpt */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="article-excerpt" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Short Summary / Excerpt (Optional)
          </label>
          <textarea
            id="article-excerpt"
            name="excerpt"
            rows={2}
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="A brief summary displayed on the card preview (auto-generated if left empty)..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Rich Text Editor Content */}
        <RichTextEditor
          label="Article Content"
          id="article-content"
          value={formData.content}
          onChange={handleContentChange}
          placeholder="Write your article content here. Format headings, code blocks, lists, quotes, and links using the toolbar..."
          error={errors.content}
          required
          minHeight="min-h-[300px]"
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
          >
            {formData.status === "draft" ? "Save Draft" : "Publish Article"}
          </Button>
        </div>
      </form>
    </div>
  );
}
