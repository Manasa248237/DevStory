import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ArticleCard from "../components/ArticleCard.jsx";
import Button from "../components/Button.jsx";
import Loading from "../components/Loading.jsx";
import NewsletterForm from "../components/NewsletterForm.jsx";
import { articleApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoading(true);
      try {
        const response = await articleApi.getAll();
        if (response.success && response.articles) {
          setFeaturedArticles(response.articles.slice(0, 3));
        }
      } catch (err) {
        console.warn("Could not load featured articles:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-xs">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          Full-Stack Personal Engineering Journal
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Explore Ideas, Code, and{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
            Modern Web Architecture
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A dedicated space documenting practical learnings in React 19, Tailwind CSS, Express REST APIs, and MongoDB Atlas database design.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link to="/articles">
            <Button size="lg" variant="primary" className="w-full sm:w-auto">
              Browse All Articles
            </Button>
          </Link>
          {isAuthenticated ? (
            <Link to="/articles/create">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Write an Article
              </Button>
            </Link>
          ) : (
            <Link to="/signup">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Join the Community
              </Button>
            </Link>
          )}
        </div>

        {/* Key Features Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-200/80 text-left">
          <div className="p-4 rounded-xl bg-white border border-slate-200/60 shadow-xs">
            <div className="text-indigo-600 font-bold text-lg mb-1">React 19</div>
            <p className="text-xs text-slate-500">Component architecture, custom hooks & Context</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200/60 shadow-xs">
            <div className="text-emerald-600 font-bold text-lg mb-1">Express API</div>
            <p className="text-xs text-slate-500">RESTful routes, controllers & middleware</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200/60 shadow-xs">
            <div className="text-amber-600 font-bold text-lg mb-1">MongoDB</div>
            <p className="text-xs text-slate-500">Mongoose models, indexing & aggregation</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200/60 shadow-xs">
            <div className="text-purple-600 font-bold text-lg mb-1">JWT Auth</div>
            <p className="text-xs text-slate-500">Secure tokens & bcrypt password hashing</p>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Curated Highlights
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Articles</h2>
          </div>
          <Link
            to="/articles"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            <span>View all articles</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <Loading message="Loading featured articles..." />
        ) : featuredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <ArticleCard key={article._id || article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-6">
            <p className="text-sm text-slate-500">No articles published yet. Publish an article to feature it here!</p>
          </div>
        )}
      </section>

      {/* Newsletter Subscription Teaser Box */}
      <section className="rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
            Stay Updated
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Subscribe to our weekly engineering dispatch
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Get practical tutorials on full-stack architecture, clean code practices, and modern web development delivered directly to your inbox.
          </p>
          <div className="pt-2">
            <NewsletterForm source="website_homepage" variant="card" />
          </div>
        </div>
      </section>
    </div>
  );
}
