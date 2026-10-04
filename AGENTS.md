# Campus Connect

Student networking and collaboration platform.

## Project Structure

This repository is organized to support a fullstack architecture with frontend and backend services:

- `frontend/` - React 19 + JavaScript + Tailwind CSS v4 frontend application
  - `frontend/src/main.jsx` - React entrypoint; mounts `App.jsx`
  - `frontend/src/App.jsx` - Primary application router and pages
  - `frontend/src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
  - `frontend/index.html` - Vite HTML shell
  - `frontend/package.json` - Frontend dependencies and scripts
  - `frontend/vite.config.js` - Vite configuration with Tailwind CSS v4 plugin
- `backend/` - (Reserved for backend services / API endpoints)

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
