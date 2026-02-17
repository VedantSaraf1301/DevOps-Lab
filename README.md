# 📝 Inkwell — MERN Blog App

A simple full-stack blog application built with MongoDB, Express, React, and Node.js.

## Features

- ✅ User Signup & Login (bcrypt password hashing)
- ✅ Create, Read, Update, Delete blog posts
- ✅ Only post authors can edit/delete their posts
- ✅ Persistent session via localStorage
- ✅ Clean editorial UI

---

## Project Structure

```
blog-app/
├── server/          # Express + MongoDB backend
│   ├── index.js     # Entry point
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   └── routes/
│       ├── auth.js  # /api/auth/signup, /api/auth/login
│       └── posts.js # /api/posts CRUD
└── client/          # React frontend
    └── src/
        ├── App.js
        ├── components/
        │   └── Navbar.js
        └── pages/
            ├── Login.js
            ├── Signup.js
            ├── PostList.js
            ├── PostDetail.js
            └── PostForm.js
```

---

## Prerequisites

- **Node.js** (v16+)
- **MongoDB** running locally on `mongodb://localhost:27017`
  - Install: https://www.mongodb.com/docs/manual/installation/
  - Or use MongoDB Atlas (free cloud): https://www.mongodb.com/atlas

---

## Setup & Run

### 1. Install dependencies

```bash
# Install server deps
cd server
npm install

# Install client deps
cd ../client
npm install
```

### 2. Start the backend

```bash
cd server
node index.js
# Server runs on http://localhost:5000
```

### 3. Start the frontend (new terminal)

```bash
cd client
npm start
# React app opens at http://localhost:3000
```

> The React app proxies `/api` calls to `localhost:5000` automatically.

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/signup | Register a new user |
| POST | /api/auth/login | Login and get user data |
| GET | /api/posts | Get all posts |
| GET | /api/posts/:id | Get a single post |
| POST | /api/posts | Create a post |
| PUT | /api/posts/:id | Update a post (author only) |
| DELETE | /api/posts/:id | Delete a post (author only) |

---

## Environment Variables (Optional)

Create `server/.env`:

```
MONGO_URI=mongodb://localhost:27017/blogapp
PORT=5000
```

---

## Using MongoDB Atlas (Cloud)

1. Create a free account at https://cloud.mongodb.com
2. Create a cluster and get your connection string
3. Set `MONGO_URI=mongodb+srv://...` in `server/.env` or directly in `server/index.js`
