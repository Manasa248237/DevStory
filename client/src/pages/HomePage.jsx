import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  PenSquare,
  Sparkles,
  Code2,
  Server,
  Database,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import ArticleCard from "../components/ArticleCard.jsx";
import Button from "../components/Button.jsx";
import NewsletterForm from "../components/NewsletterForm.jsx";
import { ArticleCardSkeleton } from "../components/ui/Skeleton.jsx";
import GridPattern from "../components/ui/GridPattern.jsx";
import ShinyText from "../components/ui/ShinyText.jsx";
import SpotlightCard from "../components/ui/SpotlightCard.jsx";
import { articleApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

export default function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useDocumentMeta({
    title: "DevStory | Personal Tech Blog & Engineering Journal",
    description:
      "Explore ideas, code, and modern web architecture with practical guides in React 19, Tailwind CSS, Express REST APIs, and MongoDB.",
    type: "website",
  });

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
      {/* Hero Section with GridPattern Background */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8">
        <GridPattern className="opacity-70" />

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
          <ShinyText className="text-xs font-bold uppercase tracking-wider">
            Full-Stack Engineering Journal
          </ShinyText>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
          Explore Ideas, Code, and{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400">
            Modern Web Architecture
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          A dedicated space documenting practical learnings in React 19, Tailwind CSS, Express REST APIs, and MongoDB Atlas database design.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link to="/articles" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2 shadow-md">
              <span>Browse All Articles</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          {isAuthenticated ? (
            <Link to="/articles/create" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                <PenSquare className="w-4 h-4" />
                <span>Write an Article</span>
              </Button>
            </Link>
          ) : (
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Join the Community</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Key Features Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-200/80 dark:border-slate-800 text-left">
          <SpotlightCard className="p-4.5 bg-white/80 dark:bg-slate-900/80">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Code2 className="w-4.5 h-4.5" />
            </div>
            <div className="text-slate-900 dark:text-white font-bold text-base mb-1">React 19</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Component architecture, custom hooks & Context state
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-4.5 bg-white/80 dark:bg-slate-900/80">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Server className="w-4.5 h-4.5" />
            </div>
            <div className="text-slate-900 dark:text-white font-bold text-base mb-1">Express API</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              RESTful routes, controllers & secure middleware
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-4.5 bg-white/80 dark:bg-slate-900/80">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div className="text-slate-900 dark:text-white font-bold text-base mb-1">MongoDB</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Mongoose models, indexing & aggregation queries
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-4.5 bg-white/80 dark:bg-slate-900/80">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div className="text-slate-900 dark:text-white font-bold text-base mb-1">JWT Auth</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Signed token sessions & bcrypt password hashing
            </p>
          </SpotlightCard>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-3.5 h-3.5" />
              Curated Highlights
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured Articles
            </h2>
          </div>
          <Link
            to="/articles"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline group"
          >
            <span>View all articles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Articles Grid / Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </div>
        ) : featuredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <ArticleCard key={article._id || article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No articles published yet. Publish an article to feature it here!
            </p>
          </div>
        )}
      </section>

      {/* Newsletter Subscription Teaser Box */}
      <section className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-8 sm:p-12 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        {/* Ambient radial glow */}
        <div
          className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
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
