
import React from "react";

import RouterProvider, {
  Route,
  useRouter,
  useNavigate,
} from "./routes/Router";

import AuthProvider, { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./routes/ProtectedRoute";

import Navbar from "./components/layout/Navbar";
import { ROUTES } from "./routes/routes";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import DiscoverPage from "./pages/students/DiscoverPage";
import StudentDetailPage from "./pages/students/StudentDetailPage";
import ConnectionsPage from "./pages/connections/ConnectionsPage";
import HackathonsPage from "./pages/hackathons/HackathonsPage";
import HackathonDetailPage from "./pages/hackathons/HackathonDetailPage";
import TeamsPage from "./pages/teams/TeamsPage";
import TeamDetailPage from "./pages/teams/TeamDetailPage";
import ProfilePage from "./pages/profile/ProfilePage";

function AppContent() {
  const { path } = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users away from login/register pages
  React.useEffect(() => {
    if (!loading && isAuthenticated &&
        (path === "/login" || path === "/register")) {
      navigate("/dashboard");
    }
  }, [loading, isAuthenticated, path, navigate]);

  // Public pages
  if (path === "/login") {
    return isAuthenticated ? null : <LoginPage />;
  }

  if (path === "/register") {
    return isAuthenticated ? null : <RegisterPage />;
  }

  // All remaining application pages are protected
  return (
    <ProtectedRoute>
      <div className="app-shell">
        <Navbar />

        <Route
          path={ROUTES.HOME}
          element={<DashboardPage />}
        />

        <Route
          path={ROUTES.DASHBOARD}
          element={<DashboardPage />}
        />

        <Route
          path={ROUTES.DISCOVER}
          element={<DiscoverPage />}
        />

        <Route
          path={ROUTES.STUDENT_DETAIL}
          element={<StudentDetailPage />}
        />

        <Route
          path={ROUTES.CONNECTIONS}
          element={<ConnectionsPage />}
        />

        <Route
          path={ROUTES.HACKATHONS}
          element={<HackathonsPage />}
        />

        <Route
          path={ROUTES.HACKATHON_DETAIL}
          element={<HackathonDetailPage />}
        />

        <Route
          path={ROUTES.TEAMS}
          element={<TeamsPage />}
        />

        <Route
          path={ROUTES.TEAM_DETAIL}
          element={<TeamDetailPage />}
        />

        <Route
          path={ROUTES.PROFILE}
          element={<ProfilePage />}
        />
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  );
}
