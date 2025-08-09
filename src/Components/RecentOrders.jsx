import React, { useState } from "react";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

const ordersData = [
  {
    orderId: "688c37d9228db479bbabeb38",
    paymentId: "PAYX34232",
    name: "Amit Kumar",
    phoneNumber: "9876543210",
    address:
      "NEAR SHIV TEMPLE GARH RD SHAHJHANPUR OUTER MEERUT UTTAR PARDESH MEERUT BHAWANI DEGREE COLLEGE UTTAR PRADESH India 917505794206",
    pincode: "560001",
    totalAmount: 1750.0,
    email: "amit.kumar@example.com",
    userId: "USER102",
    orderStatus: "Delivered",
    paymentMode: "Cash On Delivery",
    date: "2025-08-08 10:25 AM",
    products: [
      {
        productId: "PROD001",
        title:
          "TRIGGR Trinity 2 with Dual Pairing, ENC, Fast Charge, 50H Battery, Rubber Finish, v5.3 Bluetooth (Cobalt Blue, On the Ear)",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop",
        quantity: 2,
        price: 599.0,
        subTotal: 1198.0,
      },
      {
        productId: "PROD002",
        title: "Smart Phone Case",
        image:
          "https://images.unsplash.com/photo-1601593346740-925612772716?w=150&h=150&fit=crop",
        quantity: 1,
        price: 299.0,
        subTotal: 299.0,
      },
      {
        productId: "PROD003",
        title: "USB Charging Cable",
        image:
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=150&h=150&fit=crop",
        quantity: 3,
        price: 84.33,
        subTotal: 253.0,
      },
    ],
  },
  {
    orderId: "688c37d9228db479bbabeb39",
    paymentId: "PAYX87879",
    name: "Priya Singh",
    phoneNumber: "9123456789",
    address: "45 Nehru Street, New Delhi, DL",
    pincode: "110002",
    totalAmount: 820.0,
    email: "priya.singh@example.com",
    userId: "USER315",
    orderStatus: "Shipped",
    paymentMode: "Cash On Delivery",
    date: "2025-08-08 09:15 AM",
    products: [
      {
        productId: "PROD004",
        title: "Laptop Stand",
        image:
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&h=150&fit=crop",
        quantity: 1,
        price: 820.0,
        subTotal: 820.0,
      },
    ],
  },
  {
    orderId: "688c37d9228db479bbabeb34",
    paymentId: "PAYX99712",
    name: "John Abraham",
    phoneNumber: "9998877665",
    address: "221B Baker Street, Mumbai, MH",
    pincode: "400003",
    totalAmount: 2399.0,
    email: "john.abraham@example.com",
    userId: "USER647",
    orderStatus: "Processing",
    paymentMode: "Cash On Delivery",
    date: "2025-08-07 04:56 PM",
    products: [
      {
        productId: "PROD005",
        title: "Gaming Mouse",
        image:
          "https://images.unsplash.com/photo-1527814050087-3793815479db?w=150&h=150&fit=crop",
        quantity: 1,
        price: 1299.0,
        subTotal: 1299.0,
      },
      {
        productId: "PROD006",
        title: "Mechanical Keyboard",
        image:
          "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=150&h=150&fit=crop",
        quantity: 1,
        price: 1100.0,
        subTotal: 1100.0,
      },
    ],
  },
  {
    orderId: "688c37d9228db479bbabeb37",
    paymentId: "PAYX55433",
    name: "Meera Das",
    phoneNumber: "9881122334",
    address: "56 Park Lane, Kolkata, WB",
    pincode: "700017",
    totalAmount: 400.0,
    email: "meera.das@example.com",
    userId: "USER224",
    orderStatus: "Cancelled",
    paymentMode: "Cash On Delivery",
    date: "2025-08-07 11:03 AM",
    products: [
      {
        productId: "PROD007",
        title: "Coffee Mug",
        image:
          "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=150&h=150&fit=crop",
        quantity: 2,
        price: 200.0,
        subTotal: 400.0,
      },
    ],
  },
  {
    orderId: "688c37d9228db479bbabeb35",
    paymentId: "PAYX34233",
    name: "Rahul Sharma",
    phoneNumber: "9876543211",
    address:
      "NEAR SHIV TEMPLE GARH RD SHAHJHANPUR OUTER MEERUT UTTAR PARDESH MEERUT BHAWANI DEGREE COLLEGE UTTAR PRADESH India 917505794206",
    pincode: "560002",
    totalAmount: 1850.0,
    email: "rahul.sharma@example.com",
    userId: "USER103",
    orderStatus: "Delivered",
    paymentMode: "Cash On Delivery",
    date: "2025-08-08 11:30 AM",
    products: [
      {
        productId: "PROD008",
        title: "Water Bottle",
        image:
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=150&h=150&fit=crop",
        quantity: 1,
        price: 450.0,
        subTotal: 450.0,
      },
      {
        productId: "PROD009",
        title: "Notebook Set",
        image:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&h=150&fit=crop",
        quantity: 2,
        price: 700.0,
        subTotal: 1400.0,
      },
    ],
  },
  {
    orderId: "688c37d9228db479bbabeb36",
    paymentId: "PAYX34234",
    name: "Sneha Patel",
    phoneNumber: "9876543212",
    address:
      "NEAR SHIV TEMPLE GARH RD SHAHJHANPUR OUTER MEERUT UTTAR PARDESH MEERUT BHAWANI DEGREE COLLEGE UTTAR PRADESH India 917505794206",
    pincode: "560003",
    totalAmount: 1950.0,
    email: "sneha.patel@example.com",
    userId: "USER104",
    orderStatus: "Delivered",
    paymentMode: "Cash On Delivery",
    date: "2025-08-08 12:45 PM",
    products: [
      {
        productId: "PROD010",
        title: "Desk Lamp",
        image:
          "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150&h=150&fit=crop",
        quantity: 1,
        price: 950.0,
        subTotal: 950.0,
      },
      {
        productId: "PROD011",
        title: "Plant Pot",
        image:
          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=150&h=150&fit=crop",
        quantity: 2,
        price: 500.0,
        subTotal: 1000.0,
      },
    ],
  },
];

