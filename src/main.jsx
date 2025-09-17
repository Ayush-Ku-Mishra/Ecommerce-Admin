import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";
import { useState, useEffect, createContext } from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { toast } from "react-toastify";

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/me`,
          { withCredentials: true }
        );

        // ✅ Role check: only allow "admin" (and moderator/seller if required)
        if (res.data.user.role === "admin") {
          setUser(res.data.user);
          setIsAuthenticated(true);
          setSessionExpired(false);
        } else {
          // ❌ If a normal user tries to open admin panel, force logout
          await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`,
            { withCredentials: true }
          );
          setUser(null);
          setIsAuthenticated(false);
          toast.error("Unauthorized access. Admin login required.");
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
        if (error.response?.status === 401) {
          if (!sessionExpired) {
            toast.error("Your session has expired. Please login again.");
            setSessionExpired(true);
          }
        } else {
          setSessionExpired(false);
        }
      }
    };
    checkAuth();
  }, [sessionExpired]);

  return (
    <Context.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        sessionExpired,
        setSessionExpired,
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
