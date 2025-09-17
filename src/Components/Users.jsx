import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Checkbox from "@mui/material/Checkbox";
import TablePagination from "@mui/material/TablePagination";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { RiMailCheckLine } from "react-icons/ri";
import { IoMdCall } from "react-icons/io";
import { SlCalender } from "react-icons/sl";
import { MdDelete } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";
import toast from "react-hot-toast";

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

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

      const response = await fetch(`${BASE_URL}/api/v1/user/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        console.error(
          "Failed to fetch users:",
          response.status,
          response.statusText
        );
        setUsers([]);
        setFilteredUsers([]);
        return;
      }

      const data = await response.json();

      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => {
        const name = user.name || "";
        const email = user.email || "";
        const phone = user.phone || "";

        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          phone.includes(searchQuery)
        );
      });

      setFilteredUsers(filtered);
    }
    setPage(0); // Reset to first page on search
  }, [searchQuery, users]);

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

  // Delete single user - open confirmation modal
  const handleDeleteUser = async (user) => {
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

      const response = await fetch(`${BASE_URL}/api/v1/user/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
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
      } else {
        console.error("Failed to delete user");
        toast.error("Failed to delete user. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user. Please try again.");
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

      const response = await fetch(`${BASE_URL}/api/v1/user/bulk-delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userIds: selectedUserIds }),
      });

      if (response.ok) {
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
      } else {
        console.error("Failed to bulk delete users");
        toast.error("Failed to delete selected users. Please try again.");
      }
    } catch (error) {
      console.error("Error bulk deleting users:", error);
      toast.error("Error deleting users. Please try again.");
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
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const formatPhone = (phone) => {
    if (!phone) return "*********";
    if (phone.startsWith("+91") && phone.length === 13) {
      return `+91 ${phone.slice(3, 8)} ${phone.slice(8)}`;
    }
    return phone;
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <div className="w-full pl-4 pr-2 py-8 min-w-0">
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
            </div>
          </div>

          {selectedCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleBulkDelete}
                disabled={deleteLoading.bulk}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {deleteLoading.bulk ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <MdDelete />
                )}
                Delete ({selectedCount})
              </button>
            </div>
          )}
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
                  <th scope="col" className="px-0 py-0 whitespace-nowrap">
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    Created
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
                            <h3 className="font-[700] text-[11px] text-black hover:text-blue-500 transition">
                              {user.name}
                            </h3>
                            <p className="text-[10px] md:text-[12px] text-gray-800">
                              <div className="flex items-center gap-2">
                                <RiMailCheckLine />
                                <span>{user.email || "*********"}</span>
                              </div>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 md:px-6">
                        <p className="text-[12px] md:text-[13px] font-[400] text-gray-800">
                          <div className="flex items-center gap-2">
                            <IoMdCall />
                            <span>{formatPhone(user.phone)}</span>
                          </div>
                        </p>
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
                      <td className="px-2 py-2 md:px-6">
                        <p className="text-[12px] md:text-[13px] font-[400] text-gray-800">
                          <div className="flex items-center gap-2">
                            <SlCalender />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </p>
                      </td>
                      <td className="px-2 py-2 md:px-6">
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={deleteLoading[user._id]}
                          className="px-2 py-1 text-red-600 border border-red-200 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 min-w-[80px] justify-center"
                        >
                          {deleteLoading[user._id] ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            "DELETE"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {pagedData.length === 0 && !loading && (
                  <tr>
                    <td colSpan="6" className="text-center py-16">
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
                            {searchQuery ? "No users found" : "No users"}
                          </h3>
                          <p className="text-gray-500">
                            {searchQuery
                              ? "No users match your search criteria. Try adjusting your search terms."
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
    </div>
  );
};

export default Users;
