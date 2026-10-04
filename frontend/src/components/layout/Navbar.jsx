import React, { useState } from "react";
import Logo from "../common/Logo";
import Avatar from "../common/Avatar";
import Icon from "../common/Icon";
import Dropdown from "../common/Dropdown";
import { Link, NavLink, useNavigate } from "../../routes/Router";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { label: "Home", to: "/" },
    { label: "Discover", to: "/discover" },
    { label: "Hackathons", to: "/hackathons" },
    { label: "Teams", to: "/teams" },
    { label: "Connections", to: "/connections" },
  ];

  const handleSignOut = () => {
    logout();
    setProfileOpen(false);
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="logo-button" aria-label="Campus Connect Home">
        <Logo />
      </Link>

      <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
        {links.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-actions">
        {/* Notifications */}
        <div className="relative">
          <button
            className="icon-button notification"
            aria-label="Notifications"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
          >
            <Icon name="bell" />
            <span />
          </button>

          <Dropdown
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            className="w-72 p-2"
          >
            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Notifications
              </span>
              <span className="text-[11px] text-blue-600 font-semibold cursor-pointer">
                Mark all read
              </span>
            </div>
            <div className="py-1 text-left">
              <div
                className="px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer rounded-lg transition-colors"
                onClick={() => {
                  setNotificationsOpen(false);
                  navigate("/connections");
                }}
              >
                <p className="font-semibold text-slate-800">
                  Aisha Patel sent a connection request
                </p>
                <span className="text-[11px] text-slate-400">3 hours ago</span>
              </div>
              <div
                className="px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer rounded-lg transition-colors"
                onClick={() => {
                  setNotificationsOpen(false);
                  navigate("/hackathons/build-for-good-2025");
                }}
              >
                <p className="font-semibold text-slate-800">
                  Build for Good registration deadline in 12 days
                </p>
                <span className="text-[11px] text-slate-400">Yesterday</span>
              </div>
            </div>
          </Dropdown>
        </div>

        {/* Profile Menu */}
        <div className="profile-menu">
          <button
            className="avatar-button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            aria-expanded={profileOpen}
            aria-label="User menu"
          >
            <Avatar src={user?.photo} name={user?.name || "Student"} size="sm" />
            <span>{user?.name ? user.name.split(" ")[0] : "Maya"}</span>
            <Icon name="chevron" size={14} />
          </button>

          <Dropdown isOpen={profileOpen} onClose={() => setProfileOpen(false)}>
            <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
              <p className="font-bold text-xs text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                setProfileOpen(false);
                navigate("/profile");
              }}
            >
              <Icon name="user" size={17} />
              Profile & settings
            </button>
            <button onClick={handleSignOut}>
              <Icon name="arrow" size={17} />
              Sign out
            </button>
          </Dropdown>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="mobile-menu"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
