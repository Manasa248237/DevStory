import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../layouts/Layout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Page Components
import HomePage from "../pages/HomePage.jsx";
import AboutPage from "../pages/AboutPage.jsx";
import ArticlesPage from "../pages/ArticlesPage.jsx";
import ArticleDetailPage from "../pages/ArticleDetailPage.jsx";
import CreateArticlePage from "../pages/CreateArticlePage.jsx";
import EditArticlePage from "../pages/EditArticlePage.jsx";
import MyArticlesPage from "../pages/MyArticlesPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import SignupPage from "../pages/SignupPage.jsx";
import ContactPage from "../pages/ContactPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        {/* Protected Routes (Authenticated Users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/articles/create" element={<CreateArticlePage />} />
          <Route path="/articles/edit/:idOrSlug" element={<EditArticlePage />} />
          <Route path="/my-articles" element={<MyArticlesPage />} />
        </Route>

        {/* Public Dynamic Article Detail Route */}
        <Route path="/articles/:idOrSlug" element={<ArticleDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
