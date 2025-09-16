import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import ProfilePage from "./Components/ProfilePage";
import Dashboard from "./Components/Dashboard";
import MainLayout from "./Components/MainLayout";
import ProductUpload from "./Components/ProductUpload";
import ProductList from "./Components/ProductList";
import { Toaster } from "react-hot-toast";
import AddSize from "./Components/AddSize";
import AddWeight from "./Components/AddWeight";
import ManageLogo from "./Components/ManageLogo";
import Orders from "./Components/Orders";
import HomeBannersList from "./Components/HomeBannersList";
import AddHomeSlideModal from "./Components/AddHomeSlideModal";
import CategoryList from "./Components/CategoryList";
import AddCategory from "./Components/AddCategory";
import SubCategoryList from "./Components/SubCategoryList";
import AddSubCategory from "./Components/AddSubCategory";
import Users from "./Components/Users";
import HomeBannerList from "./Components/HomeBannerList";
import AddHomeBanner from "./Components/AddHomeBanner";
import Login from "./Components/Login";
import ProductDetails from "./Components/ProductDetails";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./Components/ProtectedRoute";
import Logout from "./Components/Logout";
import AddSizechart from "./Components/AddSizechart";
import logo from "./assets/PickoraFavicon.png";

const router = createBrowserRouter([
  {
    path: "/signup", // login page
    element: <Login />,
  },
  {
    element: <ProtectedRoute />, // all routes inside here require authentication
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: <Dashboard /> }, // default/homepage
          { path: "dashboard", element: <Dashboard /> },
          { path: "product-list", element: <ProductList /> },
          { path: "product-upload", element: <ProductUpload /> },
          { path: "add-product-size", element: <AddSize /> },
          { path: "add-product-weight", element: <AddWeight /> },
          { path: "add-product-Sizechart", element: <AddSizechart /> },
          { path: "manage-logo", element: <ManageLogo /> },
          { path: "orders", element: <Orders /> },
          { path: "home-banners-list", element: <HomeBannersList /> },
          { path: "add-home-banner-slide", element: <AddHomeSlideModal /> },
          { path: "category-list", element: <CategoryList /> },
          { path: "add-category", element: <AddCategory /> },
          { path: "sub-category-list", element: <SubCategoryList /> },
          { path: "add-sub-category", element: <AddSubCategory /> },
          { path: "users", element: <Users /> },
          { path: "home-banner-list", element: <HomeBannerList /> },
          { path: "add-home-banner", element: <AddHomeBanner /> },
          { path: "product/:id", element: <ProductDetails /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "logout", element: <Logout /> },
        ],
      },
    ],
  },
  {
    path: "password/reset/:token",
    element: <ResetPassword />,
  },
]);

function App() {
  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          icon: (
            <img
              src={logo}
              alt="logo"
              style={{ width: 20, height: 20, borderRadius: "50%" }}
            />
          ),
          style: {
            borderRadius: "15px",
            background: "#333",
            color: "#fff",
            marginBottom: "60px", 
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
