import React, { useState, useEffect } from "react";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const AdminOrders = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState({});
  const itemsPerPage = 5;

  // Status options for dropdown
  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "paid", label: "Paid", color: "bg-green-100 text-green-800" },
    { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-800" },
    { value: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-800" },
    { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-700" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
  ];

  // Fetch ALL orders from API (not user-specific)
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/payment/admin/all-orders`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const transformedOrders = response.data.data.map((order) => ({
          orderId: order.orderId,
          paymentId: order.paymentId || "N/A",
          name: order.delivery_address?.name || "N/A",
          phoneNumber: order.delivery_address?.phone || "N/A",
          address: `${order.delivery_address?.address_line || ""}, ${
            order.delivery_address?.locality || ""
          }, ${order.delivery_address?.city || ""}, ${
            order.delivery_address?.state || ""
          }`.replace(/^,\s*|,\s*$/g, ""),
          pincode: order.delivery_address?.pincode || "N/A",
          totalAmount: order.TotalAmount || 0,
          email: order.userId?.email || "N/A",
          userName: order.userId?.name || "N/A",
          userId: order.userId?._id || order.userId,
          orderStatus: order.status || "pending",
          paymentStatus: order.paymentStatus || "pending",
          paymentMode:
            order.paymentMethod === "COD"
              ? "Cash On Delivery"
              : "Online Payment",
          date: new Date(order.createdAt).toLocaleString("en-IN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          products:
            order.products?.map((product) => ({
              productId: product.productId,
              title: product.name,
              brand: product.brand,
              image: product.image,
              quantity: product.quantity,
              price: product.price,
              originalPrice: product.originalPrice,
              subTotal: product.price * product.quantity,
              selectedSize: product.selectedSize,
            })) || [],
          rawOrder: order,
        }));

        setOrdersData(transformedOrders);
        setFilteredOrders(transformedOrders);
        console.log(
          `Loaded ${transformedOrders.length} orders for admin panel`
        );
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(
        "Error fetching orders. Please check your admin permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  // Update order status function
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
      
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/payment/admin/update-order-status`,
        {
          orderId: orderId,
          status: newStatus
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        
        // Update the local state
        setOrdersData(prevOrders =>
          prevOrders.map(order =>
            order.orderId === orderId
              ? { ...order, orderStatus: newStatus }
              : order
          )
        );
        
        setFilteredOrders(prevOrders =>
          prevOrders.map(order =>
            order.orderId === orderId
              ? { ...order, orderStatus: newStatus }
              : order
          )
        );
      } else {
        toast.error(response.data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Enhanced search and filtering
  useEffect(() => {
    let filtered = [...ordersData];

    // Text search - Enhanced to search across multiple fields
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        // Basic order fields
        const basicMatch =
          order.orderId.toLowerCase().includes(search) ||
          order.paymentId.toLowerCase().includes(search) ||
          order.name.toLowerCase().includes(search) ||
          order.phoneNumber.includes(search) ||
          order.email.toLowerCase().includes(search) ||
          order.userName.toLowerCase().includes(search) ||
          order.address.toLowerCase().includes(search) ||
          order.pincode.includes(search) ||
          order.orderStatus.toLowerCase().includes(search) ||
          order.paymentStatus.toLowerCase().includes(search) ||
          order.paymentMode.toLowerCase().includes(search);

        // Product search
        const productMatch = order.products.some(
          (product) =>
            product.title.toLowerCase().includes(search) ||
            product.brand?.toLowerCase().includes(search) ||
            product.productId.toString().toLowerCase().includes(search) ||
            product.selectedSize?.toLowerCase().includes(search)
        );

        return basicMatch || productMatch;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) =>
          order.orderStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Payment filter
    if (paymentFilter !== "all") {
      if (paymentFilter === "online") {
        filtered = filtered.filter(
          (order) => order.paymentMode === "Online Payment"
        );
      } else if (paymentFilter === "cod") {
        filtered = filtered.filter(
          (order) => order.paymentMode === "Cash On Delivery"
        );
      }
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, statusFilter, paymentFilter, ordersData]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const toggleRow = (orderId) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    setExpandedRow(null);
  };

  const getStatusBadgeClass = (status) => {
    const statusOption = statusOptions.find(option => option.value === status?.toLowerCase());
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-700";
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getAddressType = (addressType) => {
    return addressType || "Home";
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
  };

  // Function to get allowed status options based on current status and payment method
  const getAllowedStatusOptions = (currentStatus, paymentMethod, paymentStatus) => {
    // For COD orders - different progression since payment is at delivery
    if (paymentMethod === "Cash On Delivery") {
      const codStatusProgression = ["pending", "processing", "shipped", "delivered"];
      const currentIndex = codStatusProgression.indexOf(currentStatus);

      if (currentStatus === "delivered") {
        // Delivered COD orders can only stay delivered or be cancelled
        return statusOptions.filter(option => 
          option.value === "delivered" || option.value === "cancelled"
        );
      }

      // For COD: Allow forward progression but exclude "paid" status (since payment happens at delivery)
      return statusOptions.filter(option => {
        // Never show "paid" status for COD orders
        if (option.value === "paid") return false;
        
        const optionIndex = codStatusProgression.indexOf(option.value);
        return optionIndex >= currentIndex || option.value === "cancelled";
      });
    }

    // For online paid orders, implement business logic
    if (paymentMethod === "Online Payment" && paymentStatus === "completed") {
      const statusProgression = ["pending", "paid", "processing", "shipped", "delivered"];
      const currentIndex = statusProgression.indexOf(currentStatus);

      if (currentStatus === "delivered") {
        // Delivered orders can only stay delivered or be cancelled
        return statusOptions.filter(option => 
          option.value === "delivered" || option.value === "cancelled"
        );
      }

      // Allow current status, forward progression, and cancellation
      return statusOptions.filter(option => {
        const optionIndex = statusProgression.indexOf(option.value);
        return optionIndex >= currentIndex || option.value === "cancelled";
      });
    }

    // Default: allow all options for other cases
    return statusOptions;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-md min-w-0 overflow-hidden shadow-md">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading all orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md min-w-0 overflow-hidden shadow-md">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row items-center justify-between py-4 px-4 gap-4 bg-gray-50 border-b">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">
            🛍️ All Orders ({filteredOrders.length})
          </h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            >
              <option value="all">All Payments</option>
              <option value="online">Online Payment</option>
              <option value="cod">Cash On Delivery</option>
            </select>

            {/* Clear filters button */}
            {(searchTerm ||
              statusFilter !== "all" ||
              paymentFilter !== "all") && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full lg:w-[50%]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders, customers, products, payment IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-10 py-2 w-full bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 text-lg font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-0 min-w-0 w-full">
        <div className="w-full h-[500px] overflow-x-auto overflow-y-auto custom-scrollbar">
          {currentOrders.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 text-lg mb-2">No orders found</p>
                {searchTerm ||
                statusFilter !== "all" ||
                paymentFilter !== "all" ? (
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">
                      Try adjusting your search criteria or filters
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    No orders available in the system
                  </p>
                )}
              </div>
            </div>
          ) : (
            <table className="min-w-[1500px] w-full text-xs md:text-sm text-left text-gray-500">
              <thead className="text-xs md:text-sm uppercase text-white bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 w-12 text-center"></th>
                  <th className="px-3 py-3 whitespace-nowrap">Order ID</th>
                  <th className="px-3 py-3 whitespace-nowrap">Payment ID</th>
                  <th className="px-3 py-3 whitespace-nowrap">Customer</th>
                  <th className="px-3 py-3 whitespace-nowrap">Phone</th>
                  <th className="px-3 py-3 whitespace-nowrap">Email</th>
                  <th className="px-3 py-3 whitespace-nowrap">User Id</th>
                  <th className="px-3 py-3 whitespace-nowrap">Address</th>
                  <th className="px-3 py-3 whitespace-nowrap">Amount</th>
                  <th className="px-3 py-3 whitespace-nowrap">Order Status</th>
                  <th className="px-3 py-3 whitespace-nowrap">Update Status</th>
                  <th className="px-3 py-3 whitespace-nowrap">Payment Status</th>
                  <th className="px-3 py-3 whitespace-nowrap">Payment Mode</th>
                  <th className="px-3 py-3 whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {currentOrders.map((order, idx) => (
                  <React.Fragment key={order.orderId + idx}>
                    <tr className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => toggleRow(order.orderId + idx)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all duration-200 mx-auto"
                        >
                          {expandedRow === order.orderId + idx ? (
                            <FaChevronDown className="text-gray-600 text-sm" />
                          ) : (
                            <FaChevronUp className="text-gray-600 text-sm" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-semibold text-blue-600 text-xs">
                          {order.orderId}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-700">
                        {order.paymentId}
                      </td>
                      <td className="px-3 py-3 text-xs font-medium text-gray-800 whitespace-nowrap">
                        <div>
                          <div className="font-semibold">{order.name}</div>
                          {order.userName !== "N/A" &&
                            order.userName !== order.name && (
                              <div className="text-gray-500 text-xs">
                                ({order.userName})
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600">
                        {order.phoneNumber}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600">
                        <div title={order.email}>{order.email}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-[12px] md:text-[13px] text-gray-700">
                        <span className="text-xs">{String(order.userId)}</span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500">
                        <span className="inline-block text-xs font-medium px-2 py-1 rounded-md bg-blue-500 text-white mb-1">
                          {getAddressType(
                            order.rawOrder?.delivery_address?.type
                          )}
                        </span>
                        <div
                          className="block w-[400px] text-gray-600"
                          title={order.address}
                        >
                          {order.address}
                        </div>
                        <div className="text-gray-500 font-medium">
                          PIN: {order.pincode}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-semibold text-blue-600">
                        <div className="text-md">
                          ₹{Number(order.totalAmount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadgeClass(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      {/* New Status Update Dropdown Column */}
                      <td className="px-3 py-3">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                          disabled={updatingStatus[order.orderId]}
                          className="border border-gray-300 rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                        >
                          {getAllowedStatusOptions(
                            order.orderStatus, 
                            order.paymentMode, 
                            order.paymentStatus
                          ).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {updatingStatus[order.orderId] && (
                          <div className="text-xs text-gray-500 mt-1">
                            Updating...
                          </div>
                        )}
                        {/* Show info for restricted orders */}
                        {order.paymentMode === "Online Payment" && order.paymentStatus === "completed" && (
                          <div className="text-xs text-gray-500 mt-1">
                            Paid order - forward only
                          </div>
                        )}
                        {order.paymentMode === "Cash On Delivery" && (
                          <div className="text-xs text-blue-600 mt-1">
                            COD - payment at delivery
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${getPaymentStatusBadgeClass(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-md font-medium text-green-700">
                        <div>{order.paymentMode}</div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500">
                        <div>{order.date}</div>
                      </td>
                    </tr>

                    {/* Expanded Product Details */}
                    {expandedRow === order.orderId + idx && (
                      <tr className="bg-gray-200 border-b border-gray-200">
                        <td colSpan="14" className="px-4 md:px-6 py-4">
                          <div className="bg-white rounded-lg shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="min-w-[500px] w-[60%] text-xs md:text-sm">
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
                                      Size
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
                                  {order.products.map((product, index) => (
                                    <tr
                                      key={product.productId + index}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-500">
                                        <span className="text-xs">
                                          {String(product.productId)}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                        <span className="block max-w-[200px] text-xs">
                                          {product.title}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2">
                                        <img
                                          src={
                                            product.image || "/placeholder.jpg"
                                          }
                                          alt={product.title}
                                          className="w-10 h-10 md:w-12 md:h-12 rounded-md object-cover"
                                          onError={(e) => {
                                            e.target.src = "/placeholder.jpg";
                                          }}
                                        />
                                      </td>
                                      <td className="px-4 py-2 text-xs text-gray-600">
                                        {product.selectedSize || "N/A"}
                                      </td>
                                      <td className="px-4 py-2">
                                        <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 bg-blue-100 text-blue-800 text-xs md:text-sm font-medium rounded-full">
                                          {product.quantity}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-900">
                                        ₹{Number(product.price).toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                                        ₹{Number(product.subTotal).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                  <tr>
                                    <td
                                      colSpan="5"
                                      className="px-4 py-3 text-right text-sm font-bold text-gray-900"
                                    >
                                      Total Amount:
                                    </td>
                                    <td
                                      className="px-4 py-3 text-right text-md font-bold text-blue-600"
                                      colSpan="2"
                                    >
                                      ₹{Number(order.totalAmount).toFixed(2)}
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
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="bg-gray-50 border-t">
          <Stack spacing={2} alignItems="center" className="py-6">
            <div className="text-sm text-gray-600 mb-2">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredOrders.length)} of{" "}
              {filteredOrders.length} orders
            </div>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              showFirstButton
              showLastButton
              color="primary"
              size="medium"
            />
          </Stack>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;