# DevStory | Project Progress Tracker

---

## 📊 Phase Status Overview

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | Project Setup & Architecture | ✅ **Completed & Verified** |
| **Phase 2** | Frontend Foundation (React 19 + Tailwind + Router) | ✅ **Completed & Verified** |
| **Phase 3** | Backend & MongoDB Atlas Setup (Express + Mongoose) | ✅ **Completed & Verified** |
| **Phase 4** | User Authentication (JWT + bcrypt + Protected Routes) | ✅ **Completed & Verified** |
| **Phase 5** | Blog Article Management (CRUD + MVC + Real React UI) | ✅ **Completed & Verified** |
| **Phase 6** | Search, Filtering & Pagination | ✅ **Completed & Verified** |
| **Phase 7** | User Profile & Edit Profile (Frontend + Backend) | ✅ **Completed & Verified** |
| **Phase 8** | Comments Feature (Frontend & Backend API) | ✅ **Completed & Verified** |
| **Phase 9** | Admin Dashboard & Moderation | ⏳ *Pending* |
| **Phase 10** | Testing & Final Documentation | ⏳ *Pending* |

---

## 🚀 Phase 4 Implementation Summary

### 1. Files Created & Updated
- `server/models/User.js`: Mongoose user schema with validation, pre-save `bcrypt` hashing hook, `comparePassword()` method, and `generateAuthToken()` JWT method.
- `server/middleware/authMiddleware.js`: `protect` middleware verifying Bearer tokens and `adminOnly` role guard.
- `server/controllers/authController.js`: `signup`, `signin`, and `getMe` handlers with input validation and password exclusion in safe responses.
- `server/routes/authRoutes.js`: Mounted `POST /signup`, `POST /signin`, and protected `GET /me`.
- `server/.env`: Added `JWT_SECRET` and `JWT_EXPIRES_IN`.
- `client/src/services/api.js`: Centralized API client with automatic `Authorization: Bearer <token>` attachment.
- `client/src/context/AuthContext.jsx`: React Context providing `user`, `token`, `isAuthenticated`, `isAdmin`, `login`, `signup`, and `logout`.
- `client/src/pages/LoginPage.jsx`: Real backend integration with `useAuth().login` and error handling.
- `client/src/pages/SignupPage.jsx`: Real backend integration with `useAuth().signup` and error handling.
- `client/src/components/Navbar.jsx`: Dynamic user badge, initial avatar, and sign out button for authenticated users.
- `client/src/routes/ProtectedRoute.jsx`: Client-side route guard checking authentication and admin permissions.
- `client/src/App.jsx`: Wrapped application with `<AuthProvider>`.

### 2. Dependencies Installed
```bash
# Server Auth Dependencies
npm install bcryptjs jsonwebtoken
```

### 3. API Endpoints Verified

| Method | Endpoint | Auth | Tested Status | Actual Result |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | 400 Bad Request | `{ "success": false, "message": "Please provide all required fields..." }` |
| `POST` | `/api/auth/signin` | Public | 400 Bad Request | `{ "success": false, "message": "Please provide both email and password." }` |
| `GET`  | `/api/auth/me`     | Private | 401 Unauthorized | `{ "success": false, "message": "Authentication required. Please provide a valid Bearer token." }` |

## 🚀 Phase 5 Implementation Summary

### 1. Files Created & Updated
- `server/models/Article.js`: Complete Article Mongoose schema with `title`, unique `slug`, `content`, `excerpt`, `thumbnail`, `category`, `tags`, `author` (ref: User), `status` (`draft` | `published`), `viewCount`, and timestamps. Includes auto-slug generator pre-validate hook with duplicate counter collision avoidance.
- `server/controllers/articleController.js`: Full CRUD controller methods (`createArticle`, `getAllArticles`, `getArticleByIdOrSlug`, `updateArticle`, `deleteArticle`, `getMyArticles`) with ownership & admin role checks, atomic view count increments, and populated author info.
- `server/routes/articleRoutes.js`: Clean REST endpoints (`GET /`, `GET /:idOrSlug`, `POST /`, `PUT /:idOrSlug`, `DELETE /:idOrSlug`, `GET /my-articles`) with JWT authorization middleware and correct route precedence.
- `client/src/services/api.js`: Added `articleApi` helper object for all CRUD operations, leveraging existing auto-Bearer token logic.
- `client/src/pages/HomePage.jsx`: Live backend integration fetching recent published articles with loading and error states.
- `client/src/pages/ArticlesPage.jsx`: Live backend integration displaying all published stories with interactive category filtering.
- `client/src/pages/ArticleDetailPage.jsx`: Full reader view with dynamic slug/ID routing, author profile cards, view count tracking, and author/admin edit & delete dialogs.
- `client/src/pages/CreateArticlePage.jsx`: Article creation studio with real-time excerpt calculation, category selection, tags, and draft/published mode.
- `client/src/pages/EditArticlePage.jsx`: Article editor pre-populated from backend with permission verification and change submission.
- `client/src/pages/MyArticlesPage.jsx`: Personal author dashboard listing all published and draft articles with quick edit and deletion.
- `client/src/components/ArticleCard.jsx`: Real data display with formatted publication dates, author avatar, views, and draft badge.
- `client/src/components/Navbar.jsx`: Added "Write" and "My Articles" navigation items for authenticated users.
- `client/src/routes/AppRoutes.jsx`: Registered all public and protected article routes.

