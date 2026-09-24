import React from "react";
import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  if (!article) return null;

  const {
    _id,
    id,
    title,
    excerpt,
    content = "",
    author = { name: "Author", avatar: "" },
    category = "General",
    createdAt,
    date,
    readTime,
    thumbnail = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
    slug,
    viewCount = 0,
    status = "published",
  } = article;

  const articlePath = `/articles/${slug || _id || id}`;

  // Formatted publication date
  const displayDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : date || "Recently";

  // Estimated read time
  const calculatedReadTime =
    readTime ||
    `${Math.max(1, Math.ceil((content.split(/\s+/).length || 100) / 200))} min read`;

  // Dynamic category badge colors
  const categoryColors = {
    Technology: "bg-cyan-50 text-cyan-700 border-cyan-200",
    React: "bg-cyan-50 text-cyan-700 border-cyan-200",
    "Node.js": "bg-emerald-50 text-emerald-700 border-emerald-200",
    Database: "bg-amber-50 text-amber-700 border-amber-200",
    Architecture: "bg-purple-50 text-purple-700 border-purple-200",
    Design: "bg-pink-50 text-pink-700 border-pink-200",
    Productivity: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Lifestyle: "bg-orange-50 text-orange-700 border-orange-200",
  };

  const badgeClass =
    categoryColors[category] || "bg-indigo-50 text-indigo-700 border-indigo-200";

  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden">
      {/* Featured Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${badgeClass}`}
          >
            {category}
          </span>
          {status === "draft" && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
              Draft
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-6">
        {/* Meta Header */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-medium">
          <span>{displayDate}</span>
          <span>•</span>
          <span>{calculatedReadTime}</span>
          {viewCount > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-slate-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {viewCount}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2.5">
          <Link to={articlePath}>{title}</Link>
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-6 flex-1">
          {excerpt}
        </p>

        {/* Footer info: Author and Read More link */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold uppercase">
              {author?.name ? author.name.charAt(0) : "A"}
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {author?.name || "Anonymous"}
            </span>
          </div>

          <Link
            to={articlePath}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-0.5 transition-all"
          >
            <span>Read Article</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
