import React, { useRef, useState, useEffect } from "react";
import { IoClose, IoCloudUpload, IoChevronDown } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import  toast from "react-hot-toast";
import axios from "axios";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const AddSubCategory = ({ onClose }) => {
  // Separate refs for each form
  const subCatNameRef = useRef();
  const thirdLevelNameRef = useRef();
  const navigate = useNavigate();

  // Separate states for each form
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState("");
  const [selectedSubCategoryForThird, setSelectedSubCategoryForThird] =
    useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/category/get-categoriesForAdmin`,
        { withCredentials: true }
      );

      if (response.data.success) {
        const flattenCategories = (categories) => {
          let result = [];
          categories.forEach((category) => {
            result.push(category);
            if (category.children?.length) {
              result = result.concat(flattenCategories(category.children));
            }
          });
          return result;
        };

        const allCategories = flattenCategories(response.data.data || []);

        // Main categories (no parentId)
        const mainCategories = allCategories.filter((cat) => !cat.parentId);
        setCategories(mainCategories);

        // Sub categories (have parentId but no grandparent)
        const subCats = allCategories.filter((cat) => cat.parentId);
        setSubCategories(subCats);
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

  // Filter subcategories based on selected main category
  const getFilteredSubCategories = () => {
    if (!selectedCategoryForSub) return [];
    return subCategories.filter(
      (subCat) =>
        subCat.parentId &&
        subCat.parentId.toString() === selectedCategoryForSub.toString()
    );
  };

  // Close modal
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  // Submit for Sub Category
  const handlePublishSubCategory = async () => {
    const name = subCatNameRef.current?.value.trim();

    if (!selectedCategoryForSub) {
      toast.error("Please select a parent category.");
      return;
    }
    if (!name) {
      toast.error("Please enter a sub category name.");
      return;
    }

    const selectedCategory = categories.find(
      (cat) => cat._id.toString() === selectedCategoryForSub.toString()
    );

    if (!selectedCategory) {
      toast.error("Invalid parent category selected.");
      return;
    }

    setIsSubmitting(true);

    try {
      const categoryData = {
        name: name,
        parentId: selectedCategoryForSub,
        parentCatName: selectedCategory.name,
        // No images field for subcategories
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/category/createCategory`,
        categoryData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Sub Category created successfully!");
        subCatNameRef.current.value = "";
        setSelectedCategoryForSub("");

        // Refresh categories to get updated list
        await fetchCategories();

        setTimeout(() => {
          setIsSubmitting(false);
          handleClose();
        }, 2000);
      } else {
        setIsSubmitting(false);
        toast.error(response.data.message || "Failed to create sub category");
      }
    } catch (error) {
      console.error("Create subcategory error:", error);
      setIsSubmitting(false);
      toast.error(
        error.response?.data?.message ||
          "Failed to create sub category. Please try again."
      );
    }
  };

  // Submit for Third Level Category
  const handlePublishThirdLevel = async () => {
    const name = thirdLevelNameRef.current?.value.trim();

    if (!selectedSubCategoryForThird) {
      toast.error("Please select a sub category.");
      return;
    }
    if (!name) {
      toast.error("Please enter a third level category name.");
      return;
    }

    const selectedSubCategory = subCategories.find(
      (subCat) => subCat._id === selectedSubCategoryForThird
    );
    if (!selectedSubCategory) {
      toast.error("Invalid sub category selected.");
      return;
    }

    setIsSubmitting(true);

    try {
      const categoryData = {
        name: name,
        parentId: selectedSubCategoryForThird,
        parentCatName: selectedSubCategory.name,
        // No images field for third level categories
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/category/createCategory`,
        categoryData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Third Level Category created successfully!");
        thirdLevelNameRef.current.value = "";
        setSelectedSubCategoryForThird("");

        // Refresh categories to get updated list
        await fetchCategories();

        setTimeout(() => {
          setIsSubmitting(false);
          handleClose();
        }, 2000);
      } else {
        setIsSubmitting(false);
        toast.error(
          response.data.message || "Failed to create third level category"
        );
      }
    } catch (error) {
      console.error("Create third level category error:", error);
      setIsSubmitting(false);
      toast.error(
        error.response?.data?.message ||
          "Failed to create third level category. Please try again."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-start justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-6xl mx-auto mt-8 mb-8 max-h-[90vh] overflow-y-auto flex flex-col shadow-xl relative rounded-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Sub Categories
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <IoClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Sub Category */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Add Sub Category
              </h3>
            </div>

            {/* Parent Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Parent Category *
              </label>
              <div className="relative">
                <select
                  value={selectedCategoryForSub}
                  onChange={(e) => setSelectedCategoryForSub(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                             focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-900"
                  disabled={isSubmitting}
                >
                  <option value="">Choose a parent category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <IoChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 
                                           w-5 h-5 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Sub Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Category Name *
              </label>
              <input
                ref={subCatNameRef}
                type="text"
                placeholder="Enter sub category name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Publish Button */}
            <button
              onClick={handlePublishSubCategory}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 
                         rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <IoCloudUpload className="w-5 h-5" />
              {isSubmitting ? "CREATING..." : "CREATE SUB CATEGORY"}
            </button>
          </div>

          {/* Add Third Level Category */}
          <div className="bg-green-50 rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Add Third Level Category
              </h3>
            </div>

            {/* Sub Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Sub Category *
              </label>
              <div className="relative">
                <select
                  value={selectedSubCategoryForThird}
                  onChange={(e) =>
                    setSelectedSubCategoryForThird(e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                             focus:ring-green-500 focus:border-transparent appearance-none bg-white text-gray-900"
                  disabled={isSubmitting}
                >
                  <option value="">Choose a sub category</option>
                  {subCategories.map((subCat) => (
                    <option key={subCat._id} value={subCat._id}>
                      {subCat.name} (under {subCat.parentCatName})
                    </option>
                  ))}
                </select>
                <IoChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 
                                           w-5 h-5 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Third Level Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Third Level Category Name *
              </label>
              <input
                ref={thirdLevelNameRef}
                type="text"
                placeholder="Enter third level category name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-green-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Publish Button */}
            <button
              onClick={handlePublishThirdLevel}
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 
                         rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <IoCloudUpload className="w-5 h-5" />
              {isSubmitting ? "CREATING..." : "CREATE THIRD LEVEL CATEGORY"}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="border-t bg-blue-50 px-6 py-4 rounded-b-lg">
          <div className="text-sm text-blue-700">
            <strong>Note:</strong> Categories available: {categories.length}{" "}
            main categories,
            {subCategories.length} sub categories. Sub categories will be
            created under main categories, and third level categories will be
            created under sub categories.
          </div>
        </div>
      </div>

      {/* MUI Backdrop for loading */}
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={isSubmitting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default AddSubCategory;
