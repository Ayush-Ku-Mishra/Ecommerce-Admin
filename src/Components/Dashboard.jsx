import React, { useState, useEffect, useContext } from "react";
import { FaPlus } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import { GoGift } from "react-icons/go";
import { IoStatsChartSharp } from "react-icons/io5";
import { RiProductHuntLine } from "react-icons/ri";
import { PiClockCountdown } from "react-icons/pi";
import ProductsSection from "./ProductsSection";
import RecentOrders from "./RecentOrders";
import Charts from "./Charts";
import AddProduct from "./AddProduct";
import { Context } from "../main"; // Adjust the import path to where Context is defined

const Dashboard = () => {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Dynamic state for users, categories, and products count
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // Get user from global context
  const { user } = useContext(Context);

  useEffect(() => {
    const fetchStats = async () => {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}/api/v1`
        : "https://myecommerce-backend-p8ca.onrender.com/api/v1";

      try {
        const headers = {};
        const token = localStorage.getItem("token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Fetch users count
        try {
          const usersRes = await fetch(`${API_BASE_URL}/user/count`, {
            credentials: "include",
            headers: headers,
          });

          if (!usersRes.ok) throw new Error("Failed to fetch users count");
          const usersData = await usersRes.json();
          setTotalUsers(usersData.count || 0);
        } catch (userErr) {
          console.error("Users fetch error:", userErr);
          setTotalUsers(0);
        }

        // Fetch categories
        try {
          const categoriesRes = await fetch(
            `${API_BASE_URL}/category/get-categories`,
            {
              credentials: "include",
              headers: headers,
            }
          );
          if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
          const categoriesData = await categoriesRes.json();
          const rootCategories =
            categoriesData.data?.filter((cat) => !cat.parentId) || [];
          setTotalCategories(rootCategories.length);
        } catch (categoryErr) {
          console.error("Categories fetch error:", categoryErr);
          setTotalCategories(0);
        }

        // Fetch products count
        try {
          const productsRes = await fetch(
            `${API_BASE_URL}/product/getProductsCount`,
            {
              credentials: "include",
              headers: headers,
            }
          );
          if (!productsRes.ok)
            throw new Error("Failed to fetch products count");
          const productsData = await productsRes.json();
          setTotalProducts(productsData.count || 0);
        } catch (productErr) {
          console.error("Products fetch error:", productErr);
          setTotalProducts(0);
        }

        // Fetch orders count
        try {
          const ordersRes = await fetch(
            `${API_BASE_URL}/payment/orders-count`,
            {
              credentials: "include",
              headers: headers,
            }
          );
          if (!ordersRes.ok) throw new Error("Failed to fetch orders count");
          const ordersData = await ordersRes.json();
          setTotalOrders(ordersData.count || 0);
        } catch (orderErr) {
          console.error("Orders fetch error:", orderErr);
          setTotalOrders(0);
        }
      } catch (error) {
        console.error("General stats fetch error:", error);
      }
    };

    fetchStats();
  }, []);

  // Stats array using dynamic values
  const stats = [
    {
      name: "Total Users",
      value: totalUsers,
      icon: <FaUsers className="text-3xl text-white" />,
      icon2: <IoStatsChartSharp className="text-3xl text-white" />,
      bg: "bg-[#24b47e]", // green
    },
    {
      name: "Total Orders",
      value: totalOrders,
      icon: <GoGift className="text-3xl text-white" />,
      icon2: <PiClockCountdown className="text-[33px] text-white" />,
      bg: "bg-[#2279e0]", // blue
    },
    {
      name: "Total Products",
      value: totalProducts,
      icon: <RiProductHuntLine className="text-3xl text-white" />,
      icon2: <IoStatsChartSharp className="text-3xl text-white" />,
      bg: "bg-[#4c45c7]", // purple
    },
    {
      name: "Total Category",
      value: totalCategories,
      icon: <MdCategory className="text-3xl text-white" />,
      icon2: <IoStatsChartSharp className="text-3xl text-white" />,
      bg: "bg-[#fd396e]", // pink/red
    },
  ];

  return (
    <div className="w-full pl-4 pr-2 py-5 min-w-0">
      <div className="rounded-lg bg-[#f1afff] flex flex-col px-5 py-2 md:flex-row items-center justify-between mb-4 shadow-sm border border-[#0000001a]">
        <div className="flex-1">
          <h2 className="text-4xl font-bold leading-tight mb-3 text-black">
            Welcome,
            <br />
            <span className="text-blue-600 font-bold">
              {user ? user.name : "User"}
            </span>
          </h2>
          <p className="text-gray-600 mb-5">
            Here's what’s happening on your store today. See the statistics at
            once.
          </p>
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white font-medium"
          >
            <FaPlus className="text-lg" />
            Add Product
          </button>
        </div>
        <div className="w-56 mx-auto mt-6 md:mt-0 md:ml-10 flex-shrink-0">
          <img
            src="https://ecommerce-admin-view.netlify.app/shop-illustration.webp"
            alt="Store Illustration"
            className="w-full"
            draggable={false}
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 cursor-pointer gap-2 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`rounded-md flex items-center p-5 shadow-md ${stat.bg} text-white`}
          >
            <div className="flex justify-between items-center w-full">
              {/* Left: icon + name + value */}
              <div className="flex items-center">
                <div className="mr-4 flex items-center justify-center">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-md leading-tight">{stat.name}</div>
                  <div className="text-xl font-bold">
                    {stat.value.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Right: icon2 */}
              <div className="flex items-center">{stat.icon2}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="min-w-0 mb-6">
        <ProductsSection />
      </div>
      <div className="min-w-0 mb-6">
        <RecentOrders />
      </div>
      <div className="min-w-0">
        <Charts />
      </div>

      <AddProduct
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
