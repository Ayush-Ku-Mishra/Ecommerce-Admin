import React, { useState, useEffect, useContext } from "react";
import { FaBoxes, FaClipboardList } from "react-icons/fa";
import { MdOutlineImage, MdOutlineManageAccounts } from "react-icons/md";
import { HiOutlineChevronDown, HiOutlineChevronRight } from "react-icons/hi";
import { CgMenuGridR } from "react-icons/cg";
import { BsCardImage } from "react-icons/bs";
import { PiSignOutBold } from "react-icons/pi";
import { RxDashboard } from "react-icons/rx";
import { FiUsers } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";
import { FaExchangeAlt } from "react-icons/fa";
import { Context } from "../main"; 
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress
} from "@mui/material";

const menuConfig = [
  { label: "Dashboard", icon: <RxDashboard size={16} />, path: "/dashboard" },
  {
    label: "Home Main Slides",
    icon: <BsCardImage size={16} />,
    path: "/home-slides",
    children: [
      { label: "Add Home Banner Slide", path: "/add-home-banner-slide" },
    ],
  },
  {
    label: "Category",
    icon: <CgMenuGridR size={16} />,
    path: "/category",
    children: [
      { label: "Category List", path: "/category-list" },
      { label: "Add A Category", path: "/add-category" },
      { label: "Sub category List", path: "/sub-category-list" },
      { label: "Add A Sub Category", path: "/add-sub-category" },
    ],
  },
  {
    label: "Products",
    icon: <FaBoxes size={16} />,
    path: "/products",
    children: [
      { label: "Product List", path: "/product-list" },
      { label: "Product Upload", path: "/product-upload" },
      { label: "Add Product Sizechart", path: "/add-product-Sizechart" },
    ],
  },
  { label: "Users", icon: <FiUsers size={16} />, path: "/users" },
  { label: "Orders", icon: <FaClipboardList size={16} />, path: "/orders" },
  // Add Return Management here
  {
    label: "Returns",
    icon: <FaExchangeAlt size={16} />,
    path: "/returns",
    children: [
      { label: "Return Requests", path: "/return-requests" },
      { label: "Return Analytics", path: "/return-analytics" },
    ],
  },
  {
    label: "Manage Logo",
    icon: <MdOutlineManageAccounts size={16} />,
    path: "/manage-logo",
  },
  { label: "Logout", icon: <PiSignOutBold size={16} />, path: null, isLogout: true }, // Changed path to null, added isLogout flag
];

