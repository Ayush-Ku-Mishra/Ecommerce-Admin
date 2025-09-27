import React, { useState, useEffect } from "react";
import { IoClose, IoCloudUpload, IoAdd, IoTrash, IoEye } from "react-icons/io5";
import { FaRegImages, FaEdit } from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";
import toast from "react-hot-toast";
import axios from "axios";

const AddHomeSliderModal = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [publishedSliders, setPublishedSliders] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sliderToDelete, setSliderToDelete] = useState(null);
  const [deletingSliders, setDeletingSliders] = useState(new Set());
  const [editingSlider, setEditingSlider] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewImageModal, setViewImageModal] = useState(null);
  const [draggedOver, setDraggedOver] = useState(false);
  const [newEditImage, setNewEditImage] = useState(null);

  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  // Fetch sliders from database
  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/slider/all`);
      const data = await response.json();
      if (data.success) {
        setPublishedSliders(data.sliders);
      }
    } catch (error) {
      console.error("Error fetching sliders:", error);
    }
  };

  // Upload images to Cloudinary
  const uploadToCloudinary = async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file.file || file);
      });

      const response = await axios.post(
        `${API_BASE}/api/v1/slider/create`,
        formDataOrData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        return response.data.images;
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

  // Remove image from Cloudinary via backend
  const removeFromCloudinary = async (imageUrl) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/v1/slider/remove-image`,
        {
          params: { img: imageUrl },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) return true;
      else throw new Error("Failed to remove image");
    } catch (error) {
      console.error("Cloudinary remove error:", error);
      return false;
    }
  };

  // Create slider in database
  const createSliderInDB = async (sliderData) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/slider/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(sliderData),
      });

      const data = await response.json();
      if (data.success) {
        return data.slider;
      }
      throw new Error(data.message || "Create failed");
    } catch (error) {
      console.error("Create slider error:", error);
      throw error;
    }
  };

  // Update slider
  const updateSliderInDB = async (sliderId, updateData) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/slider/${sliderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (data.success) {
        return data.slider;
      }
      throw new Error(data.message || "Update failed");
    } catch (error) {
      console.error("Update slider error:", error);
      throw error;
    }
  };

  // Delete slider from database
  const deleteSliderFromDB = async (sliderId) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/slider/${sliderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Delete slider error:", error);
      return false;
    }
  };

  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const validFiles = Array.from(files).filter((file) => {
      if (!validTypes.includes(file.type)) {
        alert(`Invalid file type: ${file.name}. Please upload images only.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File too large: ${file.name}. Please upload files under 5MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newImages = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      isUploaded: false,
    }));

    setPreviewImages((prev) => [...prev, ...newImages]);
    event.target.value = "";
  };

  const handleEditImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please upload images only.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Please upload files under 5MB.");
      return;
    }

    setNewEditImage({
      file,
      url: URL.createObjectURL(file),
    });

    event.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDraggedOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDraggedOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      const event = { target: { files: imageFiles } };
      handleImageUpload(event);
    }
  };

  const handleRemovePreviewImage = async (id) => {
    const imageToRemove = previewImages.find((img) => img.id === id);

    if (imageToRemove) {
      if (imageToRemove.url && imageToRemove.url.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.url);
      }
    }

    setPreviewImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handlePublish = async () => {
    if (previewImages.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setLoading(true);
    try {
      // Upload images to Cloudinary
      const cloudinaryUrls = await uploadToCloudinary(previewImages);

      // Create sliders in database
      const createdSliders = [];
      for (let i = 0; i < cloudinaryUrls.length; i++) {
        const sliderData = {
          type: "simple",
          imageUrl: cloudinaryUrls[i],
          order: publishedSliders.length + i + 1,
        };

        const created = await createSliderInDB(sliderData);
        createdSliders.push(created);
      }

      // Update state
      setPublishedSliders((prev) => [...prev, ...createdSliders]);

      // Clean up
      previewImages.forEach((img) => {
        if (img.url && img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
      setPreviewImages([]);
      setShowAddModal(false);

      alert(`${createdSliders.length} slider(s) published successfully!`);
    } catch (error) {
      console.error("Publish error:", error);
      alert("Failed to publish sliders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (slider) => {
    setSliderToDelete(slider);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sliderToDelete) return;

    setDeletingSliders((prev) => new Set([...prev, sliderToDelete._id]));
    setDeleteConfirmOpen(false);

    try {
      // Delete from database (backend will handle Cloudinary deletion)
      const success = await deleteSliderFromDB(sliderToDelete._id);

      if (success) {
        // Update state
        setPublishedSliders((prev) =>
          prev.filter((s) => s._id !== sliderToDelete._id)
        );
        alert("Slider deleted successfully!");
      } else {
        alert("Failed to delete slider. Please try again.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete slider. Please try again.");
    } finally {
      setDeletingSliders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sliderToDelete._id);
        return newSet;
      });
      setSliderToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSliderToDelete(null);
  };

  const handleEditClick = (slider) => {
    setEditingSlider(slider);
    setNewEditImage(null);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editingSlider) return;

    setLoading(true);
    try {
      let newImageUrl = editingSlider.imageUrl;

      // If new image is selected, upload it and delete old one
      if (newEditImage) {
        // Upload new image
        const uploadedUrls = await uploadToCloudinary([newEditImage.file]);
        newImageUrl = uploadedUrls[0];

        // Delete old image from Cloudinary
        await removeFromCloudinary(editingSlider.imageUrl);
      }

      // Update slider with new image URL
      const updatedSlider = await updateSliderInDB(editingSlider._id, {
        imageUrl: newImageUrl,
        type: editingSlider.type,
        order: editingSlider.order,
      });

      setPublishedSliders((prev) =>
        prev.map((s) => (s._id === updatedSlider._id ? updatedSlider : s))
      );

      // Clean up
      if (newEditImage && newEditImage.url.startsWith("blob:")) {
        URL.revokeObjectURL(newEditImage.url);
      }

      setShowEditModal(false);
      setEditingSlider(null);
      setNewEditImage(null);
      alert("Slider updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update slider. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    previewImages.forEach((image) => {
      if (image.url && image.url.startsWith("blob:")) {
        URL.revokeObjectURL(image.url);
      }
    });
    setPreviewImages([]);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Home Slider Manager
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage your homepage banner slides
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 text-sm sm:text-base"
        >
          <IoAdd className="w-4 h-4 sm:w-5 sm:h-5" />
          Add Home Slider
        </button>
      </div>
      {/* Published Sliders - Wide Format */}
      <div className="space-y-4 sm:space-y-6 mb-8">
        {publishedSliders.map((slider, index) => (
          <div
            key={slider._id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="flex flex-col">
              {/* Image Section */}
              <div className="relative group">
                <img
                  src={slider.imageUrl}
                  alt={`Slider ${index + 1}`}
                  className="w-full h-48 sm:h-64 lg:h-44 object-cover cursor-pointer"
                  onClick={() => setViewImageModal(slider.imageUrl)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex gap-2 sm:gap-3">
                    <button
                      onClick={() => setViewImageModal(slider.imageUrl)}
                      className="bg-blue-600 text-white p-2 sm:p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                      title="View full size"
                    >
                      <IoEye className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={() => handleEditClick(slider)}
                      className="bg-green-600 text-white p-2 sm:p-3 rounded-full hover:bg-green-700 transition-colors shadow-lg"
                      title="Edit slider"
                    >
                      <FaEdit className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(slider)}
                      disabled={deletingSliders.has(slider._id)}
                      className="bg-red-600 text-white p-2 sm:p-3 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg"
                      title="Delete slider"
                    >
                      {deletingSliders.has(slider._id) ? (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <IoTrash className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                      Slide #{slider.order || index + 1}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {publishedSliders.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <FaRegImages className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-600 mb-2">
            No sliders found
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            Click "Add Home Slider" to create your first slider
          </p>
        </div>
      )}
      {/* Add Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Add Home Slider
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IoClose className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6">
                {/* Instructions */}
                <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-medium text-blue-900 mb-2">
                    Upload Instructions
                  </h3>
                  <ul className="text-blue-700 text-xs sm:text-sm space-y-1">
                    <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                    <li>• Maximum file size: 5MB per image</li>
                    <li>• Recommended dimensions: 1920x600px for desktop</li>
                    <li>
                      • Images will be uploaded to Cloudinary when published
                    </li>
                  </ul>
                </div>

                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 sm:p-8 mb-4 sm:mb-6 transition-colors ${
                    draggedOver
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      multiple
                      className="hidden"
                      id="imageUpload"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="cursor-pointer inline-flex flex-col items-center"
                    >
                      <IoCloudUpload className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-3 sm:mb-4" />
                      <span className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        You can select multiple images at once
                      </span>
                    </label>
                  </div>
                </div>

                {/* Preview Images */}
                {previewImages.length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                      Preview Images ({previewImages.length})
                    </h4>
                    <div className="space-y-3 sm:space-y-4">
                      {previewImages.map((image, index) => (
                        <div
                          key={image.id}
                          className="relative group bg-gray-50 rounded-lg p-2"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <img
                              src={image.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full sm:w-48 h-24 sm:h-32 object-cover rounded-lg border shadow-md"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-700 text-sm sm:text-base">
                                Image {index + 1}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500 truncate">
                                {image.file.name}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                Size:{" "}
                                {(image.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemovePreviewImage(image.id)}
                              className="bg-red-600 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg flex-shrink-0"
                              title="Remove image"
                            >
                              <IoClose className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Publish Button */}
                <div className="flex justify-end gap-3 sm:gap-4 sticky bottom-0 bg-white py-4 border-t">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={previewImages.length === 0 || loading}
                    className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition-all flex items-center gap-2 text-sm sm:text-base ${
                      previewImages.length === 0 || loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105"
                    } text-white`}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={16} color="inherit" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <IoCloudUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                        Publish {previewImages.length} Slide
                        {previewImages.length > 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Edit Modal */}
      {showEditModal && editingSlider && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setShowEditModal(false);
              setEditingSlider(null);
              setNewEditImage(null);
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Edit Slider Image
                </h2>

                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSlider(null);
                    setNewEditImage(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IoClose className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />   
                </button>
              </div>

              <div className="p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3">
                    Current Image
                  </h3>

                  <img
                    src={editingSlider.imageUrl}
                    alt="Current slider"
                    className="w-full h-48 sm:h-64 object-cover rounded-lg border shadow-md"
                  />
                </div>

                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3">
                    Upload New Image
                  </h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 hover:border-blue-400 transition-colors">
                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="hidden"
                        id="editImageUpload"
                      />

                      <label
                        htmlFor="editImageUpload"
                        className="cursor-pointer inline-flex flex-col items-center"
                      >
                        <IoCloudUpload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" />

                        <span className="text-sm sm:text-base font-medium text-gray-700">
                          Click to select new image
                        </span>

                        <span className="text-xs sm:text-sm text-gray-500 mt-1">
                          JPG, PNG, GIF, WebP (Max 5MB)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {newEditImage && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3">
                      New Image Preview
                    </h3>

                    <div className="relative">
                      <img
                        src={newEditImage.url}
                        alt="New slider preview"
                        className="w-full h-48 sm:h-64 object-cover rounded-lg border shadow-md"
                      />

                      <button
                        onClick={() => {
                          if (newEditImage.url.startsWith("blob:")) {
                            URL.revokeObjectURL(newEditImage.url);
                          }
                          setNewEditImage(null);
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                      >
                        <IoClose className="w-5 h-5" /> 
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingSlider(null);
                      setNewEditImage(null);
                    }}
                    className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleEditSave}
                    disabled={!newEditImage || loading}
                    className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition-all flex items-center gap-2 text-sm sm:text-base ${
                      !newEditImage || loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
                    } text-white`}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={16} color="inherit" />
                        Updating...
                      </>
                    ) : (
                      "Update Image"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && sliderToDelete && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleDeleteCancel}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 mb-3 sm:mb-4">
                  <IoTrash className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />   
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Delete Slider
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                  Are you sure you want to delete this slider? This action
                  cannot be undone and will remove the image from Cloudinary.
                </p>
                <div className="flex justify-center gap-3 sm:gap-4">
                  <button
                    onClick={handleDeleteCancel}
                    className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* View Image Modal */}
      {viewImageModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50"
            onClick={() => setViewImageModal(null)}
          >
            <button
              onClick={() => setViewImageModal(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white text-black p-1.5 sm:p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <IoClose className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center justify-center h-full p-4">
              <img
                src={viewImageModal}
                alt="Full size view"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddHomeSliderModal;
