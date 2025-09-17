import React, { useState, useEffect, useRef } from "react";
import { IoCloudUpload, IoImageOutline } from "react-icons/io5";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const ManageLogo = () => {
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logos, setLogos] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    upload: false,
    delete: {},
    fetching: false,
  });
  const [viewModal, setViewModal] = useState({
    open: false,
    image: "",
    name: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    logo: null
  });
  const fileInputRef = useRef(null);

  // Function to notify sidebar about logo changes
  const notifySidebarUpdate = () => {
    window.dispatchEvent(new CustomEvent("logoUpdated"));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // Fetch existing logos on component mount
  useEffect(() => {
    fetchLogos();
  }, []);

  // Fetch logos from backend
  const fetchLogos = async () => {
    setLoading((prev) => ({ ...prev, fetching: true }));
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/logo/all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLogos(data.logos || []);
      } else {
        toast.error("Failed to fetch logos");
      }
    } catch (error) {
      console.error("Error fetching logos:", error);
      toast.error("Error loading logos");
    } finally {
      setLoading((prev) => ({ ...prev, fetching: false }));
    }
  };

  // Handle upload/update logo
  const handleUpload = async () => {
    if (!logoFile) {
      toast.error("Please select a logo image before uploading.");
      return;
    }

    setLoading((prev) => ({ ...prev, upload: true }));

    try {
      // First, upload the image to get the URL
      const formData = new FormData();
      formData.append("images", logoFile);

      const uploadResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/logo/upload-images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadData = await uploadResponse.json();
      const logoUrl = uploadData.images[0];

      if (editIndex !== null) {
        // Update existing logo - backend will automatically delete old image
        const logoToUpdate = logos[editIndex];

        const updateResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/logo/${logoToUpdate._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              url: logoUrl,
              name: logoFile.name || logoToUpdate.name,
            }),
          }
        );

        if (updateResponse.ok) {
          toast.success("Logo updated successfully!");
          setEditIndex(null);
          notifySidebarUpdate();
        } else {
          throw new Error("Failed to update logo");
        }
      } else {
        // Add new logo to database
        const createResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/logo`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              url: logoUrl,
              name: logoFile.name || "Untitled Logo",
            }),
          }
        );

        if (createResponse.ok) {
          toast.success("Logo uploaded successfully!");
          notifySidebarUpdate();
        } else {
          throw new Error("Failed to save logo");
        }
      }

      // Refresh logos list
      await fetchLogos();

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Error uploading logo");
    } finally {
      setLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  // Handle delete logo confirmation
  const handleDeleteClick = (logo) => {
    setDeleteConfirm({ open: true, logo });
  };

  // Handle delete logo
  const handleDelete = async () => {
    const { logo } = deleteConfirm;
    if (!logo) return;

    setLoading((prev) => ({
      ...prev,
      delete: { ...prev.delete, [logo._id]: true },
    }));

    try {
      // Delete from database (backend will also delete from Cloudinary automatically)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/logo/${logo._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        // Remove from local state
        setLogos((prev) => prev.filter((l) => l._id !== logo._id));
        toast.success("Logo deleted successfully!");
        notifySidebarUpdate();
      } else {
        throw new Error("Failed to delete logo");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Error deleting logo");
    } finally {
      setLoading((prev) => ({
        ...prev,
        delete: { ...prev.delete, [logo._id]: false },
      }));
      setDeleteConfirm({ open: false, logo: null });
    }
  };

  // Handle edit logo
  const handleEdit = (index) => {
    const logo = logos[index];
    setEditIndex(index);
    setLogoPreview(logo.url);
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLogoFile(null); // User needs to select new file
    toast.info("Please select the new image file to replace the current logo");
  };

  // Reset form
  const resetForm = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setEditIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // View logo in modal
  const viewLogo = (logo) => {
    setViewModal({ open: true, image: logo.url, name: logo.name });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <IoImageOutline className="text-3xl" />
            Logo Management
          </h2>
          <p className="text-blue-100 mt-1">Upload and manage your logos</p>
        </div>

        {/* Upload Section */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="max-w-2xl mx-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              id="logo-upload"
              className="hidden"
            />

            {/* Upload Area */}
            <div className="relative">
              <label
                htmlFor="logo-upload"
                className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <FaPlus className="text-2xl text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700 group-hover:text-blue-600">
                      {editIndex !== null
                        ? "Select New Logo"
                        : "Click to Upload Logo"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              </label>

              {/* Loading overlay for upload area */}
              {loading.upload && (
                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600">Uploading...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {logoPreview && (
              <div className="mt-6 text-center">
                <div className="inline-block bg-white rounded-lg shadow-md p-4">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="max-w-xs max-h-32 object-contain mx-auto"
                  />
                  <p className="text-sm text-gray-500 mt-2">Preview</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={handleUpload}
                disabled={!logoFile || loading.upload}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                {loading.upload ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <IoCloudUpload className="text-lg" />
                )}
                {editIndex !== null ? "Update Logo" : "Upload Logo"}
              </button>

              {(logoPreview || editIndex !== null) && (
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <MdClose />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Logos List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Stored Logos
            </h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {logos.length} {logos.length === 1 ? "Logo" : "Logos"}
            </span>
          </div>

          {/* Loading state for fetching */}
          {loading.fetching ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Loading logos...</p>
              </div>
            </div>
          ) : logos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoImageOutline className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Logos Yet
              </h3>
              <p className="text-gray-500">
                Upload your first logo to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logos.map((logo, index) => (
                <div
                  key={logo._id}
                  className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Image Container */}
                  <div className="relative h-48 bg-gray-50 flex items-center justify-center p-4">
                    <img
                      src={logo.url}
                      alt={logo.name || `Logo ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />

                    {/* Loading overlay for individual logo */}
                    {loading.delete[logo._id] && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-xs text-gray-600">Deleting...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logo Info */}
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 truncate mb-2">
                      {logo.name || `Logo ${index + 1}`}
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Uploaded:{" "}
                      {new Date(
                        logo.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex justify-between gap-2">
                      <button
                        onClick={() => viewLogo(logo)}
                        className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <FaEye />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(index)}
                        className="flex-1 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-md transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <FaEdit />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(logo)}
                        disabled={loading.delete[logo._id]}
                        className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                      >
                        {loading.delete[logo._id] ? (
                          <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FaTrash />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto relative">
            <button
              onClick={() => setViewModal({ open: false, image: "", name: "" })}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <MdClose size={20} />
            </button>
            <div className="p-8 text-center">
              <img
                src={viewModal.image}
                alt={viewModal.name}
                className="max-w-full max-h-[70vh] object-contain mx-auto"
              />
              <p className="text-gray-800 mt-4 text-lg font-medium">
                {viewModal.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MUI Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, logo: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteConfirm.logo?.name || 'this logo'}"? 
            This action cannot be undone and the logo will be permanently removed from both the database and cloud storage.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirm({ open: false, logo: null })}
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading.delete[deleteConfirm.logo?._id]}
          >
            {loading.delete[deleteConfirm.logo?._id] ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageLogo;