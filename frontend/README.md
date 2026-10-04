# Campus Connect — Frontend Application

Client-side Single Page Application (SPA) built with **React 19**, **JavaScript**, **Tailwind CSS v4**, and **Vite**.

---

## Features

- **Authentication**: Login & Register pages with campus credentials
- **Dashboard**: Welcome back overview, quick stats, recommended students, and upcoming hackathons
- **Student Discovery**: Filterable directory with search and multi-facet filtering (Skills, Campus, Course, Year)
- **Student Profiles**: Public profile headers, about, skills, interests, and collaboration availability
- **Connections Network**: Manage active connections and pending requests with accept/reject/remove actions
- **Hackathons**: Discover campus events, mode filtering (Online, Hybrid, Offline), deadline tracking, and registration
- **Teams**: Create and join team workspaces for hackathon projects and campus initiatives
- **Profile & Settings**: Edit student profile information, bio, skills, interests, and portfolio links

---

## Development Scripts

From this directory (`frontend/`):

```bash
# Install dependencies
npm install

# Start local dev server with Hot Module Replacement (HMR)
npm run dev

# Build production bundle to /dist
npm run build

# Preview production build locally
npm run preview
```

---

## Directory Structure (`src/`)

```
src/
├── components/
│   ├── common/         # Atomic UI elements (Button, Input, Modal, Badge, Icon, Avatar)
│   ├── layout/         # Shell layouts (Navbar, PageContainer, SectionHeader)
│   ├── connections/    # Connection cards and tab filters
│   ├── hackathons/     # Hackathon cards, info sections, and grids
│   ├── students/       # Student cards, profile headers, and directories
│   └── teams/          # Team cards, modals, and management grids
├── context/            # Global React Context providers (AuthContext, etc.)
├── data/               # Mock data collections (students, hackathons, teams)
├── pages/              # Routed view containers (Auth, Dashboard, Discover, etc.)
├── routes/             # App routing table and route constants
└── services/           # Service layer for data fetching & future backend APIs
```

---

## Team Guidelines for Updating Documentation

When collaborating on this project:

1. **Keep documentation in sync with your PRs**:
   - **Adding/Modifying UI Pages or Features**: Add the feature to the **Features** list above and update `src/` structure if you create new directories.
   - **Adding New NPM Dependencies or Scripts**: Update the scripts section in this file and commit changes to `package.json` and `package-lock.json`.
   - **Backend Integration / Fullstack Changes**: Update the root [../README.md](../README.md) to document new backend endpoints, environment variables, or repo-level instructions.
2. **Component Conventions**:
   - Place shared, atomic UI components under `src/components/common/`.
   - Export components as `default export`.
   - Ensure JSX tags are properly closed and use double quotes or escaped characters for strings with apostrophes.