### 2. API Endpoints Verified

| Method | Endpoint | Access | Functionality | Verified Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/articles` | Public | List all published articles (filter by category) | `200 OK` |
| `GET` | `/api/articles/:idOrSlug` | Public / Author | Get single article by ID or slug (+ view count) | `200 OK` |
| `POST` | `/api/articles` | Authenticated | Create new draft or published article | `201 Created` |
| `PUT` | `/api/articles/:idOrSlug` | Author / Admin | Update owned article (or any if admin) | `200 OK` |
| `DELETE` | `/api/articles/:idOrSlug` | Author / Admin | Delete owned article (or any if admin) | `200 OK` |
| `GET` | `/api/articles/my-articles` | Authenticated | Fetch current user's articles (including drafts) | `200 OK` |

---

## 🧪 Verification Log
- **Backend Test Suite:** Executed all 13 test cases via `test_phase5_runner.js`:
  1. Server Health & Database Connection (`200 OK`)
  2. Author Registration & JWT Token generation (`201 Created`)
  3. Reader Registration & JWT Token generation (`201 Created`)
  4. Unauthenticated Article Creation rejection (`401 Unauthorized`)
  5. Author Article Creation with auto-slug (`201 Created`)
  6. Public Article Listing (`200 OK`)
  7. Public Article Detail & View Counter Increment (`200 OK`)
  8. Unauthorized Update Rejection (`403 Forbidden`)
  9. Author Update Own Article (`200 OK`)
  10. Draft Article Privacy Test (Hidden from public `404`, visible in `/my-articles`)
  11. Unauthorized Deletion Rejection (`403 Forbidden`)
  12. Author Deletion of Own Article (`200 OK`)
  13. Deleted Article Verification (`404 Not Found`)
- **Frontend Build Test:** Executed `npm run build` in `client/` — 47 modules transformed cleanly in 296ms with 0 errors.
- **Deployment Hardening & Dotenv Resolution:**
  - Integrated `dotenv` package across `server.js` with root and local fallback resolution.
  - Added support for both `MONGODB_URI` and `MONGO_URI` in `server/config/db.js`.
  - Added `"build": "npm install"` in `server/package.json` for standalone backend deployments on cloud hosts (preventing `Missing script: "build"` errors).
  - Moved Vite and Tailwind build plugins into `client/package.json` `dependencies` to prevent production builds skipping them under `NODE_ENV=production`.
  - Configured root build script `npm run build` to cleanly build client assets without triggering recursive folder junctions.

---

## 🚀 Phase 6 Implementation Summary: Search, Filtering & Pagination

### 1. Files Created & Updated
- `server/controllers/articleController.js`: Updated `getAllArticles` with regex search on title, excerpt, and content (sanitized for regex injection), category filtering, parameter normalization/clamping (`page >= 1`, `limit <= 100`), skip/limit queries, and accurate pagination metadata (`total`, `page`, `totalPages`, `limit`, `hasNextPage`, `hasPrevPage`).
- `client/src/services/api.js`: Updated `articleApi.getAll` to format and serialize `category`, `search`, `page`, and `limit` URLSearchParams.
- `client/src/components/Pagination.jsx`: Created reusable accessible pagination component with windowed page numbering, next/prev navigation, and total item range indicator.
- `client/src/pages/ArticlesPage.jsx`: Added debounced search bar with instant clear button, category chips, active filter badges, empty state with filter reset action, and pagination integration with scroll-to-top.
- `server/test_search_filter_pagination.js`: Created dedicated automated test suite verifying all 45 search, filter, and pagination assertions.

### 2. Verification Results
- **Search, Filter & Pagination Suite:** 45/45 assertions passed (100%).
- **CRUD & Authorization Suite:** 18/18 tests passed (100%).
- **Phase 5 Suite:** 13/13 tests passed (100%).
- **Frontend Production Build:** Vite production build succeeded in ~314ms with 0 errors.

---

## 🚀 Phase 7 Implementation Summary: User Profile & In-Place Edit Profile

### 1. Files Created & Updated
- `server/controllers/userController.js`: Added `getUserProfile` and `updateUserProfile` handlers with validation for name (2–50 chars), bio (max 250 chars), and avatar (valid HTTP/HTTPS URL or empty string to reset). Enforced security immutability on `role`, `password`, `email`, and `_id`. Computed author statistics (`articlesCount`).
- `server/routes/userRoutes.js`: Replaced placeholders with protected endpoints `GET /profile`, `PUT /profile`, `GET /me`, and `PUT /me`.
- `client/src/pages/ProfilePage.jsx`: Implemented full user profile view and in-place edit mode. Includes read-only email display, live avatar preview, character counter for bio, double-submission prevention, and cancel handler.
- `client/src/context/AuthContext.jsx`: Added `updateUser()` method to dynamically update user state and `localStorage` without re-login.
- `client/src/components/Navbar.jsx`: Connected desktop and mobile navigation to `useAuth().user` for immediate greeting and avatar thumbnail synchronization.
- `client/src/services/api.js`: Exported `userApi` (`getProfile`, `updateProfile`).
- `server/test_user_profile.js`: Created comprehensive automated test suite with 42 assertions covering input validation, security, and live remote endpoints via `TEST_API_URL`.

### 2. Verification Results
- **Profile & Security Suite (Local):** 42/42 assertions passed (100%).
- **Profile & Security Suite (Live Render):** 42/42 assertions passed (100%) against `https://devstory.onrender.com/api`.
- **Phase 5 Full-Stack Regression Suite:** 13/13 tests passed (100%).
- **Frontend Production Build:** Vite production build succeeded cleanly in ~330ms (0 errors).
- **Deployment Status:** Committed and pushed to `origin/main` on GitHub; automatically redeployed to Render.

