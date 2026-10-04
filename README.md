# Campus Connect

Campus Connect is a student networking and collaboration platform that helps university students connect with peers, discover hackathons, and form teams tailored to their skills and interests.

---

## Repository Structure

```
Campus Connect/
├── frontend/             # React 19 + Tailwind CSS v4 client application
│   ├── src/
│   │   ├── components/   # Modular, reusable UI components (common, layout, etc.)
│   │   ├── context/      # Auth & application state providers
│   │   ├── data/         # Mock data & baseline schemas
│   │   ├── pages/        # Route pages (Auth, Dashboard, Discover, Hackathons, Teams)
│   │   ├── routes/       # React Router setup
│   │   └── services/     # API service layer (ready for backend integration)
│   ├── index.html        # Vite entry shell
│   ├── package.json      # Dependencies and scripts
│   ├── vite.config.js    # Build & styling configuration
│   └── README.md         # Dedicated frontend development guide
└── backend/              # (Reserved for backend API services / database)
```

---

## Team Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` (packaged with Node)

### Running the App Locally
```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit the local URL shown in your terminal (typically `http://localhost:5173`).

---

## Contributor Documentation Guidelines

To keep project documentation clear across team members:

- **Root [README.md](README.md)**: Manages repository-wide architecture, multi-service setups (frontend + future backend), and repo onboarding.
- **Frontend [frontend/README.md](frontend/README.md)**: Manages client-specific UI features, design guidelines, available npm scripts, and component conventions.

> **Team Notice**: When adding major features, remember to update both this file (if it touches repo architecture/services) and `frontend/README.md` (for UI components, routes, and features).
