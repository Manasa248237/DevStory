import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  RotateCcw,
  PenSquare,
  Sparkles,
  Layers,
  FileQuestion,
  Filter,
} from "lucide-react";
import ArticleCard from "../components/ArticleCard.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Button from "../components/Button.jsx";
import Pagination from "../components/Pagination.jsx";
import { ArticleCardSkeleton } from "../components/ui/Skeleton.jsx";
import Badge from "../components/ui/Badge.jsx";
import { articleApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useDocumentMeta({
    title: selectedCategory !== "All" ? `${selectedCategory} Articles | DevStory` : "All Articles | DevStory",
    description: "Browse in-depth engineering guides, web development tutorials, and architectural insights.",
    type: "website",
  });

  const { isAuthenticated } = useAuth();
  const searchInputRef = useRef(null);
  const articlesContainerRef = useRef(null);
  const PAGE_LIMIT = 9;

  const categories = [
    "All",
    "Technology",
    "Architecture",
    "React",
    "Node.js",
    "Database",
    "Design",
    "Productivity",
    "General",
  ];

  const fetchArticles = async (category, search, page) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await articleApi.getAll({
        category,
        search,
        page,
        limit: PAGE_LIMIT,
      });

      if (response.success && Array.isArray(response.articles)) {
        setArticles(response.articles);
        setCurrentPage(response.page || 1);
        setTotalPages(response.totalPages || 1);
        setTotalArticles(response.total !== undefined ? response.total : response.articles.length);
      }
    } catch (err) {
      setError(err.message || "Failed to load articles.");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger search on query change or category change or page change
  useEffect(() => {
    fetchArticles(selectedCategory, activeSearch, currentPage);
  }, [selectedCategory, activeSearch, currentPage]);

  // Debounced auto-search when user types
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim() !== activeSearch) {
        setActiveSearch(searchQuery.trim());
        setCurrentPage(1);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery, activeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== activeSearch) {
      setActiveSearch(searchQuery.trim());
      setCurrentPage(1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
    setCurrentPage(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleCategorySelect = (category) => {
    if (category !== selectedCategory) {
      setSelectedCategory(category);
      setCurrentPage(1);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveSearch("");
    setSelectedCategory("All");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      if (articlesContainerRef.current) {
        articlesContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const hasActiveFilters = activeSearch !== "" || selectedCategory !== "All";

  return (
    <div ref={articlesContainerRef} className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Layers className="w-3.5 h-3.5" />
            Explore Stories
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Published Articles
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base max-w-2xl leading-relaxed">
            Discover in-depth engineering guides, web development tutorials, and architectural insights.
          </p>
        </div>

        {isAuthenticated && (
          <Link to="/articles/create" className="shrink-0">
            <Button variant="primary" size="md" className="gap-2 shadow-xs">
              <PenSquare className="w-4 h-4" />
              <span>Write Article</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Search & Filter Bar Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Search className="w-4.5 h-4.5" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by title, excerpt, or tech topic..."
              aria-label="Search articles"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search query"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button type="submit" variant="primary" size="md" className="shrink-0 gap-2">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleResetFilters}
              className="shrink-0 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </form>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Category:
          </div>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategorySelect(category)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === category
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30 scale-105"
                  : "bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Active Filter Summary Indicator */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Filtering by:</span>
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs">
                  Category: {selectedCategory}
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("All")}
                    className="hover:text-indigo-950 dark:hover:text-white font-bold"
                    aria-label="Remove category filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {activeSearch && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs">
                  Search: "{activeSearch}"
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="hover:text-indigo-950 dark:hover:text-white font-bold"
                    aria-label="Remove search filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {!isLoading && (
                <span className="text-slate-400 dark:text-slate-500">
                  ({totalArticles} {totalArticles === 1 ? "article" : "articles"} found)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold hover:underline cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <ArticleCardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <ErrorMessage
          title="Could Not Load Articles"
          message={error}
          onRetry={() => fetchArticles(selectedCategory, activeSearch, currentPage)}
        />
      ) : articles.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article._id || article.id} article={article} />
            ))}
          </div>

          {/* Pagination Navigation */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalArticles}
            limit={PAGE_LIMIT}
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto shadow-xs">
            <FileQuestion className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            {hasActiveFilters ? "No matching articles found" : "No articles available"}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {hasActiveFilters
              ? `We couldn't find any published articles matching your criteria ${
                  activeSearch ? `"${activeSearch}"` : ""
                } ${selectedCategory !== "All" ? `in category "${selectedCategory}"` : ""}. Try adjusting your keywords or clearing the filters.`
              : "No published articles have been posted yet. Be the first to share an article!"}
          </p>

          <div className="pt-2 flex justify-center gap-3">
            {hasActiveFilters ? (
              <Button variant="primary" size="md" onClick={handleResetFilters} className="gap-2">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </Button>
            ) : isAuthenticated ? (
              <Link to="/articles/create">
                <Button variant="primary" size="md" className="gap-2">
                  <PenSquare className="w-4 h-4" />
                  <span>Publish an Article Now</span>
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button variant="primary" size="md" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Join and Write</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
