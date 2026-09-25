import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Eye, ArrowUpRight } from "lucide-react";
import LikeButton from "./LikeButton.jsx";
import BookmarkButton from "./BookmarkButton.jsx";
import SpotlightCard from "./ui/SpotlightCard.jsx";
import Badge from "./ui/Badge.jsx";

export const DEFAULT_ARTICLE_THUMBNAIL =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80";

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
    thumbnail,
    slug,
    viewCount = 0,
    likesCount = 0,
    status = "published",
  } = article;

  const [imgSrc, setImgSrc] = useState(thumbnail || DEFAULT_ARTICLE_THUMBNAIL);

  useEffect(() => {
    setImgSrc(thumbnail || DEFAULT_ARTICLE_THUMBNAIL);
  }, [thumbnail]);

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
  const categoryVariants = {
    Technology: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/80",
    React: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/80",
    "Node.js": "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80",
    Database: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80",
    Architecture: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80",
    Design: "bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200/80 dark:border-pink-800/80",
    Productivity: "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/80",
    Lifestyle: "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/80",
  };

  const badgeClass =
    categoryVariants[category] ||
    "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/80";

  return (
    <SpotlightCard className="group flex flex-col hover:border-indigo-300/80 dark:hover:border-indigo-700/80 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
      {/* Featured Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800/60">
        <img
          src={imgSrc}
          alt={title || "Article thumbnail"}
          onError={() => setImgSrc(DEFAULT_ARTICLE_THUMBNAIL)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs backdrop-blur-md ${badgeClass}`}
          >
            {category}
          </span>
          {status === "draft" && (
            <Badge variant="warning" className="uppercase text-[10px] font-extrabold tracking-wider">
              Draft
            </Badge>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-6">
        {/* Meta Header */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {displayDate}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {calculatedReadTime}
          </span>
          {viewCount > 0 && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500">
                <Eye className="w-3.5 h-3.5" />
                {viewCount}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2.5">
          <Link to={articlePath} className="focus:outline-none">
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-slate-600 dark:text-slate-300/90 line-clamp-3 leading-relaxed mb-6 flex-1">
          {excerpt}
        </p>

        {/* Card Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-auto gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {author?.avatar ? (
              <img
                src={author.avatar}
                alt={author.name || "Author"}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0 shadow-xs">
                {author?.name ? author.name.charAt(0) : "A"}
              </div>
            )}
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
              {author?.name || "Anonymous"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <LikeButton
              articleId={slug || _id || id}
              initialLikesCount={likesCount}
              size="sm"
            />
            <BookmarkButton
              articleId={slug || _id || id}
              size="sm"
            />
            <Link
              to={articlePath}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group-hover:translate-x-0.5 transition-all pl-1.5"
              aria-label={`Read article: ${title}`}
            >
              <span>Read</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