const Sidebar = ({ setSidebarOpen }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [currentLogo, setCurrentLogo] = useState("");
  const [logoLoading, setLogoLoading] = useState(true);
  // Add state for logout dialog
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  
  // Add context and navigate hook
  const { setIsAuthenticated, setUser } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentLogo) {
      setCurrentLogo(
        `${import.meta.env.VITE_BACKEND_URL}/api/placeholder/100/50`
      );
    }
  }, []);

  // Fetch current logo
  const fetchCurrentLogo = async () => {
    setLogoLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/logo/all`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch logos: ${response.statusText}`);
      }

      const data = await response.json();
      const logos = data.logos || [];

      if (logos.length > 0) {
        setCurrentLogo(logos[0].url);
      } else {
        setCurrentLogo(
          `${import.meta.env.VITE_BACKEND_URL}/api/placeholder/100/50`
        );
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

  const handleToggle = (idx) => {
    setOpenIndex((prevIdx) => (prevIdx === idx ? null : idx));
  };

  const isMobile = () => window.innerWidth < 1024;

  const handleMenuClick = () => {
    setOpenIndex(null);
    if (isMobile()) setSidebarOpen(false);
  };

  const handleLogoError = () => {
    // If the dynamic logo fails to load, fall back to a placeholder
    setCurrentLogo("/api/placeholder/100/50");
  };

  // Handle logout dialog open
  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  // Handle logout process
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`, {
        withCredentials: true,
      });

      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("user-info");
      toast.success("Logged out successfully.");
      navigate("/signup"); // redirect to login page
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setLogoutLoading(false);
      setLogoutDialogOpen(false);
    }
  };

  return (
    <>
      <aside className="h-screen w-64 bg-white border-r shadow-sm flex flex-col fixed left-0 top-0 z-40">
        {/* Logo + mobile close button */}
        <div className="flex items-center gap-2 px-7 py-1 mb-3">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center">
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
            </a>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="block lg:hidden ml-2 p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Close Sidebar"
            >
              <IoCloseOutline className="text-2xl text-gray-700" />
            </button>
          </div>
        </div>

        {/* Menu list */}
        <nav className="flex-1 overflow-auto">
          <ul className="px-2 text-[14px]">
            {menuConfig.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <li key={item.label} className="mb-1">
                  {!item.children ? (
                    item.isLogout ? (
                      // Special handling for logout
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded text-gray-700 font-medium hover:bg-gray-100 transition"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ) : item.path ? (
                      <a
                        href={item.path}
                        className="flex items-center gap-3 px-4 py-2 rounded text-gray-700 font-medium hover:bg-gray-100 transition"
                        onClick={handleMenuClick}
                      >
                        {item.icon}
                        {item.label}
                      </a>
                    ) : (
                      <span className="flex items-center gap-3 px-4 py-2 rounded text-gray-700 font-medium">
                        {item.icon}
                        {item.label}
                      </span>
                    )
                  ) : (
                    <>
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2 rounded text-gray-700 font-medium hover:bg-gray-100 transition justify-between"
                        onClick={() => handleToggle(idx)}
                        aria-expanded={isOpen}
                        aria-controls={`submenu-${idx}`}
                      >
                        <span className="flex items-center gap-3">
                          {item.icon}
                          {item.label}
                        </span>
                        <span>
                          {isOpen ? (
                            <HiOutlineChevronDown size={16} />
                          ) : (
                            <HiOutlineChevronRight size={16} />
                          )}
                        </span>
                      </button>
                      <ul
                        id={`submenu-${idx}`}
                        className={`mt-1 list-disc list-inside pl-10 sidebar-submenu${
                          isOpen ? " open" : ""
                        }`}
                        style={{
                          maxHeight: isOpen ? "1000px" : "0",
                          overflow: "hidden",
                          transition: "max-height 0.3s ease",
                        }}
                      >
                        {item.children.map((child) => (
                          <li
                            key={child.label}
                            className="text-gray-800 hover:text-gray-900 hover:bg-gray-100 rounded px-0 py-1.5 text-sm cursor-pointer"
                            style={{ display: "list-item" }}
                          >
                            {child.path ? (
                              <a href={child.path} onClick={handleMenuClick}>
                                {child.label}
                              </a>
                            ) : (
                              <span>{child.label}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Logout Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => !logoutLoading && setLogoutDialogOpen(false)}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            padding: '8px',
            maxWidth: '400px',
            width: '100%'
          }
        }}
      >
        <DialogTitle id="logout-dialog-title" sx={{ pb: 1 }}>
          <div className="text-xl font-semibold text-gray-800">Log Out</div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            <div className="text-gray-700">
              Are you sure you want to log out of your account?
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button 
            onClick={() => setLogoutDialogOpen(false)}
            disabled={logoutLoading}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              py: 1,
              borderColor: 'rgb(229, 231, 235)',
              color: 'rgb(75, 85, 99)',
              fontWeight: 500,
              '&:hover': {
                borderColor: 'rgb(209, 213, 219)',
                backgroundColor: 'rgba(249, 250, 251, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogout}
            disabled={logoutLoading}
            variant="contained"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              py: 1,
              backgroundColor: 'rgb(239, 68, 68)',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgb(220, 38, 38)'
              }
            }}
            startIcon={logoutLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {logoutLoading ? 'Logging out...' : 'Logout'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;