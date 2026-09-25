import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
          About The Project
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About DevStory & The Architectural Journey
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          DevStory is a full-stack personal blogging web application engineered from scratch to explore, implement, and master modern web technologies.
        </p>
      </div>

      {/* Purpose Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Project Mission & Objectives</h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          The goal of building this application is to move beyond superficial tutorials and build a real, robust, end-to-end full-stack web application. By separating concerns cleanly between a high-performance React frontend and a structured Express backend backed by MongoDB Atlas, we explore software engineering principles used in production applications.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Component Modularization</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Designing reusable, accessible, and self-contained UI components using React and Tailwind CSS.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">RESTful API Architecture</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Implementing standard HTTP methods (GET, POST, PUT, DELETE), centralized error handling, and MVC patterns.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">NoSQL Modeling with Mongoose</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Schema validation, compound indexing, document referencing, population, and atomic updates.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Stateless Authentication</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Securing client-server communication using salted bcrypt hashing and JSON Web Tokens (JWT).
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Complete Technology Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60">
                <th className="py-3 px-4">Layer</th>
                <th className="py-3 px-4">Technology</th>
                <th className="py-3 px-4">Key Responsibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">Frontend View</td>
                <td className="py-3.5 px-4 text-indigo-600 dark:text-indigo-400 font-medium">React 19 & Vite</td>
                <td className="py-3.5 px-4">Fast bundling, reactive state, Virtual DOM rendering</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">Design System</td>
                <td className="py-3.5 px-4 text-cyan-600 dark:text-cyan-400 font-medium">Tailwind CSS v4</td>
                <td className="py-3.5 px-4">Responsive layouts, utility typography, zero runtime CSS</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">Client Routing</td>
                <td className="py-3.5 px-4 text-purple-600 dark:text-purple-400 font-medium">React Router DOM</td>
                <td className="py-3.5 px-4">Single-page navigation, nested layouts, protected routes</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">API Server</td>
                <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-medium">Node.js & Express.js</td>
                <td className="py-3.5 px-4">Route handling, middleware pipelines, CORS, error handling</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">Database</td>
                <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400 font-medium">MongoDB Atlas & Mongoose</td>
                <td className="py-3.5 px-4">Cloud storage, schema modeling, query pagination, indexing</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">Security</td>
                <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400 font-medium">JWT & bcryptjs</td>
                <td className="py-3.5 px-4">Password hashing, signed access tokens, route authorization</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center p-8 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl space-y-4">
        <h3 className="text-xl font-bold text-indigo-950 dark:text-indigo-200">Ready to explore the articles?</h3>
        <p className="text-sm text-indigo-700 dark:text-indigo-300 max-w-md mx-auto">
          Browse through our curated collection of technical articles and tutorials.
        </p>
        <Link to="/articles">
          <Button variant="primary">Explore Articles</Button>
        </Link>
      </div>
    </div>
  );
}
