import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PenSquare,
  Sparkles,
  Tag,
  FileText,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  FolderOpen,
  Eye,
} from "lucide-react";
import { articleApi } from "../services/api.js";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import RichTextEditor from "../components/RichTextEditor.jsx";
import ImageUpload from "../components/ImageUpload.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

export default function CreateArticlePage() {
  const navigate = useNavigate();

  useDocumentMeta({
    title: "Write an Article | DevStory",
    description: "Compose and publish a new engineering article on DevStory.",
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
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-xs">
          <PenSquare className="w-3.5 h-3.5" />
          Author Studio
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Write a New Article
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Share your ideas, tutorials, architectural insights, or engineering perspectives with the community.
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
          id="article-title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Scaling Microservices with Node.js & Event Queues"
          error={errors.title}
          required
        />

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="article-category" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="article-category"
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
            <label htmlFor="article-status" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              Publication Status
            </label>
            <select
              id="article-status"
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
          placeholder="Node.js, Express, Architecture (comma separated)"
          icon={<Tag className="w-4 h-4" />}
        />

        {/* Excerpt */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="article-excerpt" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            Short Summary / Excerpt (Optional)
          </label>
          <textarea
            id="article-excerpt"
            name="excerpt"
            rows={2}
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="A brief summary displayed on the card preview (auto-generated if left empty)..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
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
            <span>{formData.status === "draft" ? "Save Draft" : "Publish Article"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
