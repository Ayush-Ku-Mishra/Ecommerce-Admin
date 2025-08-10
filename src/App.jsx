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
import CategoryList from "./Components/CategoryList";
import AddCategory from "./Components/AddCategory";
import SubCategoryList from "./Components/SubCategoryList";
import AddSubCategory from "./Components/AddSubCategory";
import Users from "./Components/Users";
import HomeBannerList from "./Components/HomeBannerList";
import AddHomeBanner from "./Components/AddHomeBanner";

const router = createBrowserRouter([
  {
  path: "/", 
  element: <MainLayout />,
  children: [
    { index: true, element: <Dashboard /> }, // default page when at "/"
    { path: "dashboard", element: <Dashboard /> },
    { path: "product-list", element: <ProductList /> },
    { path: "product-upload", element: <ProductUpload /> },
    { path: "add-product-size", element: <AddSize/> },
    { path: "add-product-weight", element: <AddWeight/> },
    { path: "manage-logo", element: <ManageLogo/> },
    { path: "orders", element: <Orders/> },
    { path: "home-banners-list", element: <HomeBannersList/> },
    { path: "add-home-banner-slide", element: <AddHomeSlideModal/> },
    { path: "category-list", element: <CategoryList/> },
    { path: "add-category", element: <AddCategory/> },
    { path: "sub-category-list", element: <SubCategoryList/> },
    { path: "add-sub-category", element: <AddSubCategory/> },
    { path: "users", element: <Users/> },
    { path: "home-banner-list", element: <HomeBannerList/> },
    { path: "add-home-banner", element: <AddHomeBanner/> },
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
