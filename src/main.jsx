import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";
import { useState, useEffect, createContext } from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import  toast  from "react-hot-toast";

export const Context = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {},
  sessionExpired: false,
  setSessionExpired: () => {},
});

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check localStorage for admin token
        const adminToken = localStorage.getItem("admin_token");
        const adminUser = localStorage.getItem("admin_user");

        if (adminToken && adminUser) {
          try {
            const parsedUser = JSON.parse(adminUser);
            
            // Verify token with backend using Authorization header
            const res = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/me`,
              { 
                headers: {
                  'Authorization': `Bearer ${adminToken}`,
                  'X-Admin-Request': 'true' // Flag for admin request
                }
              }
            );

            // ✅ Role check: only allow "admin" (and moderator/seller if required)
            if (res.data.user.role === "admin") {
              setUser(res.data.user);
              setIsAuthenticated(true);
              setSessionExpired(false);
            } else {
              // Clear localStorage if role mismatch
              localStorage.removeItem("admin_token");
              localStorage.removeItem("admin_user");
              setUser(null);
              setIsAuthenticated(false);
              toast.error("Unauthorized access. Admin login required.");
            }
          } catch (tokenError) {
            // Token verification failed, clear localStorage
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_user");
            setUser(null);
            setIsAuthenticated(false);
            
            if (tokenError.response?.status === 401) {
              if (!sessionExpired) {
                toast.error("Your admin session has expired. Please login again.");
                setSessionExpired(true);
              }
            }
          }
        } else {
          // No admin token found
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
        setIsAuthenticated(false);
        setSessionExpired(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [sessionExpired]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Context.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        sessionExpired,
        setSessionExpired,
        authLoading,
      }}
    >
      <App />
    </Context.Provider>
  );
};

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AppWrapper />
  </Provider>
);