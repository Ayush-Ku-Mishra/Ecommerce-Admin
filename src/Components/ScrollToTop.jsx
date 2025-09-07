// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on any route change
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component doesn’t render anything
};

export default ScrollToTop;
