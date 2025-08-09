import React from "react";
import { FaPlus } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import { GoGift } from "react-icons/go";
import { IoStatsChartSharp } from "react-icons/io5";
import { RiProductHuntLine } from "react-icons/ri";
import { PiClockCountdown } from "react-icons/pi";
import { useState } from "react";
import ProductsSection from "./ProductsSection";
import RecentOrders from "./RecentOrders";
import Charts from "./Charts";
import AddProduct from "./AddProduct";

// You can replace these with your actual dynamic values as needed
const stats = [
  {
    name: "Total Users",
    value: 2549,
    icon: <FaUsers className="text-3xl text-white" />,
    icon2: <IoStatsChartSharp className="text-3xl text-white" />,
    bg: "bg-[#24b47e]", // green
  },
  {
    name: "Total Orders",
    value: 636,
    icon: <GoGift className="text-3xl text-white" />,
    icon2: <PiClockCountdown className="text-[33px] text-white" />,
    bg: "bg-[#2279e0]", // blue
  },
  {
    name: "Total Products",
    value: 50,
    icon: <RiProductHuntLine className="text-3xl text-white" />,
    icon2: <IoStatsChartSharp className="text-3xl text-white" />,
    bg: "bg-[#4c45c7]", // purple
  },
  {
    name: "Total Category",
    value: 10,
    icon: <MdCategory className="text-3xl text-white" />,
    icon2: <IoStatsChartSharp className="text-3xl text-white" />,
    bg: "bg-[#fd396e]", // pink/red
  },
];

const Dashboard = () => {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  return (
    <div className="w-full pl-4 pr-2 py-5 min-w-0">
      <div className="rounded-lg bg-[#f1faff] flex flex-col px-5 py-2 md:flex-row items-center justify-between mb-4 shadow-sm border border-[#0000001a]">
        <div className="flex-1">
          <h2 className="text-[35px] leading-10 font-bold text-black mb-3">
            Welcome,
            <br />
            <span className="text-[#3872fa] font-bold">Ayush Kumar Mishra</span>
          </h2>

          <p className="text-gray-600 mb-5">
            Here's what happening on your store today. See the statistics at
            once.
          </p>
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1e48a4] transition text-white rounded shadow font-medium text-base"
          >
            <FaPlus className="text-white text-[16px]" />
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
