import React, { useContext, useState } from "react";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Logout = ({ onClose }) => {
  const { setIsAuthenticated, setUser } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`, {
        withCredentials: true,
      });

      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("user-info");
      toast.success("Logged out successfully.");
      navigate("/signup"); // redirect to login page
    } catch {
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoading(false);
      onClose?.(); // close modal if provided
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-72 text-center">
        <p className="mb-4 text-gray-800">Are you sure you want to logout?</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-1 rounded bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
