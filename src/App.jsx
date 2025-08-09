import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import ProfilePage from "./Components/ProfilePage";
import Dashboard from "./Components/Dashboard";
import MainLayout from "./Components/MainLayout";
import ProductUpload from "./Components/ProductUpload";
import ProductList from "./Components/ProductList";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddSize from "./Components/AddSize";
import AddWeight from "./Components/AddWeight";
import ManageLogo from "./Components/ManageLogo";
import Orders from "./Components/Orders";
import HomeBannersList from "./Components/HomeBannersList";
import AddHomeSlideModal from "./Components/AddHomeSlideModal";

const router = createBrowserRouter([
  {
    path: "/", // Main Layout wrapper for all dashboard-style pages
    element: <MainLayout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "product-list", element: <ProductList /> },
      { path: "product-upload", element: <ProductUpload /> },
      { path: "add-product-size", element: <AddSize/> },
      { path: "add-product-weight", element: <AddWeight/> },
      { path: "manage-logo", element: <ManageLogo/> },
      { path: "orders", element: <Orders/> },
      { path: "home-banners-list", element: <HomeBannersList/> },
      { path: "add-home-banner-slide", element: <AddHomeSlideModal/> },
      // add more dashboard child pages here if needed
    ],
  },
  {
    path: "/profile",
    element: <ProfilePage />, // Profile outside MainLayout
  },
]);

function App() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
        theme="colored"
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
