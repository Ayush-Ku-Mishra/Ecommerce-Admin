import React, { useState, useEffect } from "react";
import { IoClose, IoCloudUpload } from "react-icons/io5";
import { FaRegImages } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

const AddHomeSlideModal = ({ isOpen, onClose, onAddBanners }) => {
  const [images, setImages] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if this is being used as a route (from sidebar) or as a modal (from button)
  const isRoute = !isOpen && !onClose; // If no props passed, it's being used as a route
  const shouldShow = isRoute || isOpen; // Show if it's a route OR if isOpen is true

  // Auto-open when used as a route
  useEffect(() => {
    if (isRoute) {
      // Component is being used as a route, so it should always show
    }
  }, [isRoute]);

  const handleSubmitFinal = () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    // Call the callback to add banners to parent component
    if (onAddBanners) {
      onAddBanners(images);
    }

    // Prepare final form data (if you need to send to backend)
    const finalFormData = {
      mainImages: images.map((img) => img.file),
    };

    console.log("✅ Home slide data ready to submit:", finalFormData);
    toast.success("Home slide published successfully!");

    // Reset state
    setImages([]);

    // Handle closing based on usage
    if (isRoute) {
      // If used as route, navigate back
      setTimeout(() => {
        navigate(-1);
      }, 1500); // Wait for toast to show
    } else {
      // If used as modal, call onClose
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    // Validate file types
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const validFiles = Array.from(files).filter((file) => {
      if (!validTypes.includes(file.type)) {
        toast.error(
          `Invalid file type: ${file.name}. Please upload images only.`
        );
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error(
          `File too large: ${file.name}. Please upload files under 5MB.`
        );
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newImages = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    event.target.value = "";

    toast.success(
      `${validFiles.length} image${
        validFiles.length > 1 ? "s" : ""
      } added successfully!`
    );
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove && imageToRemove.url) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Clean up any blob URLs when closing
    images.forEach((image) => {
      if (image.url) {
        URL.revokeObjectURL(image.url);
      }
    });

    if (isRoute) {
      navigate(-1);
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Don't render if it's a modal and not open
  if (!shouldShow) return null;

  return (
    <>
      {/* Backdrop - only show for modal usage, not for route usage */}
      {!isRoute && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 overflow-hidden"
          onClick={handleBackdropClick}
        />
      )}

      {/* Modal/Page Content */}
      <div
        className={`${
          isRoute ? "min-h-screen bg-gray-50" : "fixed inset-0 z-50"
        } flex flex-col bg-white`}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-200 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            Add Home Slide
          </h1>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
            aria-label="Close"
          >
            <IoClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Instructions */}
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Add Home Banner Slide
              </h3>
              <p className="text-blue-700 text-sm mb-2">
                Upload images for your home page banner slider. You can upload
                multiple images that will be displayed as a slideshow.
              </p>
              <ul className="text-blue-600 text-xs space-y-1">
                <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                <li>• Maximum file size: 5MB per image</li>
                <li>• Recommended dimensions: 1920x600px for best results</li>
              </ul>
            </div>

            {/* Image Upload Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Upload Images ({images.length} selected)
              </h4>

              <div className="flex flex-wrap gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative w-40 h-40 rounded-lg overflow-hidden shadow-md border-2 border-gray-200 group"
                  >
                    <img
                      src={image.url}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <button
                        onClick={() => handleRemoveImage(image.id)}
                        className="opacity-0 group-hover:opacity-100 bg-red-600 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 transition-all shadow-lg transform scale-90 hover:scale-100"
                        title="Remove image"
                        type="button"
                      >
                        <IoClose className="text-white w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload Area */}
                <div className="relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 flex flex-col items-center justify-center transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FaRegImages className="text-gray-400 group-hover:text-blue-500 text-4xl mb-2 transition-colors" />
                  <span className="text-sm text-gray-500 group-hover:text-blue-600 font-medium transition-colors text-center px-2">
                    Upload Images
                  </span>
                </div>
              </div>

              {images.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">
                    ✓ {images.length} image{images.length > 1 ? "s" : ""} ready
                    to publish
                  </p>
                </div>
              )}
            </div>

            {/* Publish Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSubmitFinal}
                disabled={images.length === 0}
                className={`${
                  images.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                } text-white font-semibold py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md transform hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-md`}
                type="button"
              >
                <IoCloudUpload className="w-5 h-5" />
                PUBLISH & VIEW ({images.length} images)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddHomeSlideModal;
