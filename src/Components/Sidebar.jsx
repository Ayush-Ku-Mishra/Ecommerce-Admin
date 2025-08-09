import React, { useState } from "react";
import { FaBoxes, FaClipboardList } from "react-icons/fa";
import { MdOutlineImage, MdOutlineManageAccounts } from "react-icons/md";
import { HiOutlineChevronDown, HiOutlineChevronRight } from "react-icons/hi";
import { CgMenuGridR } from "react-icons/cg";
import { BsCardImage } from "react-icons/bs";
import { TbBrandBlogger } from "react-icons/tb";
import { PiSignOutBold } from "react-icons/pi";
import Logo from "../assets/LogoPickora.jpg";
import { Link } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { FiUsers } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";

const menuConfig = [
  { label: "Dashboard", icon: <RxDashboard size={16} />, path: "/dashboard" },
  {
    label: "Home Slides",
    icon: <BsCardImage size={16} />,
    path: "/home-slides",
    children: [
      { label: "Home Banners List", path: "/home-banners-list" },
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
      { label: "Add Product SIZE", path: "/add-product-size" },
      { label: "Add Product WEIGHT", path: "/add-product-weight" },
    ],
  },
  { label: "Users", icon: <FiUsers size={16} />, path: "/users" },
  { label: "Orders", icon: <FaClipboardList size={16} />, path: "/orders" },
  {
    label: "Banners",
    icon: <MdOutlineImage size={16} />,
    path: "/banners",
    children: [
      { label: "Home Banner List", path: "/home-banner-list" },
      { label: "Add Home Banner", path: "/add-home-banner" },
      { label: "Home Banner List 2", path: "/home-banner-list-2" },
      { label: "Add Banner", path: "/add-banner" },
    ],
  },
  {
    label: "Manage Logo",
    icon: <MdOutlineManageAccounts size={16} />,
    path: "/manage-logo",
  },
  { label: "Logout", icon: <PiSignOutBold size={16} />, path: "/logout" },
];

const Sidebar = ({ setSidebarOpen }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (idx) => {
    setOpenIndex((prevIdx) => (prevIdx === idx ? null : idx));
  };

  const isMobile = () => window.innerWidth < 1024;

  // ⬇ This will reset submenus and close sidebar if mobile
  const handleMenuClick = () => {
    setOpenIndex(null);
    if (isMobile()) setSidebarOpen(false);
  };

  return (
    <aside className="h-screen w-64 bg-white border-r shadow-sm flex flex-col fixed left-0 top-0 z-40">
      {/* Logo + mobile close button */}
      <div className="flex items-center gap-2 px-7 py-1 mb-3">
        <div className="flex items-center gap-6">
          <Link to="/">
            <img
              src={Logo}
              alt="Pickora Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
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
                  item.path ? (
                    <Link
                      to={item.path}
                      className="flex items-center gap-3 px-4 py-2 rounded text-gray-700 font-medium hover:bg-gray-100 transition"
                      onClick={handleMenuClick} // ✅ Reset here
                    >
                      {item.icon}
                      {item.label}
                    </Link>
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
                            <Link
                              to={child.path}
                              onClick={handleMenuClick} // ✅ Reset here too
                            >
                              {child.label}
                            </Link>
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
  );
};

export default Sidebar;
