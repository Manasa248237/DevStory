import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Heart } from "lucide-react";
import NewsletterForm from "./NewsletterForm.jsx";
import Badge from "./ui/Badge.jsx";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-white font-extrabold text-xl group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span>
                Dev<span className="text-indigo-400">Story</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A modern engineering journal exploring full-stack architecture, React patterns, Express REST APIs, and MongoDB database modeling.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-indigo-300 rounded-lg border border-slate-700/80">
                React 19
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-emerald-300 rounded-lg border border-slate-700/80">
                Node / Express
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-amber-300 rounded-lg border border-slate-700/80">
                MongoDB Atlas
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-cyan-300 rounded-lg border border-slate-700/80">
                Tailwind v4
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/articles" className="hover:text-white transition-colors">
                  All Articles
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About DevStory
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription in Footer */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
              Engineering Dispatch
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get our weekly articles and engineering updates delivered directly to your inbox.
            </p>
            <NewsletterForm source="website_footer" variant="compact" />
          </div>
        </div>

        {/* Copyright divider */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="flex items-center gap-1">
            © {currentYear} DevStory. Crafted with{" "}
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20 inline" /> for modern developers.
          </p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              Architecture Docs
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
