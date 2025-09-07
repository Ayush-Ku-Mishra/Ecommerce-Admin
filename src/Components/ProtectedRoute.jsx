import { useContext, useEffect, useState } from "react";
import { Context } from "../main"; // adjust path if needed
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

export default function ProtectedRoute() {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // 🔹 Call your backend to check if user is still logged in
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/me`,
          { withCredentials: true }
        );

        if (data.success) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [setIsAuthenticated, setUser]);

  if (loading) return <h1>Loading...</h1>;

  // If not authenticated, redirect to signup (login) page
  return isAuthenticated ? <Outlet /> : <Navigate to="/signup" replace />;
}
