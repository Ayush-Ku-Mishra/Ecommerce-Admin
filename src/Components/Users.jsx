import React, { useState, useEffect, useContext } from "react";
import {
  FaSearch,
  FaTimes,
  FaUserEdit,
  FaFileExport,
  FaUserCog,
  FaFilter,
  FaEnvelope,
  FaSort,
} from "react-icons/fa";
import {
  Checkbox,
  TablePagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Switch,
  Chip,
  Tooltip,
  FormControlLabel,
  Divider,
  IconButton,
  Menu,
} from "@mui/material";
import { RiMailCheckLine } from "react-icons/ri";
import { IoMdCall } from "react-icons/io";
import { SlCalender } from "react-icons/sl";
import {
  MdDelete,
  MdEdit,
  MdInfo,
  MdContentCopy,
  MdVerified,
} from "react-icons/md";
import { FiDownload, FiFilter } from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";
import toast from "react-hot-toast";
import { Context } from "../main";
import axios from "axios";

const ROWS_PER_PAGE = 50;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
  const [selected, setSelected] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [imageModal, setImageModal] = useState({
    open: false,
    image: "",
    userName: "",
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: "single", // 'single' or 'bulk'
    userId: null,
    userName: "",
    selectedCount: 0,
  });
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    verified: 0,
    googleUsers: 0,
    adminUsers: 0,
  });
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    verified: "all",
    signupMethod: "all",
  });
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    field: "createdAt",
    direction: "desc",
  });
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    user: null,
  });
  const [editModal, setEditModal] = useState({
    open: false,
    user: null,
    loading: false,
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [bulkActionMenuAnchor, setBulkActionMenuAnchor] = useState(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [statusChangeModal, setStatusChangeModal] = useState({
    open: false,
    status: "",
    selectedUsers: [],
    loading: false,
  });
  const { isAuthenticated, user, setSessionExpired } = useContext(Context);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

      const response = await axios.get(`${BASE_URL}/api/v1/user/all`, {
        withCredentials: true,
      });

      console.log("API Response:", response.data); // Add this for debugging

      if (response.data.success) {
        setUsers(response.data.users || []);
        setFilteredUsers(response.data.users || []);

        // Set stats if they exist in the response
        if (response.data.stats) {
          console.log("Setting stats:", response.data.stats);
          setUserStats(response.data.stats);
        } else {
          console.warn("No stats data in API response");
        }
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((user) => {
        const name = user.name || "";
        const email = user.email || "";
        const phone = user.phone || "";

        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          phone.includes(searchQuery)
        );
      });
    }

    // Apply role filter
    if (filters.role !== "all") {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((user) => user.status === filters.status);
    }

    // Apply verified filter
    if (filters.verified !== "all") {
      filtered = filtered.filter((user) =>
        filters.verified === "verified"
          ? user.accountVerified
          : !user.accountVerified
      );
    }

    // Apply signup method filter
    if (filters.signupMethod !== "all") {
      filtered = filtered.filter((user) =>
        filters.signupMethod === "google"
          ? user.signUpWithGoogle
          : !user.signUpWithGoogle
      );
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      const field = sortConfig.field;

      if (field === "createdAt" || field === "last_login_date") {
        const dateA = a[field] ? new Date(a[field]) : new Date(0);
        const dateB = b[field] ? new Date(b[field]) : new Date(0);

        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        const valueA = a[field] || "";
        const valueB = b[field] || "";

        return sortConfig.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });

    setFilteredUsers(filtered);
    setPage(0); // Reset to first page when filters change
    setSelected({}); // Clear selections
    setSelectAll(false);
  }, [searchQuery, users, filters, sortConfig]);

  // Calculate pagination
  const pagedData = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      const newSelected = {};
      pagedData.forEach((_, idx) => {
        newSelected[page * rowsPerPage + idx] = true;
      });
      setSelected(newSelected);
    } else {
      setSelected({});
    }
  };

  const handleSelect = (globalIdx) => (event) => {
    setSelected((prev) => ({
      ...prev,
      [globalIdx]: event.target.checked,
    }));

    // Update selectAll state
    const newSelected = { ...selected, [globalIdx]: event.target.checked };
    const selectedCount = Object.values(newSelected).filter(Boolean).length;
    setSelectAll(selectedCount === pagedData.length);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
    setSelected({});
    setSelectAll(false);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRows = parseInt(event.target.value, 10);
    setRowsPerPage(newRows);
    setPage(0);
    setSelected({});
    setSelectAll(false);
  };

  const debugAuth = () => {
    const token = localStorage.getItem("token");
    console.log("Current token in localStorage:", token ? "exists" : "missing");
    console.log("isAuthenticated from context:", isAuthenticated);

    // Try to decode the token to check its validity
    if (token) {
      try {
        // Simple check if token has expected parts (header.payload.signature)
        const parts = token.split(".");
        console.log("Token format valid:", parts.length === 3);

        // Log expiry if possible
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            console.log("Token payload:", payload);
            if (payload.exp) {
              const expiry = new Date(payload.exp * 1000);
              console.log("Token expires:", expiry);
              console.log("Is expired:", expiry < new Date());
            }
          } catch (e) {
            console.log("Could not decode payload", e);
          }
        }
      } catch (e) {
        console.log("Error inspecting token", e);
      }
    }
  };

  // Delete single user - open confirmation modal
  const handleDeleteUser = async (user) => {
    debugAuth();
    setDeleteModal({
      open: true,
      type: "single",
      userId: user._id,
      userName: user.name,
      selectedCount: 0,
    });
  };

  // Confirm single user deletion
  const confirmDeleteUser = async () => {
    const userId = deleteModal.userId;
    setDeleteLoading((prev) => ({ ...prev, [userId]: true }));

    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

      // Use only cookie-based authentication
      const response = await axios.delete(`${BASE_URL}/api/v1/user/${userId}`, {
        withCredentials: true, // This sends cookies
      });

      // Rest of success handling...
      const resData = response.data;
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      setFilteredUsers((prev) => prev.filter((user) => user._id !== userId));
      setSelected({});
      setSelectAll(false);
      setDeleteModal({
        open: false,
        type: "single",
        userId: null,
        userName: "",
        selectedCount: 0,
      });
      toast.success(resData.message || "User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);

      // Handle authentication error
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");
        setSessionExpired(true);
      } else {
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Delete multiple users - open confirmation modal
  const handleBulkDelete = async () => {
    const selectedUserIds = Object.entries(selected)
      .filter(([_, isSelected]) => isSelected)
      .map(([index, _]) => {
        const userIndex = parseInt(index);
        if (userIndex < filteredUsers.length) {
          return filteredUsers[userIndex];
        }
        return null;
      })
      .filter(Boolean);

    if (selectedUserIds.length === 0) return;

    setDeleteModal({
      open: true,
      type: "bulk",
      userId: null,
      userName: "",
      selectedCount: selectedUserIds.length,
      selectedUsers: selectedUserIds,
    });
  };

  // Confirm bulk deletion
  const confirmBulkDelete = async () => {
    const selectedUserIds = deleteModal.selectedUsers.map((user) => user._id);
    setDeleteLoading((prev) => ({ ...prev, bulk: true }));

    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";
      const loggedInUserId = user?._id; // Get from context

      // Prevent deleting own account
      if (selectedUserIds.includes(loggedInUserId)) {
        toast.error("Cannot delete your own account.");
        setDeleteLoading((prev) => ({ ...prev, bulk: false }));
        return;
      }

      const response = await axios.delete(
        `${BASE_URL}/api/v1/user/bulk-delete`,
        {
          data: { userIds: selectedUserIds },
          withCredentials: true, // This sends cookies
        }
      );

      const resData = response.data;

      setUsers((prev) =>
        prev.filter((user) => !selectedUserIds.includes(user._id))
      );
      setFilteredUsers((prev) =>
        prev.filter((user) => !selectedUserIds.includes(user._id))
      );
      setSelected({});
      setSelectAll(false);
      setDeleteModal({
        open: false,
        type: "bulk",
        userId: null,
        userName: "",
        selectedCount: 0,
      });
      toast.success(
        resData.message || `${resData.deletedCount} users deleted successfully`
      );
    } catch (error) {
      console.error("Error bulk deleting users:", error);

      // Handle authentication error
      if (error.response?.status === 401) {
        setSessionExpired(true);
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to delete users. Please try again."
        );
      }
    } finally {
      setDeleteLoading((prev) => ({ ...prev, bulk: false }));
    }
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      type: "single",
      userId: null,
      userName: "",
      selectedCount: 0,
    });
  };

  // Handle user details view
  const handleViewDetails = (user) => {
    setDetailsModal({
      open: true,
      user,
    });
  };

  // Close details modal
  const closeDetailsModal = () => {
    setDetailsModal({
      open: false,
      user: null,
    });
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditModal({
      open: true,
      user: { ...user },
      loading: false,
    });
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditModal({
      open: false,
      user: null,
      loading: false,
    });
  };

  // Save edited user
  const saveEditedUser = async () => {
    if (!editModal.user) return;

    setEditModal((prev) => ({ ...prev, loading: true }));

    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

      console.log("Updating user:", editModal.user);

      const response = await axios.patch(
        `${BASE_URL}/api/v1/user/${editModal.user._id}`,
        {
          name: editModal.user.name,
          email: editModal.user.email,
          phone: editModal.user.phone,
          role: editModal.user.role,
          status: editModal.user.status,
          accountVerified: editModal.user.accountVerified,
        },
        {
          withCredentials: true, // This is crucial - it sends cookies
        }
      );

      console.log("Update response:", response.data);

      if (response.data.success) {
        // Update local state
        setUsers((prev) =>
          prev.map((user) =>
            user._id === editModal.user._id
              ? { ...user, ...editModal.user }
              : user
          )
        );

        closeEditModal();
        toast.success("User updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);

      // Log detailed error information
      if (error.response) {
        console.log("Response data:", error.response.data);
        console.log("Response status:", error.response.status);
      }

      // Handle authentication error
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please login again.");
        setSessionExpired(true);
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to update user. Please try again."
        );
      }
    } finally {
      setEditModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = (status) => {
    setBulkActionMenuAnchor(null);

    const selectedUserIds = Object.entries(selected)
      .filter(([_, isSelected]) => isSelected)
      .map(([index, _]) => {
        const userIndex = parseInt(index);
        if (userIndex < filteredUsers.length) {
          return filteredUsers[userIndex];
        }
        return null;
      })
      .filter(Boolean);

    if (selectedUserIds.length === 0) return;

    setStatusChangeModal({
      open: true,
      status,
      selectedUsers: selectedUserIds,
      loading: false,
    });
  };

  // Confirm bulk status change
  const confirmBulkStatusChange = async () => {
    const selectedUserIds = statusChangeModal.selectedUsers.map(
      (user) => user._id
    );
    setStatusChangeModal((prev) => ({ ...prev, loading: true }));

    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        setSessionExpired(true);
        return;
      }

      const response = await axios.patch(
        `${BASE_URL}/api/v1/user/bulk-status-update`,
        {
          userIds: selectedUserIds,
          status: statusChangeModal.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const resData = response.data;

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          selectedUserIds.includes(user._id)
            ? { ...user, status: statusChangeModal.status }
            : user
        )
      );

      setSelected({});
      setSelectAll(false);
      setStatusChangeModal({
        open: false,
        status: "",
        selectedUsers: [],
        loading: false,
      });

      toast.success(
        `${selectedUserIds.length} users updated to ${statusChangeModal.status}`
      );
    } catch (error) {
      console.error("Error updating users:", error);

      // Handle authentication error
      if (error.response?.status === 401) {
        setSessionExpired(true);
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to update users. Please try again."
        );
      }
    } finally {
      setStatusChangeModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Export users to CSV
  const exportUsers = () => {
    setExportLoading(true);

    try {
      // Decide which users to export
      const usersToExport =
        selectedCount > 0
          ? Object.entries(selected)
              .filter(([_, isSelected]) => isSelected)
              .map(([index, _]) => filteredUsers[parseInt(index)])
              .filter(Boolean)
          : filteredUsers;

      // Define fields to export
      const fields = [
        "name",
        "email",
        "phone",
        "role",
        "status",
        "accountVerified",
        "signUpWithGoogle",
        "createdAt",
        "last_login_date",
      ];

      // Create CSV header
      const header = [
        "Name",
        "Email",
        "Phone",
        "Role",
        "Status",
        "Verified",
        "Google Sign-up",
        "Created Date",
        "Last Login",
      ].join(",");

      // Create CSV rows
      const rows = usersToExport.map((user) => {
        return fields
          .map((field) => {
            let value = user[field];

            // Format dates
            if (field === "createdAt" || field === "last_login_date") {
              value = value ? formatDate(value) : "";
            }

            // Format booleans
            if (typeof value === "boolean") {
              value = value ? "Yes" : "No";
            }

            // Ensure string format and handle commas
            value = value !== undefined && value !== null ? `"${value}"` : '""';

            return value;
          })
          .join(",");
      });

      // Combine header and rows
      const csv = [header, ...rows].join("\n");

      // Create download link
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `users_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${usersToExport.length} users exported to CSV`);
    } catch (error) {
      console.error("Error exporting users:", error);
      toast.error("Failed to export users");
    } finally {
      setExportLoading(false);
    }
  };

  // Generate avatar based on name's first letter
  const generateAvatar = (name, avatar) => {
    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
    const colors = [
      "bg-purple-500",
      "bg-green-600",
      "bg-blue-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500",
    ];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

    if (avatar && avatar.trim() !== "") {
      return (
        <img
          src={avatar}
          alt={name}
          className="w-[40px] h-[40px] md:w-[65px] md:h-[65px] rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() =>
            setImageModal({ open: true, image: avatar, userName: name })
          }
          onError={(e) => {
            // On error, replace with letter avatar
            e.target.style.display = "none";
            e.target.parentNode.innerHTML = `
            <div
              class="w-[40px] h-[40px] md:w-[65px] md:h-[65px] rounded-md ${colors[colorIndex]} flex items-center justify-center text-white font-semibold text-sm md:text-lg"
            >
              ${firstLetter}
            </div>
          `;
          }}
        />
      );
    }

    // Show first letter when no avatar
    return (
      <div
        className={`w-[40px] h-[40px] md:w-[65px] md:h-[65px] rounded-md ${colors[colorIndex]} flex items-center justify-center text-white font-semibold text-sm md:text-lg`}
      >
        {firstLetter}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPhone = (phone) => {
    if (!phone) return "*********";
    if (phone.startsWith("+91") && phone.length === 13) {
      return `+91 ${phone.slice(3, 8)} ${phone.slice(8)}`;
    }
    return phone;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleBulkActionMenuOpen = (event) => {
    setBulkActionMenuAnchor(event.currentTarget);
  };

  const handleBulkActionMenuClose = () => {
    setBulkActionMenuAnchor(null);
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;

  // Prepare chart data
  const chartData = [
    { name: "Active", value: userStats.active, color: "#4CAF50" },
    { name: "Inactive", value: userStats.inactive, color: "#FFC107" },
    { name: "Suspended", value: userStats.suspended, color: "#F44336" },
  ];

  return (
    <div className="w-full pl-4 pr-2 py-8 min-w-0">
      <div className="bg-white rounded-md min-w-0 overflow-hidden shadow-md mb-6">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">User Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-blue-700">Total Users</p>
                  <h3 className="text-2xl font-bold text-blue-800">
                    {userStats.total}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-green-700">Verified Users</p>
                  <h3 className="text-2xl font-bold text-green-800">
                    {userStats.verified}
                  </h3>
                  <p className="text-xs text-green-600 mt-1">
                    {Math.round((userStats.verified / userStats.total) * 100)}%
                    of total
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <MdVerified className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-purple-700">Google Users</p>
                  <h3 className="text-2xl font-bold text-purple-800">
                    {userStats.googleUsers}
                  </h3>
                  <p className="text-xs text-purple-600 mt-1">
                    {Math.round(
                      (userStats.googleUsers / userStats.total) * 100
                    )}
                    % of total
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-red-700">Admin Users</p>
                  <h3 className="text-2xl font-bold text-red-800">
                    {userStats.adminUsers}
                  </h3>
                  <p className="text-xs text-red-600 mt-1">
                    {Math.round((userStats.adminUsers / userStats.total) * 100)}
                    % of total
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <FaUserCog className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold mb-4">
                User Status Distribution
              </h3>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis type="number" domain={[0, "dataMax"]} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <RechartsTooltip
                      formatter={(value, name, props) => [
                        `${value} users`,
                        props.payload.name,
                      ]}
                      labelFormatter={() => ""}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-base font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {users.slice(0, 5).map((user, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      {generateAvatar(user.name, user.avatar)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md min-w-0 overflow-hidden shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 min-w-0 items-center">
          <p className="text-lg sm:text-xl font-semibold text-gray-800">
            Users List ({filteredUsers.length})
          </p>

          <div className="w-full md:col-span-1 lg:col-span-2">
            <label htmlFor="userSearch" className="sr-only">
              Search
            </label>
            <div className="relative">
              <input
                id="userSearch"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 w-full bg-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <Tooltip title="Filters">
                  <IconButton size="small" onClick={handleFilterMenuOpen}>
                    <FiFilter className="text-gray-500" />
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={filterMenuAnchor}
                  open={Boolean(filterMenuAnchor)}
                  onClose={handleFilterMenuClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  PaperProps={{
                    style: {
                      width: "300px",
                      padding: "16px",
                    },
                  }}
                >
                  <div className="p-2">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Filter Users
                    </h3>

                    <div className="mb-4">
                      <FormControl size="small" fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={filters.role}
                          label="Role"
                          onChange={(e) =>
                            handleFilterChange("role", e.target.value)
                          }
                        >
                          <MenuItem value="all">All Roles</MenuItem>
                          <MenuItem value="user">User</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </div>

                    <div className="mb-4">
                      <FormControl size="small" fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={filters.status}
                          label="Status"
                          onChange={(e) =>
                            handleFilterChange("status", e.target.value)
                          }
                        >
                          <MenuItem value="all">All Statuses</MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                          <MenuItem value="suspended">Suspended</MenuItem>
                        </Select>
                      </FormControl>
                    </div>

                    <div className="mb-4">
                      <FormControl size="small" fullWidth>
                        <InputLabel>Verification</InputLabel>
                        <Select
                          value={filters.verified}
                          label="Verification"
                          onChange={(e) =>
                            handleFilterChange("verified", e.target.value)
                          }
                        >
                          <MenuItem value="all">All Users</MenuItem>
                          <MenuItem value="verified">Verified Only</MenuItem>
                          <MenuItem value="unverified">
                            Unverified Only
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </div>

                    <div className="mb-4">
                      <FormControl size="small" fullWidth>
                        <InputLabel>Signup Method</InputLabel>
                        <Select
                          value={filters.signupMethod}
                          label="Signup Method"
                          onChange={(e) =>
                            handleFilterChange("signupMethod", e.target.value)
                          }
                        >
                          <MenuItem value="all">All Methods</MenuItem>
                          <MenuItem value="email">Email Signup</MenuItem>
                          <MenuItem value="google">Google Signup</MenuItem>
                        </Select>
                      </FormControl>
                    </div>

                    <div className="flex justify-between mt-4">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setFilters({
                            role: "all",
                            status: "all",
                            verified: "all",
                            signupMethod: "all",
                          });
                        }}
                      >
                        Reset Filters
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleFilterMenuClose}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </Menu>
              </div>
            </div>

            {/* Active filters */}
            {(filters.role !== "all" ||
              filters.status !== "all" ||
              filters.verified !== "all" ||
              filters.signupMethod !== "all") && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.role !== "all" && (
                  <Chip
                    label={`Role: ${filters.role}`}
                    size="small"
                    onDelete={() => handleFilterChange("role", "all")}
                  />
                )}

                {filters.status !== "all" && (
                  <Chip
                    label={`Status: ${filters.status}`}
                    size="small"
                    onDelete={() => handleFilterChange("status", "all")}
                  />
                )}

                {filters.verified !== "all" && (
                  <Chip
                    label={`${
                      filters.verified === "verified"
                        ? "Verified"
                        : "Unverified"
                    }`}
                    size="small"
                    onDelete={() => handleFilterChange("verified", "all")}
                  />
                )}

                {filters.signupMethod !== "all" && (
                  <Chip
                    label={`${
                      filters.signupMethod === "google"
                        ? "Google Signup"
                        : "Email Signup"
                    }`}
                    size="small"
                    onDelete={() => handleFilterChange("signupMethod", "all")}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Tooltip title="Export Users">
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={exportUsers}
                disabled={exportLoading}
                startIcon={
                  exportLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <FiDownload />
                  )
                }
              >
                Export
              </Button>
            </Tooltip>

            {selectedCount > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleBulkActionMenuOpen}
                  disabled={bulkActionLoading}
                  startIcon={
                    bulkActionLoading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <FaUserCog />
                    )
                  }
                >
                  Actions ({selectedCount})
                </Button>

                <Menu
                  anchorEl={bulkActionMenuAnchor}
                  open={Boolean(bulkActionMenuAnchor)}
                  onClose={handleBulkActionMenuClose}
                >
                  <MenuItem onClick={() => handleBulkStatusChange("active")}>
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Set Active
                    </span>
                  </MenuItem>
                  <MenuItem onClick={() => handleBulkStatusChange("inactive")}>
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Set Inactive
                    </span>
                  </MenuItem>
                  <MenuItem onClick={() => handleBulkStatusChange("suspended")}>
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Set Suspended
                    </span>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleBulkDelete}>
                    <span className="flex items-center gap-2 text-red-600">
                      <MdDelete />
                      Delete Selected
                    </span>
                  </MenuItem>
                </Menu>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 min-w-0 w-full relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <CircularProgress size={40} />
            </div>
          )}

          <div className="w-full h-[400px] overflow-x-auto custom-scrollbar">
            <table
              className="min-w-[700px] w-full text-xs md:text-sm text-left rtl:text-right text-gray-500"
              style={{ width: "100%" }}
            >
              <thead className="text-xs md:text-sm text-gray-600 uppercase bg-[#f1f1f1] sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-2 py-0 md:px-6" width="10%">
                    <div className="w-[40px] md:w-[60px]">
                      <Checkbox
                        size="small"
                        checked={selectAll}
                        indeterminate={
                          selectedCount > 0 && selectedCount < pagedData.length
                        }
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-0 py-0 whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      User
                      {sortConfig.field === "name" && (
                        <FaSort className="ml-1 text-xs" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6 cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortConfig.field === "status" && (
                        <FaSort className="ml-1 text-xs" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6 cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Created
                      {sortConfig.field === "createdAt" && (
                        <FaSort className="ml-1 text-xs" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6 cursor-pointer"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      Role
                      {sortConfig.field === "role" && (
                        <FaSort className="ml-1 text-xs" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedData.map((user, idx) => {
                  const globalIdx = page * rowsPerPage + idx;
                  const isChecked = !!selected[globalIdx];
                  return (
                    <tr
                      key={user._id}
                      className={`border-b border-gray-200 ${
                        isChecked ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-2 py-2 md:px-6">
                        <div className="w-[40px] md:w-[60px]">
                          <Checkbox
                            size="small"
                            checked={isChecked}
                            onChange={handleSelect(globalIdx)}
                          />
                        </div>
                      </td>
                      <td className="px-0 py-2 min-w-[200px] md:min-w-[300px]">
                        <div className="flex items-center gap-2 md:gap-4 w-full">
                          <div className="w-[30px] h-[30px] md:w-[40px] md:h-[40px] rounded-md overflow-hidden">
                            {generateAvatar(user.name, user.avatar)}
                          </div>
                          <div className="w-auto">
                            <h3 className="font-[700] text-[11px] text-black hover:text-blue-500 transition flex items-center gap-1">
                              {user.name}
                              {user.accountVerified && (
                                <Tooltip title="Verified Account">
                                  <MdVerified
                                    className="text-blue-500"
                                    size={14}
                                  />
                                </Tooltip>
                              )}
                              {user.signUpWithGoogle && (
                                <Tooltip title="Google Account">
                                  <span className="w-3 h-3 flex items-center">
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="w-3 h-3 text-gray-600"
                                      fill="currentColor"
                                    >
                                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                                    </svg>
                                  </span>
                                </Tooltip>
                              )}
                            </h3>
                            <div className="text-[10px] md:text-[12px] text-gray-800">
                              <div className="flex items-center gap-2">
                                <RiMailCheckLine />
                                <span>{user.email || "*********"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 md:px-6 whitespace-nowrap">
                        <div className="text-[12px] md:text-[13px] font-[400] text-gray-800">
                          <div className="flex items-center gap-2">
                            <IoMdCall />
                            <span>{formatPhone(user.phone)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 md:px-6">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : user.status === "suspended"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.status || "inactive"}
                        </span>
                      </td>
                      <td className="px-2 py-2 md:px-6 whitespace-nowrap">
                        <div className="text-[12px] md:text-[13px] font-[400] text-gray-800">
                          <div className="flex items-center gap-2">
                            <SlCalender />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 md:px-6">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-2 py-2 md:px-6">
                        <div className="flex gap-2">
                          <Tooltip title="User Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(user)}
                              className="text-blue-600"
                            >
                              <MdInfo />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              onClick={() => handleEditUser(user)}
                              className="text-green-600"
                            >
                              <MdEdit />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600"
                              disabled={deleteLoading[user._id]}
                            >
                              {deleteLoading[user._id] ? (
                                <CircularProgress size={14} color="inherit" />
                              ) : (
                                <MdDelete />
                              )}
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pagedData.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="text-center py-16">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1"
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239"
                            ></path>
                          </svg>
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchQuery ||
                            Object.values(filters).some((f) => f !== "all")
                              ? "No users match your filters"
                              : "No users"}
                          </h3>
                          <p className="text-gray-500">
                            {searchQuery ||
                            Object.values(filters).some((f) => f !== "all")
                              ? "Try adjusting your search terms or filters."
                              : "There are no users in the system yet."}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              50,
              100,
              150,
              200,
              { label: "All", value: -1 },
            ]}
            labelRowsPerPage="Rows per page:"
            sx={{ mt: 1 }}
          />
        </div>
      </div>

      {/* Image Gallery Modal */}
      <Dialog
        open={imageModal.open}
        onClose={() => setImageModal({ open: false, image: "", userName: "" })}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
            maxWidth: "95vw",
            maxHeight: "95vh",
          },
        }}
      >
        <div className="relative bg-black rounded-lg overflow-hidden">
          <button
            onClick={() =>
              setImageModal({ open: false, image: "", userName: "" })
            }
            className="absolute top-4 right-4 z-50 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          >
            <FaTimes size={20} />
          </button>

          <div className="flex items-center justify-center h-[80vh] p-4">
            <div className="swiper-zoom-container flex flex-col items-center justify-center h-full">
              <img
                src={imageModal.image}
                alt={`${imageModal.userName}'s avatar`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
              <div className="mt-4 text-center">
                <p className="text-white text-lg font-medium">
                  {imageModal.userName}
                </p>
                <p className="text-gray-300 text-sm">User Avatar</p>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModal.open}
        onClose={closeDeleteModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <MdDelete className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {deleteModal.type === "single"
                  ? "Delete User"
                  : "Delete Multiple Users"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone
              </p>
            </div>
          </div>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <div className="space-y-4">
            {deleteModal.type === "single" ? (
              <div>
                <p className="text-gray-700 mb-3">
                  Are you sure you want to permanently delete this user?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {deleteModal.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {deleteModal.userName}
                      </p>
                      <p className="text-sm text-gray-500">User Account</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 mb-3">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold">
                    {deleteModal.selectedCount}
                  </span>{" "}
                  selected users?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {deleteModal.selectedCount}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {deleteModal.selectedCount} Users Selected
                      </p>
                      <p className="text-sm text-gray-500">
                        All selected accounts will be permanently removed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-800">Warning</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This action will permanently remove the user
                    {deleteModal.type === "bulk" ? "s" : ""} from the database
                    along with their profile data and avatar images. This cannot
                    be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={closeDeleteModal}
            variant="outlined"
            color="inherit"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={
              deleteModal.type === "single"
                ? confirmDeleteUser
                : confirmBulkDelete
            }
            variant="contained"
            color="error"
            disabled={deleteLoading[deleteModal.userId] || deleteLoading.bulk}
            startIcon={
              deleteLoading[deleteModal.userId] || deleteLoading.bulk ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <MdDelete />
              )
            }
          >
            {deleteLoading[deleteModal.userId] || deleteLoading.bulk
              ? "Deleting..."
              : `Delete ${
                  deleteModal.type === "bulk"
                    ? `${deleteModal.selectedCount} Users`
                    : "User"
                }`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Modal */}
      <Dialog
        open={detailsModal.open}
        onClose={closeDetailsModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: "12px",
          },
        }}
      >
        {detailsModal.user && (
          <>
            <DialogTitle>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">User Details</h2>
                <IconButton onClick={closeDetailsModal}>
                  <FaTimes />
                </IconButton>
              </div>
            </DialogTitle>
            <DialogContent dividers>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-lg overflow-hidden mb-4">
                      {generateAvatar(
                        detailsModal.user.name,
                        detailsModal.user.avatar
                      )}
                    </div>

                    <h3 className="text-lg font-bold">
                      {detailsModal.user.name}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {detailsModal.user.email}
                    </p>

                    <div className="flex gap-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          detailsModal.user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : detailsModal.user.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {detailsModal.user.status}
                      </span>

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          detailsModal.user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {detailsModal.user.role}
                      </span>
                    </div>

                    <div className="mt-4 w-full">
                      <button
                        onClick={() => {
                          closeDetailsModal();
                          handleEditUser(detailsModal.user);
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <FaUserEdit />
                        Edit User
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Tabs value={0}>
                    <Tab label="Profile Information" />
                  </Tabs>

                  <div className="mt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="text-base font-medium">
                            {formatPhone(detailsModal.user.phone) ||
                              "Not provided"}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">
                            Account Verified
                          </p>
                          <p className="text-base font-medium flex items-center">
                            {detailsModal.user.accountVerified ? (
                              <span className="flex items-center text-green-600">
                                <MdVerified className="mr-1" /> Yes
                              </span>
                            ) : (
                              <span className="text-red-600">No</span>
                            )}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">Signup Method</p>
                          <p className="text-base font-medium">
                            {detailsModal.user.signUpWithGoogle ? (
                              <span className="flex items-center">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="w-4 h-4 text-gray-600 mr-1"
                                  fill="currentColor"
                                >
                                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                                </svg>
                                Google Account
                              </span>
                            ) : (
                              "Email Registration"
                            )}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">Created On</p>
                          <p className="text-base font-medium">
                            {formatDate(detailsModal.user.createdAt)}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">Last Login</p>
                          <p className="text-base font-medium">
                            {detailsModal.user.last_login_date
                              ? `${formatDate(
                                  detailsModal.user.last_login_date
                                )} at ${formatTime(
                                  detailsModal.user.last_login_date
                                )}`
                              : "Never"}
                          </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-500">User ID</p>
                          <div className="flex items-center">
                            <p className="text-base font-medium truncate mr-2">
                              {detailsModal.user._id}
                            </p>
                            <Tooltip title="Copy ID">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    detailsModal.user._id
                                  );
                                  toast.success("ID copied to clipboard");
                                }}
                              >
                                <MdContentCopy
                                  className="text-gray-500"
                                  size={16}
                                />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-md mt-4">
                        <h3 className="font-medium mb-2">Activity Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-blue-50 rounded-md">
                            <p className="text-sm text-gray-500">Orders</p>
                            <p className="text-lg font-bold">
                              {detailsModal.user.order_history?.length || 0}
                            </p>
                          </div>

                          <div className="p-3 bg-green-50 rounded-md">
                            <p className="text-sm text-gray-500">Cart Items</p>
                            <p className="text-lg font-bold">
                              {detailsModal.user.shopping_cart?.length || 0}
                            </p>
                          </div>

                          <div className="p-3 bg-purple-50 rounded-md">
                            <p className="text-sm text-gray-500">Addresses</p>
                            <p className="text-lg font-bold">
                              {detailsModal.user.address_details?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDetailsModal}>Close</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  closeDetailsModal();
                  handleEditUser(detailsModal.user);
                }}
              >
                Edit User
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit User Modal */}
      <Dialog
        open={editModal.open}
        onClose={closeEditModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: "12px",
          },
        }}
      >
        {editModal.user && (
          <>
            <DialogTitle>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Edit User</h2>
                <IconButton onClick={closeEditModal}>
                  <FaTimes />
                </IconButton>
              </div>
            </DialogTitle>
            <DialogContent>
              <div className="space-y-4 py-4">
                <TextField
                  label="Full Name"
                  value={editModal.user.name || ""}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      user: { ...prev.user, name: e.target.value },
                    }))
                  }
                  fullWidth
                  margin="dense"
                />

                <TextField
                  label="Email Address"
                  value={editModal.user.email || ""}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      user: { ...prev.user, email: e.target.value },
                    }))
                  }
                  fullWidth
                  margin="dense"
                  type="email"
                />

                <TextField
                  label="Phone Number"
                  value={editModal.user.phone || ""}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      user: { ...prev.user, phone: e.target.value },
                    }))
                  }
                  fullWidth
                  margin="dense"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={editModal.user.role || "user"}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          user: { ...prev.user, role: e.target.value },
                        }))
                      }
                      label="Role"
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="dense">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editModal.user.status || "inactive"}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          user: { ...prev.user, status: e.target.value },
                        }))
                      }
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="suspended">Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <FormControlLabel
                  control={
                    <Switch
                      checked={editModal.user.accountVerified || false}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          user: {
                            ...prev.user,
                            accountVerified: e.target.checked,
                          },
                        }))
                      }
                      color="primary"
                    />
                  }
                  label="Account Verified"
                />

                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Important:</span> Changes to
                    user information will take effect immediately.
                  </p>
                  <p className="text-sm text-gray-500">
                    User ID:{" "}
                    <span className="font-mono">{editModal.user._id}</span>
                  </p>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeEditModal}>Cancel</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={saveEditedUser}
                disabled={editModal.loading}
                startIcon={
                  editModal.loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
              >
                {editModal.loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Bulk Status Change Modal */}
      <Dialog
        open={statusChangeModal.open}
        onClose={() =>
          setStatusChangeModal((prev) => ({ ...prev, open: false }))
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                backgroundColor:
                  statusChangeModal.status === "active"
                    ? "#e6f7e6"
                    : statusChangeModal.status === "inactive"
                    ? "#fff8e6"
                    : "#fbe6e6",
                color:
                  statusChangeModal.status === "active"
                    ? "#2e7d32"
                    : statusChangeModal.status === "inactive"
                    ? "#ed6c02"
                    : "#d32f2f",
              }}
            >
              <FaUserCog size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Change User Status
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Set {statusChangeModal.selectedUsers?.length} users to{" "}
                {statusChangeModal.status}
              </p>
            </div>
          </div>
        </DialogTitle>

        <DialogContent>
          <div className="my-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to change the status of{" "}
              {statusChangeModal.selectedUsers?.length} selected users to "
              {statusChangeModal.status}"?
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor:
                      statusChangeModal.status === "active"
                        ? "#4caf50"
                        : statusChangeModal.status === "inactive"
                        ? "#ff9800"
                        : "#f44336",
                    color: "white",
                  }}
                >
                  {statusChangeModal.selectedUsers?.length}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {statusChangeModal.selectedUsers?.length} Users Selected
                  </p>
                  <p className="text-sm text-gray-500">
                    All selected accounts will be set to "
                    {statusChangeModal.status}"
                  </p>
                </div>
              </div>
            </div>

            {statusChangeModal.status === "suspended" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-red-800">
                      Warning
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      Suspended users will not be able to log in or use any
                      features of the platform.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() =>
              setStatusChangeModal((prev) => ({ ...prev, open: false }))
            }
            variant="outlined"
            color="inherit"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmBulkStatusChange}
            variant="contained"
            color={
              statusChangeModal.status === "active"
                ? "success"
                : statusChangeModal.status === "inactive"
                ? "warning"
                : "error"
            }
            disabled={statusChangeModal.loading}
            startIcon={
              statusChangeModal.loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <FaUserCog />
              )
            }
          >
            {statusChangeModal.loading
              ? "Processing..."
              : `Set to ${statusChangeModal.status}`}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Users;
