import React from "react";
import { Link } from "react-router-dom";
import {
  Info,
  Layers,
  Globe,
  Database,
  ShieldCheck,
  Terminal,
  ArrowRight,
  Cpu,
  GitBranch,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Button from "../components/Button.jsx";
import SpotlightCard from "../components/ui/SpotlightCard.jsx";
import Badge from "../components/ui/Badge.jsx";
import GridPattern from "../components/ui/GridPattern.jsx";

export default function AboutPage() {
  const techStack = [
    {
      layer: "Frontend View",
      tech: "React 19 & Vite",
      badgeVariant: "default",
      responsibility: "Fast reactive rendering, custom hooks & Context state management",
    },
    {
      layer: "Design System",
      tech: "Tailwind CSS v4",
      badgeVariant: "secondary",
      responsibility: "Utility-first responsive styling, zero-runtime CSS tokens & dark theme",
    },
    {
      layer: "Client Routing",
      tech: "React Router DOM v7",
      badgeVariant: "default",
      responsibility: "Declarative SPA routing, nested page layouts & auth protection guards",
    },
    {
      layer: "API Server",
      tech: "Node.js & Express.js",
      badgeVariant: "success",
      responsibility: "RESTful MVC routes, error handling middleware, sanitization & CORS",
    },
    {
      layer: "Database",
      tech: "MongoDB Atlas & Mongoose",
      badgeVariant: "warning",
      responsibility: "NoSQL document modeling, indexing, pagination & atomic increments",
    },
    {
      layer: "Security & Auth",
      tech: "JWT & bcryptjs",
      badgeVariant: "destructive",
      responsibility: "Salted password hashing, stateless signed tokens & role verification",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Header with Grid Pattern */}
      <div className="relative text-center space-y-4 pt-2">
        <GridPattern className="opacity-60" />
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-xs">
          <Info className="w-3.5 h-3.5" />
          About The Platform
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          About DevStory & The Engineering Vision
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          DevStory is a full-stack personal blogging web application engineered from scratch to explore, implement, and master modern web architecture.
        </p>
      </div>

      {/* Purpose Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Project Mission & Core Principles
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            The goal of building this application is to move beyond superficial tutorials and build a real, robust, end-to-end full-stack web application. By separating concerns cleanly between a high-performance React frontend and a structured Express backend backed by MongoDB Atlas, we explore software engineering principles used in production applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <SpotlightCard className="p-5 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              Component Modularization
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300/90 leading-relaxed">
              Designing reusable, accessible, and self-contained UI components using React 19 and Tailwind CSS v4 design systems.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-5 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              RESTful API Architecture
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300/90 leading-relaxed">
              Standard HTTP methods (GET, POST, PUT, DELETE), centralized error middleware pipelines, and structured controllers.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-5 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              NoSQL Modeling with Mongoose
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300/90 leading-relaxed">
              Schema validation, compound indexing, document referencing, populate queries, and atomic counter updates.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-5 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              Stateless Authentication
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300/90 leading-relaxed">
              Securing client-server communication using salted bcrypt password hashing and signed JSON Web Tokens (JWT).
            </p>
          </SpotlightCard>
        </div>
      </div>

      {/* Tech Stack Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <GitBranch className="w-3.5 h-3.5" />
            Full Architecture
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Complete Technology Stack
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60">
                <th className="py-3.5 px-4">Layer</th>
                <th className="py-3.5 px-4">Technology</th>
                <th className="py-3.5 px-4">Key Responsibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {techStack.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item.layer}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    <Badge variant={item.badgeVariant}>{item.tech}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.responsibility}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center p-8 sm:p-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/80 rounded-3xl space-y-4 shadow-xs">
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Ready to explore the articles?
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          Browse through our curated collection of technical articles, deep dives, and tutorials.
        </p>
        <div className="pt-2 flex justify-center">
          <Link to="/articles">
            <Button variant="primary" size="lg" className="gap-2 shadow-md">
              <span>Explore All Articles</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
