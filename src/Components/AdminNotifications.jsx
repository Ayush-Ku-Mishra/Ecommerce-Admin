import React, { useState, useEffect } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaBell, FaShoppingCart, FaCheck } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { MdDeleteForever } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/notifications/all`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/v1/notifications/mark-read/${notificationId}`,
        {},
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await axios.put(
        `${API_BASE_URL}/api/v1/notifications/mark-all-read`,
        {},
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete notification - THIS WAS MISSING!
  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      // Find notification before removing from state
      const deletedNotification = notifications.find(
        (n) => n._id === notificationId
      );

      await axios.delete(
        `${API_BASE_URL}/api/v1/notifications/delete/${notificationId}`,
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
      toast.success("Notification deleted successfully");

      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    setIsOpen(false);
    navigate("/orders");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".notification-container")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get notification icon
  const getNotificationIcon = (type, paymentMethod) => {
    switch (type) {
      case "new_order":
        return paymentMethod === "COD" ? (
          <FaShoppingCart className="text-orange-500" />
        ) : (
          <MdPayment className="text-green-500" />
        );
      default:
        return <FaBell className="text-blue-500" />;
    }
  };

  // Format time
  const formatTime = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMs = now - notificationDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return notificationDate.toLocaleDateString();
  };

  return (
    <>
      {/* Notification Button */}
      <div className="notification-container relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="Notifications"
        >
          <IoMdNotificationsOutline className="text-[27px] text-gray-700" />

          {/* Unread Count Badge */}
          {unreadCount > 0 && (
            <span
              className="absolute bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse"
              style={{ top: "4px", right: "4px" }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

          {/* Pulsing dot for new notifications */}
          {unreadCount > 0 && (
            <span
              className="absolute bg-red-500 rounded-full w-[18px] h-[18px] animate-ping"
              style={{ top: "4px", right: "4px" }}
            ></span>
          )}
        </button>
      </div>

      {/* Dropdown Portal - Rendered at document level */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] animate-in fade-in duration-200"
          style={{ pointerEvents: "none" }}
        >
          {/* Position the dropdown */}
          <div
            className="absolute top-12 right-2 sm:right-4 w-[95vw] sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[85vh] sm:max-h-96 overflow-hidden animate-in slide-in-from-top-2 duration-300"
            style={{
              pointerEvents: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              maxWidth: "calc(100vw - 16px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-red-500 font-normal">
                    ({unreadCount} new)
                  </span>
                )}
              </h3>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <FaCheck size={12} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-72 sm:max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FaBell className="mx-auto text-4xl mb-3 text-gray-300" />
                  <p>No notifications yet</p>
                  <p className="text-sm">
                    New order notifications will appear here
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 sm:p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors group ${
                      !notification.isRead
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(
                          notification.type,
                          notification.paymentMethod
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-gray-800 truncate pr-2">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>
                            {/* Delete Button */}
                            <button
                              onClick={(e) =>
                                deleteNotification(notification._id, e)
                              }
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-full transition-all duration-200"
                              title="Delete notification"
                            >
                              <MdDeleteForever className="text-red-500 text-md" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-2 pr-8">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500 flex-wrap gap-1">
                          <span className="truncate">
                            Order: {notification.orderId}
                          </span>
                          <span className="font-semibold text-green-600 flex-shrink-0">
                            ₹{notification.orderAmount?.toLocaleString()}
                          </span>
                        </div>

                        {/* Payment method badge */}
                        <div className="mt-2">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              notification.paymentMethod === "COD"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {notification.paymentMethod === "COD"
                              ? "Cash on Delivery"
                              : "Online Payment"}
                          </span>
                        </div>
                      </div>

                      {/* Unread indicator */}
                      {!notification.isRead && (
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => {
                    navigate("/orders");
                    setIsOpen(false);
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Orders →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNotifications;
