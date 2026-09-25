import React from "react";
import { Link } from "react-router-dom";
import NewsletterForm from "./NewsletterForm.jsx";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span>Dev<span className="text-indigo-400">Story</span></span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A modern engineering journal exploring full-stack architecture, React patterns, Express REST APIs, and MongoDB database modeling.
            </p>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-indigo-400 rounded-md border border-slate-700">React 19</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-emerald-400 rounded-md border border-slate-700">Node / Express</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-amber-400 rounded-md border border-slate-700">MongoDB Atlas</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/articles" className="hover:text-white transition-colors">All Articles</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About DevStory</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription in Footer */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-2">Newsletter</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get our weekly articles and engineering updates delivered directly to your inbox.
            </p>
            <NewsletterForm source="website_footer" variant="compact" />
          </div>
        </div>

        {/* Copyright divider */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} DevStory. Built with React, Tailwind CSS, Express, and MongoDB.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
