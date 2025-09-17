import React, { useState, useEffect, useContext } from "react";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { IoMdNotificationsOutline } from "react-icons/io";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { Link, useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa6";
import { LiaSignOutAltSolid } from "react-icons/lia";
import Sidebar from "../Components/Sidebar";
import { Context } from "../main";
import axios from "axios";
import { toast } from "react-toastify";
import Logout from "./Logout";

// Fallback logo - your original static logo
import DefaultLogo from "../assets/LogoPickora.jpg";
import AdminNotifications from "./AdminNotifications";

// Helper to get initials from a name
const getInitials = (name = "User") => {
  const parts = name.trim().split(" ");
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const NavbarPage = ({ sidebarOpen, setSidebarOpen }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Add this missing state
  const { user, setIsAuthenticated, setUser } = useContext(Context);
  const [localUser, setLocalUser] = useState(null);
  const [currentLogo, setCurrentLogo] = useState("/api/placeholder/100/50");
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem("user-info");
    if (data) {
      setLocalUser(JSON.parse(data));
    }
  }, []);

  const fetchCurrentLogo = async () => {
    setLogoLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/logo/all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const logos = data.logos || [];

        // Set the latest logo (first one due to sort order) as current logo
        if (logos.length > 0) {
          setCurrentLogo(logos[0].url);
        } else {
          setCurrentLogo(
            `${import.meta.env.VITE_BACKEND_URL}/api/placeholder/100/50`
          );
        }
      }
    } catch (error) {
      console.error("Error fetching current logo:", error);
      setCurrentLogo(
        `${import.meta.env.VITE_BACKEND_URL}/api/placeholder/100/50`
      );
    } finally {
      setLogoLoading(false);
    }
  };

  // Listen for logo updates from ManageLogo component
  useEffect(() => {
    const handleLogoUpdate = () => {
      console.log("Logo update event received, fetching new logo...");
      fetchCurrentLogo();
    };

    // Listen for custom logoUpdated event
    window.addEventListener("logoUpdated", handleLogoUpdate);

    // Initial fetch
    fetchCurrentLogo();

    // Cleanup
    return () => {
      window.removeEventListener("logoUpdated", handleLogoUpdate);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    handleMenuClose();
  };

  const handleLogout = async () => {
    try {
      await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`,
        {
          withCredentials: true,
        }
      );
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("user-info");
      localStorage.removeItem("token"); // Also clear token
      toast.success("Logged out successfully.");
      navigate("/");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
    setShowConfirm(false);
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    setShowConfirm(true);
  };

  const handleLogoError = () => {
    // If the dynamic logo fails to load, fall back to a placeholder
    setCurrentLogo("/api/placeholder/100/50");
  };

  return (
    <div className="relative flex">
      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-72 text-center">
            <p className="mb-4 text-gray-800">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed top-0 left-0 h-screen w-64 z-40 transition-all duration-300">
          <Sidebar
            setSidebarOpen={setSidebarOpen}
            currentLogo={currentLogo}
            logoLoading={logoLoading}
          />
        </div>
      )}

      {/* Main layout shift when sidebar is open */}
      <div
        className={`flex-1 transition-all duration-600 ${
          sidebarOpen ? "lg:ml-64" : "ml-0"
        }`}
      >
        <div className="w-full bg-white h-[50px] flex items-center justify-between px-6 shadow-md fixed top-0 left-0 right-0 z-30">
          {/* Left group: logo + menu button */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center">
              {logoLoading ? (
                <div className="h-10 w-20 bg-gray-200 animate-pulse rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">Loading...</span>
                </div>
              ) : (
                <img
                  src={currentLogo}
                  alt="Pickora Logo"
                  className="h-10 w-auto object-contain max-w-[120px]"
                  onError={handleLogoError}
                />
              )}
            </Link>

            <div
              className={`transition-all duration-500 ${
                sidebarOpen ? "lg:ml-20" : "ml-0"
              }`}
            >
              <Button
                onClick={toggleSidebar}
                className="!w-[40px] !h-[40px] !rounded-full !min-w-[40px]"
                aria-label="Toggle Sidebar"
              >
                <HiOutlineMenuAlt1 className="text-[19px] text-[rgba(0,0,0,0.8)]" />
              </Button>
            </div>
          </div>

          {/* Right group: notifications + avatar/sign up */}
          <div className="flex items-center gap-5 pr-2 overflow-hidden">
            <AdminNotifications />

            {/* Conditional user display */}
            <div>
              {user ? (
                // Logged in: Avatar button
                <Button
                  onClick={handleAvatarClick}
                  className="!p-0 !min-w-0 !rounded-full"
                  aria-controls={open ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: "1rem",
                      bgcolor: "#455a64",
                    }}
                  >
                    {getInitials(user.name || "User Name")}
                  </Avatar>
                </Button>
              ) : (
                // Logged out: Sign Up button
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/signup")}
                  className="!capitalize !rounded-full shadow-md hover:shadow-lg transition-all duration-300 
             flex items-center justify-center"
                  sx={{
                    minWidth: { xs: 70, sm: 100, md: 110 },
                    height: { xs: 36, sm: 40, md: 44 },
                    fontSize: { xs: "0.75rem", sm: "0.85rem", md: "0.95rem" },
                    px: { xs: 1.5, sm: 2.5, md: 3.5 },
                    bgcolor: "#1976d2",
                    "&:hover": { bgcolor: "#1565c0" },
                  }}
                >
                  Sign Up
                </Button>
              )}
            </div>

            {/* Avatar Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  minWidth: 220,
                  borderRadius: 2,
                  "& .MuiAvatar-root": {
                    width: 36,
                    height: 36,
                    fontSize: "1rem",
                    bgcolor: "#455a64",
                    mr: 2,
                  },
                  "&::before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 28,
                    width: 12,
                    height: 12,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
            >
              {/* User info */}
              <div className="px-3 py-2 flex items-center min-w-[220px]">
                <Avatar>{getInitials(user?.name)}</Avatar>
                <div className="flex flex-col">
                  <span
                    className="font-semibold text-gray-800 text-[14px] truncate"
                    title={user?.name}
                  >
                    {user?.name}
                  </span>
                  <span
                    className="text-gray-500 text-[12px] truncate"
                    title={user?.email}
                  >
                    {user?.email}
                  </span>
                </div>
              </div>
              <Divider sx={{ my: 0 }} />
              {/* Menu items */}
              <MenuItem
                onClick={handleProfileClick}
                className="flex items-center gap-2 text-[15px]"
              >
                <FaRegUser /> My Account
              </MenuItem>
              <MenuItem
                onClick={handleLogoutClick}
                className="flex items-center gap-2 text-[15px]"
              >
                <LiaSignOutAltSolid className="text-[18px]" /> Sign Out
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarPage;
