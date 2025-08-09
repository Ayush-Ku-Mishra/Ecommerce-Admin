import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose, IoCloudUpload } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddCategory = () => {
  const inputRef = useRef();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);

  // Close button handler
  const handleClose = () => {
    navigate(-1); // Goes back to the previous route
  };

  // Backdrop click handler (optional, closes when clicking outside modal content)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle image upload for multiple images with preview
  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Reset file input so the same file(s) can be uploaded again if needed
    e.target.value = "";
  };

  // Remove image from preview and state, revoke Object URL to avoid memory leaks
  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const imgToRemove = prev.find((img) => img.id === id);
      if (imgToRemove && imgToRemove.url) {
        URL.revokeObjectURL(imgToRemove.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  // Publish button click handler
  const handlePublish = () => {
    const categoryName = inputRef.current?.value.trim();

    // Validate inputs
    if (!categoryName) {
      toast.error("Please enter a category name.");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least one category image.");
      return;
    }

    // Success case: show toast, reset fields, and close modal after delay
    toast.success("Category published successfully!");

    // Reset fields
    inputRef.current.value = "";
    images.forEach((img) => URL.revokeObjectURL(img.url)); // Clean up URLs
    setImages([]);

    // Close modal after delay (e.g., 2 seconds)
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-start justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-8xl mx-auto min-h-screen flex flex-col shadow-xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-2 border-b bg-gray-100 shadow-md">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
            Add New Category
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded hover:bg-gray-200 transition"
            aria-label="Close"
          >
            <IoClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col gap-6 sm:gap-8">
          {/* Category Name */}
          <div>
            <label
              htmlFor="categoryName"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
            >
              Category Name
            </label>
            <input
              ref={inputRef}
              id="categoryName"
              type="text"
              className="border border-gray-300 rounded w-full sm:w-1/2 md:w-1/3 px-3 py-2 outline-none focus:ring focus:ring-blue-100 text-sm sm:text-base"
              placeholder="Enter category name"
            />
          </div>

          {/* Category Image */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Category Images
            </label>

            {/* Images preview container */}
            <div className="flex flex-wrap gap-4 mb-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-lg overflow-hidden border border-dashed border-gray-300 shadow-sm"
                >
                  <img
                    src={image.url}
                    alt="Uploaded preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <button
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute top-0 right-0 bg-red-700 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 transition"
                    title="Remove image"
                    type="button"
                  >
                    <IoClose className="text-white w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Image Upload Area */}
            <div className="border-dashed border-2 border-gray-300 bg-gray-100 rounded w-28 h-28 sm:w-40 sm:h-32 flex flex-col items-center justify-center cursor-pointer relative hover:bg-gray-200 transition mx-auto sm:mx-0">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <MdOutlineImage className="text-gray-400 text-3xl sm:text-4xl mb-2" />
              <span className="text-gray-500 text-xs sm:text-sm">Upload Images</span>
            </div>
          </div>

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition w-full sm:w-2/3 md:w-2/5 flex items-center justify-center gap-2"
            type="button"
          >
            <IoCloudUpload className="w-5 h-5" />
            <span className="text-sm sm:text-base">PUBLISH AND VIEW</span>
          </button>
        </div>
      </div>
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
