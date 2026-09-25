import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  BookOpen,
  PenSquare,
  Bookmark,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Sparkles,
  FileText,
  Mail,
  Info,
  Home,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import Button from "./Button.jsx";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Articles", path: "/articles", icon: FileText },
    { name: "About", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight text-slate-900 dark:text-white group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 group-hover:shadow-indigo-500/30 transition-all duration-200">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-slate-900 dark:text-white font-extrabold tracking-tight text-lg">
              Dev<span className="text-indigo-600 dark:text-indigo-400">Story</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/50 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {isAuthenticated && (
              <>
                <NavLink
                  to="/my-articles"
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/50 font-semibold shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                    }`
                  }
                >
                  My Articles
                </NavLink>
                <NavLink
                  to="/bookmarks"
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/50 font-semibold shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                    }`
                  }
                >
                  Bookmarks
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        isActive
                          ? "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 shadow-xs"
                          : "text-amber-600 dark:text-amber-400 hover:bg-amber-50/80 dark:hover:bg-amber-950/30"
                      }`
                    }
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </NavLink>
                )}
              </>
            )}
          </nav>

          {/* Auth & Theme Action Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <Link to="/articles/create">
                  <Button size="sm" variant="primary" className="gap-1.5 shadow-xs">
                    <PenSquare className="w-3.5 h-3.5" />
                    <span>Write</span>
                  </Button>
                </Link>

                <Link
                  to="/profile"
                  title="View Profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer group shadow-xs"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                      {user?.name ? user.name.charAt(0) : "U"}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {user?.name}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm" className="gap-1.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Get Started</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: ThemeToggle + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle size="sm" />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 animate-fadeIn">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}

            {isAuthenticated && (
              <>
                <NavLink
                  to="/my-articles"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`
                  }
                >
                  <FileText className="w-4 h-4" />
                  <span>My Articles</span>
                </NavLink>
                <NavLink
                  to="/bookmarks"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`
                  }
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Bookmarks</span>
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`
                  }
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                        isActive
                          ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 font-semibold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`
                    }
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Area</span>
                  </NavLink>
                )}
                <NavLink
                  to="/articles/create"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`
                  }
                >
                  <PenSquare className="w-4 h-4" />
                  <span>Write Article</span>
                </NavLink>
              </>
            )}
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="flex flex-col truncate">
                    <span className="text-slate-900 dark:text-white font-bold">{user?.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal text-[11px]">{user?.email}</span>
                  </div>
                </Link>
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="outline" size="md" fullWidth>
                    Sign In
                  </Button>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="primary" size="md" fullWidth className="gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Get Started</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
