import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ArticleCard from "../components/ArticleCard.jsx";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Button from "../components/Button.jsx";
import { articleApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

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

  const fetchArticles = async (category) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await articleApi.getAll({ category });
      if (response.success && response.articles) {
        setArticles(response.articles);
      }
    } catch (err) {
      setError(err.message || "Failed to load articles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="space-y-10 py-4">
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

      {/* Category Pills Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === category
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 scale-105"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <Loading message="Loading latest articles..." />
      ) : error ? (
        <ErrorMessage
          title="Could Not Load Articles"
          message={error}
          onRetry={() => fetchArticles(selectedCategory)}
        />
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article._id || article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">No articles available</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {selectedCategory === "All"
              ? "No published articles have been posted yet. Be the first to share an article!"
              : `No published articles found in category "${selectedCategory}".`}
          </p>
          {isAuthenticated ? (
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
      )}
    </div>
  );
}
