import React, { createContext, useContext, useState, useEffect } from "react";

const RouterContext = createContext({
  path: "/",
  params: {},
  navigate: () => {},
});

export function useRouter() {
  return useContext(RouterContext);
}

export function useNavigate() {
  const { navigate } = useContext(RouterContext);
  return navigate;
}

export function useParams() {
  const { params } = useContext(RouterContext);
  return params;
}

export function useLocation() {
  const { path } = useContext(RouterContext);
  return { pathname: path };
}

// Helper to match parameterized path patterns like /students/:id
export function matchPath(pattern, pathname) {
  // Normalize trailing slash
  const cleanPattern = pattern === "/" ? "/" : pattern.replace(/\/+$/, "");
  const cleanPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  const patternParts = cleanPattern.split("/");
  const pathParts = cleanPath.split("/");

  if (patternParts.length !== pathParts.length) {
    return { matched: false, params: {} };
  }

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pPart = patternParts[i];
    const pathPart = pathParts[i];

    if (pPart.startsWith(":")) {
      const paramName = pPart.slice(1);
      params[paramName] = decodeURIComponent(pathPart);
    } else if (pPart !== pathPart) {
      return { matched: false, params: {} };
    }
  }

  return { matched: true, params };
}

export function RouterProvider({ children }) {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname || "/";
      return p === "" ? "/" : p;
    }
    return "/";
  });

  const [params] = useState({});

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname || "/";
      setCurrentPath(p === "" ? "/" : p);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to) => {
    if (to !== currentPath) {
      if (typeof window !== "undefined" && window.history) {
        window.history.pushState({}, "", to);
      }
      setCurrentPath(to);
      window.scrollTo(0, 0);
    }
  };

  return (
    <RouterContext.Provider value={{ path: currentPath, params, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function Route({ path: routePattern, element }) {
  const { path } = useRouter();
  const match = matchPath(routePattern, path);

  if (!match.matched) {
    // special alias for dashboard
    if (routePattern === "/" && path === "/dashboard") {
      return <>{element}</>;
    }
    if (routePattern === "/dashboard" && path === "/") {
      return <>{element}</>;
    }
    return null;
  }

  return (
    <RouterContext.Consumer>
      {(ctx) => (
        <RouterContext.Provider value={{ ...ctx, params: match.params }}>
          {element}
        </RouterContext.Provider>
      )}
    </RouterContext.Consumer>
  );
}

export function Link({ to, children, className = "", onClick, ...rest }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
}

export function NavLink({ to, children, className = "", activeClassName = "active", ...rest }) {
  const { path } = useRouter();
  const isActive = path === to || (to === "/" && path === "/dashboard") || (to === "/dashboard" && path === "/");
  const combinedClass = `${className} ${isActive ? activeClassName : ""}`.trim();

  return (
    <Link to={to} className={combinedClass} {...rest}>
      {children}
    </Link>
  );
}

export default RouterProvider;
