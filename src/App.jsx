import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import ProfilePage from "./Components/ProfilePage";
import Dashboard from "./Components/Dashboard";
import MainLayout from "./Components/MainLayout";
import ProductUpload from "./Components/ProductUpload";
import ProductList from "./Components/ProductList";
import { Toaster } from "react-hot-toast";
import ManageLogo from "./Components/ManageLogo";
import Orders from "./Components/Orders";
import AddHomeSlideModal from "./Components/AddHomeSlideModal";
import CategoryList from "./Components/CategoryList";
import AddCategory from "./Components/AddCategory";
import SubCategoryList from "./Components/SubCategoryList";
import AddSubCategory from "./Components/AddSubCategory";
import Users from "./Components/Users";
import Login from "./Components/Login";
import ProductDetails from "./Components/ProductDetails";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./Components/ProtectedRoute";
import AddSizechart from "./Components/AddSizechart";
import logo from "./assets/PickoraFavicon.png";
import ReturnManagementSection from "./Components/ReturnManagementSection";
import ProductAnalyticsDashboard from "./Components/ProductAnalyticsDashboard";

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
          { path: "add-product-Sizechart", element: <AddSizechart /> },
          { path: "manage-logo", element: <ManageLogo /> },
          { path: "orders", element: <Orders /> },
          { path: "add-home-banner-slide", element: <AddHomeSlideModal /> },
          { path: "category-list", element: <CategoryList /> },
          { path: "add-category", element: <AddCategory /> },
          { path: "sub-category-list", element: <SubCategoryList /> },
          { path: "add-sub-category", element: <AddSubCategory /> },
          { path: "users", element: <Users /> },
          { path: "product/:id", element: <ProductDetails /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "return-requests", element: <ReturnManagementSection /> },
          { path: "return-analytics", element: <ReturnManagementSection initialTab={1} /> },
          { path: "/product-analytics", element: <ProductAnalyticsDashboard /> },
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
