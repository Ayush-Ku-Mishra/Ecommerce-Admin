import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import NavbarPage from "./NavbarPage";
import { Outlet, ScrollRestoration } from "react-router-dom"; // <-- Add ScrollRestoration import
import ScrollToTop from "./ScrollToTop";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen overflow-hidden">
      <ScrollToTop />

      <div
        className={`fixed inset-0 bg-black z-30 lg:hidden transition-all duration-500 ease-in-out ${
          sidebarOpen
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white z-40 shadow
          transform transition-transform duration-500 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ willChange: "transform" }}
      >
        <Sidebar setSidebarOpen={setSidebarOpen} />
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <NavbarPage sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main
          className={`flex-1 mt-12 transition-all duration-500 ease-in-out ${
            sidebarOpen ? "lg:ml-64" : "ml-0"
          }`}
        >
          <Outlet context={{ sidebarOpen, setSidebarOpen }} />{" "}
          {/* <-- this will render child route component */}
        </main>
      </div>
      {/* Add ScrollRestoration here - at the end but still inside the layout */}
      <ScrollRestoration
        getKey={(location, matches) => {
          // Use pathname as the key for scroll restoration
          return location.pathname;
        }}
      />
    </div>
  );
};

export default MainLayout;
