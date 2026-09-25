# DevStory — Full-Stack Personal Blog Web Application

DevStory is a modern, responsive, and robust Full-Stack Personal Blog platform built with React 19, Tailwind CSS v4, Express.js REST APIs, and MongoDB Atlas.

---

## 🌟 Key Features

* **Authentication & Authorization**: Secure JWT-based authentication with bcrypt password hashing, token validation, and role-based access control (Admin & Author roles).
* **Article Management (Full CRUD)**: Authors can create, publish, edit, draft, and delete articles with rich categories, tags, excerpts, and custom cover thumbnails.
* **Auto-Slug Generation**: URL-friendly slugs generated from article titles with duplicate collision prevention.
* **Drafts & Privacy Control**: Draft articles remain private to authors and admins while hidden from public listing.
* **Live View Tracking**: Atomic view count increments on every article read.
* **Modern UI/UX**: Clean, responsive design crafted with Tailwind CSS v4, loading skeletons, error boundaries, empty states, and dynamic confirmation dialogs.
* **Production-Ready Architecture**: Modular MVC design on the backend with centralized error handling, Mongoose models, and environment isolation.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite, Tailwind CSS v4, React Router DOM v7, Context API
* **Backend**: Node.js, Express.js (MVC Architecture, RESTful API)
* **Database**: MongoDB Atlas, Mongoose
* **Security & Auth**: JSON Web Tokens (JWT), bcryptjs, CORS, Morgan

---

## 📂 Project Structure

```text
blog-project/
│
├── client/                     # React 19 + Vite Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components (ArticleCard, Navbar, Footer, Button, etc.)
│   │   ├── context/            # AuthContext & state providers
│   │   ├── layouts/            # Page shell & navbar/footer layouts
│   │   ├── pages/              # Views (HomePage, ArticlesPage, ArticleDetailPage, CreateArticlePage, etc.)
│   │   ├── routes/             # App routing & ProtectedRoute guards
│   │   ├── services/           # Centralized API service client
│   │   ├── App.jsx             # Main App root component
│   │   └── main.jsx            # Vite DOM mount point
│   ├── .env.example            # Client environment template
│   └── package.json
│
├── server/                     # Express REST API Backend
│   ├── config/                 # MongoDB connection & environment settings
│   ├── controllers/            # Controller handlers (authController, articleController)
│   ├── middleware/             # JWT auth & centralized error middleware
│   ├── models/                 # Mongoose schemas (User, Article)
│   ├── routes/                 # Express API routes (authRoutes, articleRoutes, healthRoutes)
│   ├── app.js                  # Express application configuration
│   ├── server.js               # HTTP server entry point
│   ├── .env.example            # Server environment template
│   └── package.json
│
├── .gitignore
├── PROJECT_PROGRESS.md         # Detailed phase-by-phase implementation log
└── README.md
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
* **Node.js**: v18.0.0 or later
* **npm**: v9.0.0 or later
* **MongoDB Atlas account** or local MongoDB instance

### 2. Clone the Repository
```bash
git clone https://github.com/Manasa248237/DevStory.git
cd DevStory
```

### 3. Backend Setup
```bash
cd server
npm install
cp .env.example .env
```
Update `server/.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```
Start backend:
```bash
npm run dev
```
Backend runs at `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).

### 4. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 📡 API Reference

### Health
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Backend & Database connection status | Public |

### Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new user | Public |
| `POST` | `/api/auth/signin` | User login & token generation | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |

### Articles
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/articles` | List all published articles (with category filter) | Public |
| `GET` | `/api/articles/:idOrSlug` | Get single article by ID or slug (+ view increment) | Public / Author |
| `POST` | `/api/articles` | Create new article | Private |
| `PUT` | `/api/articles/:idOrSlug` | Update article | Author / Admin |
| `DELETE` | `/api/articles/:idOrSlug` | Delete article | Author / Admin |
| `GET` | `/api/articles/my-articles` | List user's drafts and published articles | Private |

---

## 🚢 Deployment Guide

### Option 1: Full-Stack Web Service (Single Service on Render / Railway)
Deploy the entire repository on Render as a Web Service:
* **Root Directory**: (Leave blank / root `.`)
* **Build Command**: `npm run build` *(installs dependencies and builds the Vite frontend into `client/dist`)*
* **Start Command**: `npm start` *(or `node server/server.js` — serves both API routes and static frontend)*
* **Environment Variables**:
  * `MONGODB_URI`: Your MongoDB Atlas connection URI
  * `JWT_SECRET`: A secure random string for JWT signing
  * `NODE_ENV`: `production`

### Option 2: Separate Backend & Frontend Deployments
* **Backend API (Render / Railway / Heroku)**:
  * **Root Directory**: `server`
  * **Build Command**: `npm install` *(or `npm run build`)*
  * **Start Command**: `node server.js`
  * **Environment Variables**: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`
* **Frontend SPA (Vercel / Netlify / Render Static Site)**:
  * **Root Directory**: `client`
  * **Build Command**: `npm run build`
  * **Output Directory**: `dist`
  * **Environment Variables**: `VITE_API_BASE_URL=https://your-backend-url.onrender.com/api`

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
