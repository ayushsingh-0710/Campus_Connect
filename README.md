# Campus Connect

Campus Connect is a student networking and collaboration platform that helps university students connect with peers, discover hackathons, and form teams tailored to their skills and interests.

---

## Repository Structure

```
Campus Connect/
├── frontend/             # React 19 + Tailwind CSS v4 client application
│   ├── src/
│   │   ├── components/   # Modular, reusable UI components (common, layout, hackathons, etc.)
│   │   ├── context/      # Auth & application state providers
│   │   ├── data/         # Mock data & baseline schemas
│   │   ├── pages/        # Route pages (Auth, Dashboard, Discover, Hackathons, Teams)
│   │   ├── routes/       # React Router setup
│   │   └── services/     # API service layer (hackathonAPI.js, api.js, authService.js)
│   ├── index.html        # Vite entry shell
│   ├── package.json      # Dependencies and scripts
│   ├── vite.config.js    # Build & styling configuration (with /api proxy)
│   └── README.md         # Dedicated frontend development guide
└── backend/              # Node.js + Express + MongoDB MERN API services
    ├── config/           # Database configuration (db.js)
    ├── controllers/      # Route controllers (hackathonController.js)
    ├── middleware/       # Auth (auth.js) and Error handler (errorHandler.js)
    ├── models/           # Mongoose models (Hackathon.js, HackathonBookmark.js)
    ├── routes/           # REST endpoints (hackathonRoutes.js)
    ├── scripts/          # Seeding utilities (seedHackathons.js)
    ├── services/         # Business logic & provider architecture (hackathonSyncService.js)
    │   └── providers/    # Provider adapters (BaseHackathonProvider, demoProvider, etc.)
    ├── utils/            # Filter & sort query builder (hackathonFilters.js)
    ├── package.json      # Backend dependencies and scripts
    └── server.js         # Express server entry point
```

---

## Team Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` (packaged with Node)
- [MongoDB](https://www.mongodb.com/) (Local service or MongoDB Atlas connection string)

### 1. Running the Backend Server
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# (Optional) Seed demo hackathon data
npm run seed

# Start backend server (runs on http://localhost:5000)
npm start
```

### 2. Running the Frontend Application
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start local development server (runs on http://localhost:8443)
npm run dev
```

Visit the frontend at `http://localhost:8443`.

---

## Hackathon Module Features

- **Discovery Page (`/hackathons`)**:
  - Top Featured Hackathon Banner with one-click exploration
  - Full-text search with debouncing (title, organizer, description, technologies, categories)
  - Multi-facet filters: Mode (Online/Offline/Hybrid), Categories (9 tracks), Registration Status, Team Size, Prize Pool (5 tiers), Participation (Students vs Open to All)
  - Dynamic Sorting: Recently Added, Registration Deadline, Upcoming Events, Highest Prize Pool
  - Backend-driven Pagination with page count indicator and state preservation
  - Saved Hackathons tab allowing students to manage their bookmarked events
- **Hackathon Details Page (`/hackathons/:id`)**:
  - Detailed overview, eligibility requirements, and recommended skills/technologies
  - "Register Now" button linking directly to the authentic external registration portal
  - "Save Hackathon" bookmark toggle with database persistence
- **Provider-Independent Architecture**:
  - Ready for external hackathon API synchronization (Unstop, Devpost, Devfolio, etc.)
  - Complete integration guide: [HACKATHON_API_INTEGRATION_GUIDE.md](./HACKATHON_API_INTEGRATION_GUIDE.md)

---

## Contributor Documentation Guidelines

To keep project documentation clear across team members:

- **Root [README.md](README.md)**: Manages repository-wide architecture, multi-service setups (frontend + backend), and repo onboarding.
- **Frontend [frontend/README.md](frontend/README.md)**: Manages client-specific UI features, design guidelines, available npm scripts, and component conventions.
- **Integration Guide [HACKATHON_API_INTEGRATION_GUIDE.md](HACKATHON_API_INTEGRATION_GUIDE.md)**: Technical specifications for third-party API provider adapters.
