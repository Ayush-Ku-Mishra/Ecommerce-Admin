import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaSpinner,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { IoImageOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import AddCategory from "./AddCategory"; // Assume proper relative path
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Image modal states - updated for Swiper
  const [imageModal, setImageModal] = useState({
    open: false,
    images: [],
    currentIndex: 0,
    categoryName: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/category/get-categoriesForAdmin`,
        { withCredentials: true }
      );
      if (response.data.success) {
        // Filter only main categories (no parentId)
        const mainCategories = response.data.data.filter(
          (category) => !category.parentId
        );
        setCategories(mainCategories);
      } else {
        toast.error(response.data.message || "Failed to fetch categories");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryAdded = (newOrUpdatedCategory) => {
    setCategories((prev) => {
      const existingIndex = prev.findIndex(
        (cat) => cat._id === newOrUpdatedCategory._id
      );
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = newOrUpdatedCategory;
        return updated;
      }
      return [...prev, newOrUpdatedCategory];
    });
    setEditModalOpen(false);
  };

  const handleEdit = async (categoryId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/category/${categoryId}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setEditingCategory(response.data.category);
        setEditModalOpen(true);
      } else {
        toast.error(response.data.message || "Failed to get category data");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch category data."
      );
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      setDeleting(categoryId);
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/category/${categoryId}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
        toast.success("Category deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete category. Please try again."
      );
    } finally {
      setDeleting(null);
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setEditModalOpen(true);
  };

  // Updated image modal functions for Swiper
  const handleImageClick = (category, imageIndex = 0) => {
    console.log("Image clicked:", category, imageIndex); // Debug log
    console.log("Category images:", category.images); // Debug log
    if (category.images && category.images.length > 0) {
      setImageModal({
        open: true,
        images: category.images,
        currentIndex: imageIndex,
        categoryName: category.name,
      });
      console.log("Modal state set:", {
        open: true,
        images: category.images,
        currentIndex: imageIndex,
        categoryName: category.name,
      }); // Debug log
    } else {
      console.log("No images found for category:", category.name);
    }
  };

  const closeImageModal = () => {
    setImageModal({
      open: false,
      images: [],
      currentIndex: 0,
      categoryName: "",
    });
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Main Categories
            </h1>
            <p className="text-gray-600">
              Manage your main product categories ({categories.length} total)
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto justify-center"
          >
            <FaPlus className="w-4 h-4" />
            Add New Category
          </button>
        </div>

        {/* Category Grid/List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            // Loading State
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading categories...</p>
              </div>
            </div>
          ) : categories.length > 0 ? (
            <>
              {/* Table Header (hidden on small screens) */}
              <div className="hidden md:block bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 px-6 py-4">
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Image
                    </h3>
                  </div>
                  <div className="col-span-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Category Name
                    </h3>
                  </div>
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Images Count
                    </h3>
                  </div>
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Created Date
                    </h3>
                  </div>
                  <div className="col-span-2 text-center">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </h3>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {categories.map((category, index) => (
                  <div
                    key={category._id}
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-25"
                    }`}
                  >
                    {/* Image Column */}
                    <div className="col-span-2 flex items-center justify-center md:justify-start">
                      <div className="relative group">
                        <div
                          className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow mx-auto md:mx-0 cursor-pointer hover:border-blue-300"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Image container clicked!", category);
                            handleImageClick(category, 0);
                          }}
                          style={{ zIndex: 10 }}
                        >
                          {category.images && category.images.length > 0 ? (
                            <img
                              src={category.images[0]}
                              alt={category.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
                              style={{ pointerEvents: "none" }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center pointer-events-none">
                              <IoImageOutline className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {category.images && category.images.length > 1 && (
                          <div
                            className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-lg pointer-events-none"
                            style={{ pointerEvents: "none" }}
                          >
                            +{category.images.length - 1}
                          </div>
                        )}
                        {/* Hover overlay for clickable indication */}
                        <div
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none"
                          style={{ pointerEvents: "none" }}
                        >
                          <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                            Click to view
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category Name Column */}
                    <div className="col-span-4 flex items-center">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-1">
                          {category.name}
                        </h4>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Main Category
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Images Count Column */}
                    <div className="col-span-2 flex items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <IoImageOutline className="w-4 h-4 mr-1" />
                        <span className="font-medium">
                          {category.images ? category.images.length : 0} image
                          {category.images && category.images.length !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>
                    </div>

                    {/* Created Date Column */}
                    <div className="col-span-2 flex items-center">
                      <div className="text-sm text-gray-600">
                        <div className="font-medium">
                          {category.createdAt
                            ? formatDate(category.createdAt)
                            : "Unknown"}
                        </div>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(category._id)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors hover:shadow-md"
                        title="Edit Category"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        disabled={deleting === category._id}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors hover:shadow-md disabled:opacity-50"
                        title="Delete Category"
                      >
                        {deleting === category._id ? (
                          <FaSpinner className="w-4 h-4 animate-spin" />
                        ) : (
                          <FaTrashAlt className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="px-6 py-16 text-center">
              <div className="max-w-sm mx-auto">
                <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <IoImageOutline className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No Categories Yet
                </h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  Start organizing your products by creating your first
                  category. Categories help customers find what they're looking
                  for quickly.
                </p>
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FaPlus className="w-5 h-5" />
                  Create Your First Category
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {categories.length > 0 && (
          <div className="mt-6 bg-white rounded-lg p-6 shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600">Total Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {categories.reduce(
                    (total, cat) =>
                      total + (cat.images ? cat.images.length : 0),
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Images</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {categories.length > 0
                    ? formatDate(
                        Math.max(
                          ...categories.map(
                            (cat) => new Date(cat.createdAt || 0)
                          )
                        )
                      )
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-600">Last Updated</div>
              </div>
            </div>
          </div>
        )}

        {/* Image Gallery Modal using Dialog - Same as ProductsSection */}
        {imageModal.open && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            style={{ zIndex: 9999 }}
          >
            <div
              className="relative bg-black rounded-lg overflow-hidden"
              style={{
                backgroundColor: "transparent",
                boxShadow: "none",
                maxWidth: "95vw",
                maxHeight: "95vh",
                width: "100%",
                height: "100%",
              }}
            >
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 z-50 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
              >
                <FaTimes size={20} />
              </button>

              {imageModal.images.length > 0 && (
                <Swiper
                  modules={[Navigation, Pagination, Zoom]}
                  spaceBetween={0}
                  slidesPerView={1}
                  navigation={{
                    prevEl: ".swiper-button-prev-custom-category",
                    nextEl: ".swiper-button-next-custom-category",
                  }}
                  pagination={{
                    clickable: true,
                    dynamicBullets: true,
                  }}
                  zoom={{
                    maxRatio: 3,
                    minRatio: 1,
                  }}
                  initialSlide={imageModal.currentIndex}
                  className="w-full h-[80vh]"
                >
                  {imageModal.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div className="swiper-zoom-container flex items-center justify-center h-full">
                        <img
                          src={image}
                          alt={`${imageModal.categoryName} - Image ${
                            index + 1
                          }`}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </SwiperSlide>
                  ))}

                  {/* Custom Navigation Buttons */}
                  {imageModal.images.length > 1 && (
                    <>
                      <button className="swiper-button-prev-custom-category absolute left-4 top-1/2 transform -translate-y-1/2 z-40 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all">
                        <FaChevronLeft size={20} />
                      </button>
                      <button className="swiper-button-next-custom-category absolute right-4 top-1/2 transform -translate-y-1/2 z-40 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all">
                        <FaChevronRight size={20} />
                      </button>
                    </>
                  )}
                </Swiper>
              )}
            </div>
          </div>
        )}

        {editModalOpen && (
          <AddCategory
            categoryToEdit={editingCategory}
            onCategoryAdded={handleCategoryAdded}
            onClose={() => setEditModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryList;
