# Coursepath — Student Course Management & Learning Progress Tracking System

A complete, real, working full-stack web application: students register,
browse and enroll in courses, work through video + PDF learning modules,
track progress, earn certificates, and get live notifications; admins
manage courses and students with real-time analytics. There is no mock
data layer anywhere — everything is a real HTTP API backed by a real
database.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend (primary) | HTML5, CSS3, vanilla JavaScript (fetch API + Socket.IO client) — 17 pages, fully wired to the real API |
| Frontend (React) | React 18 + React Router 6 + Context API + Axios, in `client/` — same live backend, componentized/routed UI |
| Backend | Node.js, Express |
| Database | SQLite via Sequelize ORM (a real, file-based relational database — zero install, easy to swap for MongoDB/PostgreSQL/MySQL later) |
| Auth | JWT (JSON Web Tokens) + bcrypt password hashing |
| Real-time | Socket.IO — live notifications and a live per-course discussion chat |
| Learning content | Real embedded YouTube video per module + a real generated downloadable PDF course handout per course (via PDFKit) |

## Project folder structure

```
coursepath-lms/
├── index.html, login.html, register.html, ...   Vanilla-JS frontend pages (primary app)
├── css/styles.css                                All styles
├── js/
│   ├── api.js            Real REST + Socket.IO client (talks to /server)
│   ├── ui.js              Navbar, toasts, formatting helpers
│   └── validation.js      Client-side form validation
├── client/                                        React frontend (same live backend)
│   ├── src/pages/          Home, Login, Register, Dashboard, Courses
│   ├── src/components/     Navbar, Footer, CourseCard, ProtectedRoute
│   ├── src/context/        AuthContext, CourseContext (Context API state)
│   └── src/api/axios.js    Axios client with JWT interceptor
└── server/                                        Backend — Express API
    ├── server.js                Entry point — also serves the frontend
    ├── seed.js                  Creates demo admin/student + 5 courses
    ├── config/db.js             SQLite/Sequelize connection
    ├── models/                  User, Course, Enrollment, Progress,
    │                            Notification, Message
    ├── controllers/             Business logic for every route
    ├── routes/                  Express routers (REST endpoints)
    ├── middleware/               JWT auth guard, centralized error handler
    ├── sockets/                  Socket.IO setup (notifications + chat)
    ├── utils/                    JWT signing, module/resource builder,
    │                            PDF handout generator
    ├── data/                     coursepath.sqlite lives here (auto-created)
    └── public/pdfs/               Generated course handout PDFs (auto-created)
```

## How to run it (download and run — one command)