const RecentOrders = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const totalPages = Math.ceil(ordersData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = ordersData.slice(startIndex, endIndex);

  const toggleRow = (orderId) => {
    if (expandedRow === orderId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(orderId);
    }
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    setExpandedRow(null); // Close any expanded row when changing page
  };

  return (
    <div className="bg-white rounded-md min-w-0 overflow-hidden shadow-md">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-2 px-4 gap-3">
        <p className="text-[18px] font-semibold text-gray-800 text-center sm:text-left">
          Recent Orders
        </p>

        <div className="w-full sm:w-[50%]">
          <label className="opacity-0 select-none">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search here..."
              className="border border-gray-300 rounded-md px-10 py-2 w-full bg-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm md:text-base"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 min-w-0 w-full">
        <div className="w-full h-[400px] overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="min-w-[800px] md:min-w-[1000px] w-full text-xs md:text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs md:text-sm uppercase text-[#f1f1f1] bg-gray-800 sticky top-0 z-10">
              <tr>
                <th
                  scope="col"
                  className="px-2 md:px-6 py-3 whitespace-nowrap w-12"
                ></th>
                <th scope="col" className="px-2 md:px-6 py-0 whitespace-nowrap">
                  Order Id
                </th>
                <th scope="col" className="px-2 md:px-6 py-3 whitespace-nowrap">
                  Payment Id
                </th>
                <th scope="col" className="px-2 md:px-6 py-3 whitespace-nowrap">
                  Name
                </th>
                <th scope="col" className="px-2 md:px-6 py-3 whitespace-nowrap">
                  Phone Number
                </th>
                <th scope="col" className="px-2 md:px-6 py-3 whitespace-nowrap">
                  Address
                </th>
                <th scope="col" className="px-2 md:px-6 py-3 whitespace-nowrap">
                  Pincode
                </th>
                <th scope="col" className="px-2 md:px-6 py-3 whitespace-nowrap">
                  Total Amount
                </th>
                <th scope="col" className="px-2 md:px-6 py-3 whitespace-nowrap">
                  Email
                </th>
                <th scope="col" className="px-2 md:px-6 py-3 whitespace-nowrap">
                  User Id
                </th>
                <th scope="col" className="px-2 md:px-6 py-3 whitespace-nowrap">
                  Order Status
                </th>
                <th scope="col" className="px-2 md:px-6 py-3 whitespace-nowrap">
                  Payment Mode
                </th>
                <th scope="col" className="px-2 md:px-6 py-3 whitespace-nowrap">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {ordersData.map((order, idx) => (
                <React.Fragment key={order.orderId + idx}>
                  <tr className="border-b border-gray-200 transition hover:bg-blue-50">
                    {/* Expand/Collapse Icon */}
                    <td className="px-2 md:px-6 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(order.orderId + idx);
                        }}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all duration-200"
                      >
                        {expandedRow === order.orderId + idx ? (
                          <FaChevronDown className="text-gray-600 text-sm" />
                        ) : (
                          <FaChevronUp className="text-gray-600 text-sm" />
                        )}
                      </button>
                    </td>

                    {/* Order ID */}
                    <td className="px-2 md:px-6 py-3">
                      <span className="font-semibold text-blue-500 whitespace-nowrap">
                        {order.orderId}
                      </span>
                    </td>

                    {/* Payment ID */}
                    <td className="px-2 md:px-6 py-3 whitespace-nowrap text-[12px] md:text-[14px] text-gray-700">
                      {order.paymentId}
                    </td>

                    {/* Name */}
                    <td className="px-2 md:px-6 py-3 whitespace-nowrap text-[12px] md:text-[14px] text-gray-800">
                      {order.name}
                    </td>

                    {/* Phone */}
                    <td className="px-2 md:px-6 py-3 whitespace-nowrap text-[12px] md:text-[14px] text-gray-600">
                      {order.phoneNumber}
                    </td>

                    {/* Address */}
                    <td className="px-2 md:px-6 py-3 text-[12px] md:text-[13px] text-gray-500">
                      <span className="inline-block text-[11px] md:text-[13px] font-[500] p-1 rounded-md bg-blue-500 text-white">
                        Home
                      </span>
                      <span className="block w-[400px]">{order.address}</span>
                    </td>

                    {/* Pincode */}
                    <td className="px-2 md:px-6 py-3 whitespace-nowrap text-gray-600">
                      {order.pincode}
                    </td>

                    {/* Amount */}
                    <td className="px-2 md:px-6 py-3 whitespace-nowrap font-semibold text-blue-600">
                      ₹{order.totalAmount.toFixed(2)}
                    </td>

                    {/* Email */}
                    <td className="px-2 md:px-6 py-3 whitespace-nowrap text-[12px] md:text-[13px] text-gray-500">
                      {order.email}
                    </td>

                    {/* User ID */}
                    <td className="px-2 md:px-6 py-3 whitespace-nowrap text-[12px] md:text-[13px] text-gray-700">
                      {order.userId}
                    </td>

                    {/* Status Badge */}
                    <td className="px-2 md:px-6 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-semibold
                      ${
                        order.orderStatus === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.orderStatus === "Shipped"
                          ? "bg-blue-100 text-blue-700"
                          : order.orderStatus === "Processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.orderStatus === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    `}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="px-2 md:px-6 py-3 whitespace-nowrap text-[12px] md:text-[14px] font-semibold text-green-800">
                      {order.paymentMode}
                    </td>

                    {/* Date */}
                    <td className="px-2 md:px-6 py-3 whitespace-nowrap text-[11px] md:text-[13px] text-gray-500">
                      {order.date}
                    </td>
                  </tr>

                  {/* Collapsible Product Details */}
                  {expandedRow === order.orderId + idx && (
                    <tr className="bg-gray-200 border-b border-gray-200">
                      <td colSpan="13" className="px-4 md:px-6 py-4">
                        <div className="bg-white rounded-lg shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="min-w-[500px] w-[50%] text-xs md:text-sm">
                              <thead className="bg-gray-600 text-[#f1f1f1]">
                                <tr>
                                  <th className="px-4 py-3 text-xs font-medium uppercase whitespace-nowrap">
                                    Product ID
                                  </th>
                                  <th className="px-4 py-3 text-xs font-medium uppercase whitespace-nowrap">
                                    Product Title
                                  </th>
                                  <th className="px-4 py-3 text-xs font-medium uppercase whitespace-nowrap">
                                    Product
                                  </th>
                                  <th className="px-4 py-3 text-xs font-medium uppercase whitespace-nowrap">
                                    Quantity
                                  </th>
                                  <th className="px-4 py-3 text-xs font-medium uppercase whitespace-nowrap">
                                    Price
                                  </th>
                                  <th className="px-4 py-3 text-xs font-medium uppercase whitespace-nowrap">
                                    Sub Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {order.products.map((product) => (
                                  <tr
                                    key={product.productId}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-500">
                                      {product.productId}
                                    </td>
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                      <span className="block max-w-[200px]">
                                        {product.title}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2">
                                      <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-md object-cover"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 bg-blue-100 text-blue-800 text-xs md:text-sm font-medium rounded-full">
                                        {product.quantity}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      ₹{product.price.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                                      ₹{product.subTotal.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td
                                    colSpan="4"
                                    className="px-4 py-3 text-right text-sm font-bold text-gray-900"
                                  >
                                    Total Amount:
                                  </td>
                                  <td className="px-4 py-3 text-right text-md font-bold text-blue-600">
                                    ₹{order.totalAmount.toFixed(2)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Stack spacing={2} alignItems="center" className="mt-7 mb-4">
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          showFirstButton
          showLastButton
          color="gray"
          size="medium"
        />
      </Stack>
    </div>
  );
};

export default RecentOrders;
