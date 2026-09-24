import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { articleApi } from "../services/api.js";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Article title is required.";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long.";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Article content cannot be empty.";
    } else if (formData.content.trim().length < 20) {
      newErrors.content = "Article content should be at least 20 characters long.";
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Write a New Article
        </h1>
        <p className="text-sm text-slate-600">
          Share your ideas, tutorials, architectural insights, or engineering perspectives.
        </p>
      </div>

      {/* Server Error Alert */}
      {apiError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2">
          <svg className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6" noValidate>
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
            <label htmlFor="article-category" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="article-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="article-status" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Publication Status
            </label>
            <select
              id="article-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
          placeholder="https://images.unsplash.com/... (optional)"
          helperText="Leave empty to use the default featured graphic."
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
          <label htmlFor="article-excerpt" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Short Summary / Excerpt (Optional)
          </label>
          <textarea
            id="article-excerpt"
            name="excerpt"
            rows={2}
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="A brief summary displayed on the card preview (auto-generated if left empty)..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="article-content" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Article Content <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="article-content"
            name="content"
            rows={10}
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your article content here. Use paragraphs with double line breaks..."
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white font-mono leading-relaxed focus:outline-hidden ${
              errors.content
                ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30"
                : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            }`}
          />
          {errors.content && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errors.content}</span>
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
            {formData.status === "draft" ? "Save Draft" : "Publish Article"}
          </Button>
        </div>
      </form>
    </div>
  );
}