You need [Node.js](https://nodejs.org) 18+ installed. Nothing else — no
MongoDB, no Postgres, no separate services to start.

```bash
cd coursepath-lms/server
npm install        # installs Express, Sequelize, JWT, bcrypt, Socket.IO, PDFKit, etc.
npm run seed        # creates the database file and seeds demo data + PDFs
npm start           # starts the server (serves both the API and the website)
```

Then open **http://localhost:5000** in your browser. That's it — the
Express server serves the frontend files *and* the API from the same
process, so there's nothing else to configure.

### Demo accounts (created by `npm run seed`)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@coursepath.edu` | `Admin@123` |
| Student | `student@coursepath.edu` | `Student@123` |

Or register your own student account from the Register page — five real
courses (Full Stack Web Development, Python for Data Analysis, Machine
Learning Foundations, Database Management Systems, React & Modern
Frontend) are seeded so there's content to enroll in immediately.

### Re-running the seed

`npm run seed` wipes and rebuilds the database every time you run it
(handy while developing/testing). Just run `npm start` again afterward.

### Running the React frontend (optional, second terminal)

The backend above (`server/`) already serves the primary vanilla-JS site
on its own. To also run the React version side by side against the same
live API:

```bash
cd coursepath-lms/client
npm install
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/api` calls to
`http://localhost:5000`, so make sure the backend (`npm start` in
`server/`) is running first. Log in with the same demo accounts above —
it's the same database.

## What's actually real here

- **Authentication** — passwords are hashed with `bcrypt` (never stored in
  plain text), sessions are real signed JWTs verified server-side on every
  protected request, unauthenticated/expired-token requests get a proper
  `401`.
- **Database** — SQLite file on disk via Sequelize, with real tables,
  relationships, and CRUD — not `localStorage`. Every enroll, complete, or
  admin action is a real write.
- **REST API** — `POST /api/auth/register`, `POST /api/auth/login`,
  `GET/POST/PUT/DELETE /api/courses`, `POST /api/enrollments/:studentId/:courseId`,
  `POST /api/progress/:studentId/:courseId/:moduleId`, admin endpoints, etc.
  — all validated, all returning proper JSON + status codes.
- **Real-time** — Socket.IO pushes new notifications to a student's bell
  icon instantly (new course added, enrollment confirmed, certificate
  unlocked) with no polling, and powers a live discussion chat on every
  course's learning page.
- **Learning content** — every module links a real, working YouTube video
  plus reference links, and every course has a real downloadable PDF
  handout (syllabus + module breakdown) generated at seed/creation time —
  not placeholder text.
- **Security** — CORS configured, input validated server-side, centralized
  error handling (bad input → `400`, not a crash), secrets in `.env`,
  admin-only routes enforced server-side (not just hidden in the UI).

## Going further (optional)

- **Swap SQLite for MongoDB/PostgreSQL**: only `server/config/db.js` and
  the `models/` files change — controllers and routes stay the same shape.
- **Deploy**: push `server/` to Render/Railway (it serves the frontend
  itself, so one deployment is the whole app); or deploy the frontend to
  Vercel/Netlify separately and point `js/api.js`'s `fetch()` calls at the
  deployed API's URL instead of relative paths.
- **.env**: copy `server/.env.example` to `server/.env` (already done for
  you) and change `JWT_SECRET` before deploying anywhere public.

## Skill task → implementation map

Every task from the Full Stack Web Development skill task sheet is
implemented in this repository. Links below are relative paths into this
repo — once pushed to GitHub they become clickable links straight to the
folder/file, e.g. `https://github.com/<you>/<repo>/tree/main/server/models`.

| # | Task | Where it's implemented |
| --- | --- | --- |
| 1 | GitHub repo & documentation | This repository + [`README.md`](README.md) (overview, features, tech stack, setup) |
| 2 | Application structure (HTML) | [`index.html`](index.html), [`login.html`](login.html), [`register.html`](register.html), [`student-dashboard.html`](student-dashboard.html), + 13 more pages, all using semantic `<header>/<nav>/<main>/<section>/<footer>` |
| 3 | CSS & responsive design | [`css/styles.css`](css/styles.css) — Flexbox/Grid layouts, media queries for mobile/tablet/desktop |
| 4 | Client-side validation & dynamic nav | [`js/validation.js`](js/validation.js), dynamic login/logout nav in [`js/ui.js`](js/ui.js) |
| 5 | Reusable JS modules & state | [`js/api.js`](js/api.js) (API calls, auth state), [`js/ui.js`](js/ui.js), [`js/validation.js`](js/validation.js) — ES6 modules |
| 6 | React components & routing | [`client/src/App.jsx`](client/src/App.jsx) (routes), [`client/src/pages/`](client/src/pages), [`client/src/components/`](client/src/components) (Navbar, Footer, CourseCard) |
| 7 | Frontend ↔ API with Context state | [`client/src/context/AuthContext.jsx`](client/src/context/AuthContext.jsx), [`client/src/context/CourseContext.jsx`](client/src/context/CourseContext.jsx), [`client/src/api/axios.js`](client/src/api/axios.js) — connected to the real backend below (no mock layer needed since the real API was built) |
| 8 | Backend server & architecture | [`server/server.js`](server/server.js), [`server/config/db.js`](server/config/db.js), MVC folders: [`server/routes/`](server/routes), [`server/controllers/`](server/controllers), [`server/models/`](server/models) |
| 9 | Student & course REST APIs | [`server/routes/authRoutes.js`](server/routes/authRoutes.js), [`server/routes/courseRoutes.js`](server/routes/courseRoutes.js), [`server/controllers/`](server/controllers) |
| 10 | JWT auth & protected routes | [`server/middleware/auth.js`](server/middleware/auth.js), [`server/utils/token.js`](server/utils/token.js) |
| 11 | Database schema | [`server/models/`](server/models) (User, Course, Enrollment, Progress, Notification, Message) |
| 12 | DB integration & CRUD | [`server/controllers/courseController.js`](server/controllers/courseController.js), [`server/controllers/enrollmentController.js`](server/controllers/enrollmentController.js), [`server/controllers/adminController.js`](server/controllers/adminController.js) |
| 13 | Real-time notifications/chat | [`server/sockets/index.js`](server/sockets/index.js), [`server/routes/messageRoutes.js`](server/routes/messageRoutes.js), [`js/api.js`](js/api.js) (Socket.IO client) |
| 14 | Security & error handling | bcrypt hashing in [`server/controllers/authController.js`](server/controllers/authController.js), [`server/middleware/errorHandler.js`](server/middleware/errorHandler.js), `.env`-based secrets |
| 15 | Deployment & testing | See "Going further" above for deployment steps; `server/server.js` serves frontend + API from one process, ready to deploy as-is |

> Note on tasks 6–7: the skill sheet has React talk to a **mock** API before
> the real backend exists (tasks 8–12). Since the real backend was built as
> part of this same project, the React app in `client/` was pointed at the
> real, live API directly — it's strictly more real than a mock, and no
> functionality is lost.
