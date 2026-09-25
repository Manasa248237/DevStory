import React from "react";
import { Link } from "react-router-dom";
import { Compass, Home, ArrowLeft, Search } from "lucide-react";
import Button from "../components/Button.jsx";
import { GridPattern } from "../components/ui/GridPattern.jsx";
import { ShinyText } from "../components/ui/ShinyText.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

export default function NotFoundPage() {
  useDocumentMeta({
    title: "404 - Page Not Found | DevStory",
    description: "The page you requested could not be found on DevStory.",
  });

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-16 overflow-hidden">
      <GridPattern className="opacity-40" />

      <div className="relative z-10 text-center max-w-lg mx-auto space-y-6">
        {/* Glow & 404 Badge */}
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-200 dark:border-indigo-800/80 backdrop-blur-md flex items-center justify-center mx-auto shadow-xl">
            <span className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
              404
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Lost in Cyberspace?
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
            The page you're looking for doesn't exist, was renamed, or has been archived into another dimension.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="primary" size="md" className="gap-2 shadow-md shadow-indigo-500/20">
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Button>
          </Link>
          <Link to="/articles">
            <Button variant="outline" size="md" className="gap-2">
              <Compass className="w-4 h-4" />
              <span>Explore Articles</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