---

## 🚀 Phase 8 Implementation Summary: Comments Feature (Full Stack)

### 1. Files Created & Updated
- `server/models/Comment.js`: Created Comment Mongoose model with references to `Article` and `User`, string length validation (1–1000 chars), and compound index (`{ article: 1, createdAt: -1 }`).
- `server/controllers/commentController.js`: Implemented `getCommentsByArticle`, `createComment`, `updateComment`, and `deleteComment` with ObjectId and slug resolution, input validation, and multi-tier deletion permissions (comment author, article author, admin).
- `server/routes/commentRoutes.js`: Replaced 501 placeholder with REST routes (`GET /article/:articleId`, `POST /article/:articleId`, `PUT /:commentId`, `DELETE /:commentId`).
- `server/routes/articleRoutes.js`: Mounted sub-routes `GET /:articleId/comments` and `POST /:articleId/comments`.
- `server/controllers/articleController.js`: Added cascade deletion (`Comment.deleteMany({ article: article._id })`) when an article is removed.
- `client/src/services/api.js`: Exported `commentApi` helper object (`getByArticle`, `create`, `update`, `delete`).
- `client/src/components/CommentItem.jsx`: Created reusable comment card with user avatar, author/admin badges, formatted date, inline edit form with character counter, and custom delete modal.
- `client/src/components/CommentSection.jsx`: Created main discussion container managing comment counts, authenticated post form, unauthenticated sign-in prompt, loading spinners, empty states, and error handlers.
- `client/src/pages/ArticleDetailPage.jsx`: Embedded `<CommentSection />` below author bio card.
- `server/test_comments.js`: Automated test suite with 24 assertions covering creation, input validation, editing, deletion, permissions, and cascade teardown.

### 2. Verification Results
- **Comments API Test Suite:** 24/24 assertions passed (100%).
- **Profile & Security Suite:** 42/42 assertions passed (100%).
- **Phase 5 Full-Stack Regression Suite:** 13/13 tests passed (100%).
- **Frontend Production Build:** Vite production build succeeded in 309ms (0 errors, 51 modules transformed).
- **Deployment Status:** Committed and pushed to `origin/main` on GitHub (`19c1e96`).


