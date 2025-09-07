import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose, IoCloudUpload } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";

const AddCategory = ({ categoryToEdit, onCategoryAdded, onClose }) => {
  const inputRef = useRef();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [originalImages, setOriginalImages] = useState([]); // Track original images for comparison

  // Prefill form on edit mode
  useEffect(() => {
    if (categoryToEdit) {
      inputRef.current.value = categoryToEdit.name || "";
      if (categoryToEdit.images && categoryToEdit.images.length) {
        const existingImages = categoryToEdit.images.map((url, idx) => ({
          id: `existing_${idx}`,
          file: null,
          url,
          uploaded: true,
          isExisting: true, // Mark as existing image
        }));
        setImages(existingImages);
        setOriginalImages(existingImages); // Store original state for comparison
      }
    } else {
      inputRef.current.value = "";
      setImages([]);
      setOriginalImages([]);
    }
  }, [categoryToEdit]);

  // Close modal handler
  const handleClose = () => {
    // Clean up any local preview URLs that aren't uploaded
    images.forEach((img) => {
      if (!img.uploaded && !img.isExisting && img.url) {
        URL.revokeObjectURL(img.url);
      }
    });
    
    if (onClose) onClose();
    else navigate(-1);
  };

  // Backdrop click handler
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle image upload for multiple images with preview (LOCAL ONLY)
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsRemoving(false);
    setBackdropOpen(true); // Show loading backdrop

    try {
      // Create local preview objects, don't send to backend yet
      const newImages = Array.from(files).map((file, index) => ({
        id: Date.now() + Math.random() + index,
        file,
        url: URL.createObjectURL(file), // local preview URL
        uploaded: false, // not yet uploaded
        isNew: true, // Mark as new image
      }));

      setImages((prev) => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) added for preview.`);
    } catch (error) {
      console.error("Local upload error:", error);
      toast.error("Image preview failed. Please try again.");
    } finally {
      setBackdropOpen(false);
      e.target.value = ""; // Reset file input
    }
  };

  // Remove image (LOCAL ONLY)
  const handleRemoveImage = async (id) => {
    const imgToRemove = images.find((img) => img.id === id);
    if (!imgToRemove) return;

    setIsRemoving(true);
    setBackdropOpen(true);

    // Remove local preview
    setImages((prev) => {
      // Clean up URL if it's a local preview
      if (!imgToRemove.uploaded && !imgToRemove.isExisting && imgToRemove.url) {
        URL.revokeObjectURL(imgToRemove.url);
      }
      return prev.filter((img) => img.id !== id);
    });

    setBackdropOpen(false);
    setIsRemoving(false);
  };

  // Check if images have changed
  const hasImagesChanged = () => {
    if (!categoryToEdit) return true; // New category, always changed

    // Compare current images with original images
    const currentUrls = images
      .filter(img => img.isExisting)
      .map(img => img.url)
      .sort();
    
    const originalUrls = originalImages
      .map(img => img.url)
      .sort();

    // Check if existing images changed or new images added
    const existingImagesChanged = JSON.stringify(currentUrls) !== JSON.stringify(originalUrls);
    const hasNewImages = images.some(img => img.isNew && !img.uploaded);

    return existingImagesChanged || hasNewImages;
  };

  // Publish button click handler - Upload to cloud & save category
  const handlePublish = async () => {
    const categoryName = inputRef.current?.value.trim();

    if (!categoryName) {
      toast.error("Please enter a category name.");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least one category image.");
      return;
    }

    // Check if we're in edit mode and nothing has changed
    if (categoryToEdit && !hasImagesChanged() && categoryName === categoryToEdit.name) {
      toast.info("No changes detected.");
      handleClose();
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrls = [];

      // If images have changed, handle uploads
      if (hasImagesChanged()) {
        // Step 1: Upload new images to Cloudinary
        const newImagesToUpload = images.filter(img => img.isNew && !img.uploaded);
        let uploadedUrls = [];

        if (newImagesToUpload.length > 0) {
          const formData = new FormData();
          newImagesToUpload.forEach((img) => {
            if (img.file) {
              formData.append("images", img.file);
            }
          });

          const uploadResponse = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/category/upload-images`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
            }
          );

          if (uploadResponse.data.success) {
            uploadedUrls = uploadResponse.data.images;
          } else {
            toast.error(uploadResponse.data.message || "Image upload failed.");
            setIsUploading(false);
            return;
          }
        }

        // Step 2: Combine existing images with newly uploaded ones
        const existingImageUrls = images
          .filter(img => img.isExisting)
          .map(img => img.url);

        finalImageUrls = [...existingImageUrls, ...uploadedUrls];

        // Step 3: If editing, delete removed images from Cloudinary
        if (categoryToEdit && categoryToEdit.images) {
          const removedImages = categoryToEdit.images.filter(
            originalUrl => !existingImageUrls.includes(originalUrl)
          );

          if (removedImages.length > 0) {
            try {
              await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/category/delete-images`,
                { imageUrls: removedImages },
                {
                  headers: { "Content-Type": "application/json" },
                  withCredentials: true,
                }
              );
            } catch (error) {
              console.warn("Failed to delete some images from Cloudinary:", error);
              // Don't fail the whole operation for this
            }
          }
        }
      } else {
        // No image changes, use existing images
        finalImageUrls = images.map(img => img.url);
      }

      // Step 4: Create/Update category with final image URLs
      const categoryData = {
        name: categoryName,
        images: finalImageUrls,
        mainImage: finalImageUrls[0],
      };

      let response;
      if (categoryToEdit && categoryToEdit._id) {
        response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/category/${categoryToEdit._id}`,
          categoryData,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/category/createCategory`,
          categoryData,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
      }

      if (response.data.success) {
        toast.success(
          categoryToEdit
            ? "Category updated successfully!"
            : "Category published successfully!"
        );

        // Clean up local preview URLs
        images.forEach((img) => {
          if (!img.uploaded && !img.isExisting && img.url) {
            URL.revokeObjectURL(img.url);
          }
        });

        // Reset form for new category
        if (!categoryToEdit) {
          inputRef.current.value = "";
          setImages([]);
        }

        if (onCategoryAdded) {
          onCategoryAdded(response.data.category);
        }

        handleClose();
      } else {
        toast.error(response.data.message || "Operation failed.");
      }
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Operation failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-start justify-center"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white w-full max-w-4xl mx-auto mt-8 mb-8 max-h-[90vh] overflow-y-auto flex flex-col shadow-xl relative rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900">
            {categoryToEdit ? "Edit Category" : "Add New Category"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-200 transition"
            aria-label="Close"
          >
            <IoClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-6 flex flex-col gap-6">
          {/* Category Name */}
          <div>
            <label
              htmlFor="categoryName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category Name *
            </label>
            <input
              ref={inputRef}
              id="categoryName"
              type="text"
              className="border border-gray-300 rounded-lg w-full max-w-md px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition"
              placeholder="Enter category name"
            />
          </div>

          {/* Category Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category Images *
            </label>

            {/* Images preview container */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={image.url}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    {/* Status indicator */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                      image.isExisting 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {image.isExisting ? 'Saved' : 'New'}
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveImage(image.id)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 transition"
                      title="Remove image"
                      type="button"
                    >
                      <IoClose className="text-white w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Image Upload Area */}
            <div className="border-dashed border-2 border-gray-300 bg-gray-50 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer relative group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={backdropOpen}
              />
              <div className="flex flex-col items-center">
                <MdOutlineImage className="text-gray-400 group-hover:text-blue-500 text-5xl mb-3 transition" />
                <span className="text-gray-600 group-hover:text-blue-600 text-sm font-medium transition">
                  Click to upload images
                </span>
                <span className="text-gray-400 text-xs mt-1">
                  PNG, JPG, GIF up to 10MB
                </span>
              </div>
            </div>
          </div>

          {/* Publish Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={handlePublish}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition flex items-center justify-center gap-2 min-w-[200px]"
              type="button"
              disabled={isUploading || backdropOpen}
            >
              <IoCloudUpload className="w-5 h-5" />
              <span>
                {isUploading
                  ? "SAVING..."
                  : categoryToEdit
                  ? "UPDATE CATEGORY"
                  : "PUBLISH CATEGORY"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop for image upload loading */}
      <Backdrop
        sx={(theme) => ({
          color: "#fff",
          zIndex: theme.zIndex.drawer + 1,
          backdropFilter: "blur(3px)",
        })}
        open={backdropOpen}
      >
        <div className="text-center">
          <CircularProgress color="inherit" size={60} />
          <div className="mt-4 text-lg font-medium">
            {isRemoving ? "Removing Images..." : "Processing Images..."}
          </div>
        </div>
      </Backdrop>

      {/* Loading backdrop for publishing */}
      <Backdrop
        sx={(theme) => ({
          color: "#fff",
          zIndex: theme.zIndex.drawer + 2,
          backdropFilter: "blur(3px)",
        })}
        open={isUploading}
      >
        <div className="text-center">
          <CircularProgress color="inherit" size={60} />
          <div className="mt-4 text-lg font-medium">
            {categoryToEdit ? "Updating Category..." : "Publishing Category..."}
          </div>
        </div>
      </Backdrop>

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
    </div>
  );
};

export default AddCategory;