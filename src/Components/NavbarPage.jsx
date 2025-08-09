import React from "react";
import Logo from "../assets/LogoPickora.jpg";
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

const NavbarPage = ({ sidebarOpen, setSidebarOpen }) => {
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const getInitials = (fullName) => {
    const names = fullName.trim().split(" ");
    if (names.length === 0) return "";
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  // Hardcoded user for this demo (replace with real user data as needed)
  const user = {
    name: "Ayush Kumar Mishra",
    email: "amishra59137@gmail.com",
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

  const handleLogoutClick = () => {
    // replace with your logout logic
    alert("Logged out");
    handleMenuClose();
  };

  return (
    <div className="relative flex">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed top-0 left-0 h-screen w-64 z-40 transition-all duration-300">
          <Sidebar setSidebarOpen={setSidebarOpen}/>
        </div>
      )}

      {/* Everything else shifts right when sidebarOpen. Margin changed to ml-64 to match sidebar width */}
      <div
        className={`flex-1 transition-all duration-600 ${
          sidebarOpen ? "lg:ml-64" : "ml-0"
        }`}
      >
        <div className="w-full bg-white h-[50px] flex items-center justify-between px-6 shadow-md fixed top-0 left-0 right-0 z-30">
          {/* Left group: logo fixed, menu icon shifts */}
          <div className="flex items-center gap-8">
            {/* Logo - no margin shift */}
            <Link to="/dashboard">
              <img
                src={Logo}
                alt="Pickora Logo"
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* Menu icon button - applies margin shift alone */}
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

          {/* Right group (notifications, avatar) stays fixed, unshifted */}
          <div className="flex items-center gap-5 pr-2 overflow-hidden">
            <Button className="!w-[40px] !h-[40px] !rounded-full !min-w-[40px]">
              <IoMdNotificationsOutline className="text-[27px] text-gray-700" />
            </Button>

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
                {getInitials(user.name)}
              </Avatar>
            </Button>

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
                    ml: 0,
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
              {/* User info at top */}
              <div className="px-3 py-2 flex items-center min-w-[220px]">
                <div>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: "1rem",
                      bgcolor: "#455a64",
                    }}
                  >
                    {getInitials(user.name)}
                  </Avatar>
                </div>
                <div className="flex flex-col">
                  <span
                    className="font-semibold text-gray-800 text-[14px] truncate"
                    title={user.name}
                  >
                    {user.name}
                  </span>
                  <span
                    className="text-gray-500 text-[12px] truncate"
                    title={user.email}
                  >
                    {user.email}
                  </span>
                </div>
              </div>
              <Divider sx={{ my: 0 }} />
              {/* Menu items */}
              <MenuItem
                onClick={handleProfileClick}
                className="flex items-center gap-2 text-[15px]"
              >
                <Link to="/account/profile" className="flex items-center gap-2">
                  <FaRegUser /> My Account
                </Link>
              </MenuItem>
              <MenuItem
                onClick={handleLogoutClick}
                className="flex items-center gap-2 text-[15px]"
              >
                <Link to="/account/profile" className="flex items-center gap-2">
                  <LiaSignOutAltSolid className="text-[18px]" /> Sign Out
                </Link>
              </MenuItem>
            </Menu>
          </div>
        </div>

        {/* Placeholder for other main content below navbar */}
      </div>
    </div>
  );
};

export default NavbarPage;
