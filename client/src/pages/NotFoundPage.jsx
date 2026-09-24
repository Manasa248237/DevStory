import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="text-center py-16 sm:py-24 max-w-lg mx-auto space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto shadow-xs font-black text-3xl">
        404
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          The page you are looking for doesn't exist, has been moved, or is under construction.
        </p>
      </div>

      <div className="pt-2">
        <Link to="/">
          <Button variant="primary" size="md">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
