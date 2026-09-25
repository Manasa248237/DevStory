import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ArticleCard from "../components/ArticleCard.jsx";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Button from "../components/Button.jsx";
import Pagination from "../components/Pagination.jsx";
import { articleApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            Explore Stories
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Published Articles
          </h1>
          <p className="text-slate-600 text-base max-w-2xl leading-relaxed">
            Discover in-depth engineering guides, web development tutorials, and architectural insights.
          </p>
        </div>

        {isAuthenticated && (
          <Link to="/articles/create" className="shrink-0">
            <Button variant="primary" size="md" className="gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Write Article
            </Button>
          </Link>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by title, excerpt, or content..."
              aria-label="Search articles"
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50 hover:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search query"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <Button type="submit" variant="primary" size="md" className="shrink-0 gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleResetFilters}
              className="shrink-0 text-slate-600 hover:text-slate-900 border-slate-200"
            >
              Reset Filters
            </Button>
          )}
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 mt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
            Category:
          </span>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategorySelect(category)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === category
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30 scale-105"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Active Filter Summary Indicator */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Filtering by:</span>
              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60">
                  Category: {selectedCategory}
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("All")}
                    className="hover:text-indigo-900"
                    aria-label="Remove category filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {activeSearch && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60">
                  Search: "{activeSearch}"
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="hover:text-indigo-900"
                    aria-label="Remove search filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {!isLoading && (
                <span className="text-slate-400">
                  ({totalArticles} {totalArticles === 1 ? "article" : "articles"} found)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <Loading message="Loading latest articles..." />
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
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-2xl p-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-slate-800">
            {hasActiveFilters ? "No matching articles found" : "No articles available"}
          </h3>

          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {hasActiveFilters
              ? `We couldn't find any published articles matching your criteria ${
                  activeSearch ? `"${activeSearch}"` : ""
                } ${selectedCategory !== "All" ? `in category "${selectedCategory}"` : ""}. Try adjusting your keywords or clearing the filters.`
              : "No published articles have been posted yet. Be the first to share an article!"}
          </p>

          <div className="pt-2 flex justify-center gap-3">
            {hasActiveFilters ? (
              <Button variant="primary" size="md" onClick={handleResetFilters}>
                Reset All Filters
              </Button>
            ) : isAuthenticated ? (
              <Link to="/articles/create">
                <Button variant="primary" size="md">
                  Publish an Article Now
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button variant="primary" size="md">
                  Join and Write
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
