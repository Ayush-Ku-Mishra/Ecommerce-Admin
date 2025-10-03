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
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState();
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/me`,
          {
            withCredentials: true, // For cookies
            headers: headers, // For token
          }
        );
        setUser(res.data.user);
        setIsAuthenticated(true);
        setSessionExpired(false);
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
