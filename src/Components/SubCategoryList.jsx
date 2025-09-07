import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaSpinner,
  FaLayerGroup,
  FaTags,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { IoImageOutline } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import AddSubCategory from "./AddSubCategory";
import CircularProgress from "@mui/material/CircularProgress";

const SubCategoryList = () => {
  const [showAddSubCategory, setShowAddSubCategory] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [thirdLevelCategories, setThirdLevelCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/category/get-categories`,
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

        const flattenedCategories = flattenCategories(response.data.data || []);
        setAllCategories(flattenedCategories); // Store all categories

        // Main categories (no parentId)
        const mainCategories = flattenedCategories.filter(
          (cat) => !cat.parentId
        );
        setCategories(mainCategories);

        // Get hierarchy depth for each category
        const getCategoryDepth = (categoryId, depth = 0) => {
          const category = flattenedCategories.find(
            (cat) => cat._id === categoryId
          );
          if (!category || !category.parentId) return depth;
          return getCategoryDepth(category.parentId, depth + 1);
        };

        // Sub categories (depth = 1)
        const subCats = flattenedCategories.filter((cat) => {
          if (!cat.parentId) return false;
          return getCategoryDepth(cat._id) === 1;
        });
        setSubCategories(subCats);

        // Third level and beyond (depth >= 2)
        const thirdLevelCats = flattenedCategories.filter((cat) => {
          if (!cat.parentId) return false;
          return getCategoryDepth(cat._id) >= 2;
        });
        setThirdLevelCategories(thirdLevelCats);

        // Set default expanded state
        const expanded = {};
        if (mainCategories.length > 0) {
          const firstMain = mainCategories[0];
          expanded[firstMain._id] = true;

          const subCatsOfFirst = subCats.filter(
            (sub) => sub.parentId === firstMain._id
          );
          subCatsOfFirst.forEach((sub) => {
            expanded[sub._id] = true;

            const childrenOfSub = flattenedCategories.filter(
              (child) => child.parentId === sub._id
            );
            childrenOfSub.forEach((child) => {
              expanded[child._id] = true;
            });
          });
        }
        setExpandedCategories(expanded);
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

  const handleAddSubCategoryClose = () => {
    setShowAddSubCategory(false);
    fetchCategories(); // Refresh the list when modal closes
  };

  const toggleExpanded = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleEdit = (item) => {
    setEditing(item._id);
    setEditName(item.name);
  };

  const handleSaveEdit = async (item) => {
    if (!editName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/category/${item._id}`,
        { name: editName.trim() },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Category updated successfully!");
        setEditing(null);
        setEditName("");
        fetchCategories(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to update category");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update category. Please try again."
      );
    }
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditName("");
  };

  const handleDelete = async (item, level) => {
    if (!window.confirm(`Are you sure you want to delete this ${level}?`)) {
      return;
    }

    try {
      setDeleting(item._id);
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/category/${item._id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchCategories(); // Refresh the list
      } else {
        toast.error(response.data.message || `Failed to delete ${level}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to delete ${level}. Please try again.`
      );
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderCategoryItem = (item, level, paddingLevel = 0) => {
    const isMainCategory = level === "main";
    const isSubCategory = level === "sub";

    // Check if this item has children using allCategories from state
    const hasChildren = allCategories.some(
      (child) => child.parentId === item._id
    );

    const isExpanded = expandedCategories[item._id];
    const paddingLeft = paddingLevel * 24;

    return (
      <React.Fragment key={item._id}>
        <tr className="hover:bg-gray-50">
          <td
            className="px-6 py-4 whitespace-nowrap"
            style={{ paddingLeft: `${paddingLeft + 24}px` }}
          >
            <div className="flex items-center">
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(item._id)}
                  className="mr-2 p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <FaChevronDown className="w-3 h-3 text-gray-500" />
                  ) : (
                    <FaChevronRight className="w-3 h-3 text-gray-500" />
                  )}
                </button>
              )}

              {!hasChildren && <div className="w-6 mr-2"></div>}

              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center mr-3 ${
                  isMainCategory
                    ? "bg-blue-100"
                    : isSubCategory
                    ? "bg-green-100"
                    : "bg-purple-100"
                }`}
              >
                {isMainCategory && (
                  <FaLayerGroup className="w-4 h-4 text-blue-600" />
                )}
                {isSubCategory && <FaTags className="w-4 h-4 text-green-600" />}
                {!isMainCategory && !isSubCategory && (
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                )}
              </div>

              <div>
                {editing === item._id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleSaveEdit(item)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isMainCategory
                        ? "Main Category"
                        : isSubCategory
                        ? "Sub Category"
                        : `Level ${paddingLevel + 2} Category`}
                    </div>
                  </>
                )}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatDate(item.createdAt)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
            {!isMainCategory && editing !== item._id && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                  title="Edit Category"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item, "category")}
                  disabled={deleting === item._id}
                  className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center justify-center w-8 h-8"
                  title="Delete Category"
                >
                  {deleting === item._id ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <FaTrashAlt className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </td>
        </tr>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <>
            {isMainCategory &&
              subCategories
                .filter((sub) => sub.parentId === item._id)
                .map((subCat) =>
                  renderCategoryItem(subCat, "sub", paddingLevel + 1)
                )}
            {!isMainCategory &&
              allCategories
                .filter((child) => child.parentId === item._id)
                .map((child) =>
                  renderCategoryItem(child, "third", paddingLevel + 1)
                )}
          </>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sub Categories Management
            </h1>
            <p className="text-gray-600">
              Manage subcategories and third-level categories
            </p>
          </div>
          <button
            onClick={() => setShowAddSubCategory(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <FaPlus className="w-4 h-4" />
            Add Sub Categories
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaLayerGroup className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Main Categories
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {categories.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FaTags className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Sub Categories
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {subCategories.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <IoImageOutline className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Third Level
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {thirdLevelCategories.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          // Loading State
          <div className="bg-white rounded-xl shadow-lg p-16">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading categories...</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Hierarchical Categories Table */}
            {categories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Category Hierarchy
                </h2>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) =>
                          renderCategoryItem(category, "main")
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {categories.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg px-6 py-16 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <FaLayerGroup className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No Categories Found
                  </h3>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    Create subcategories and third-level categories to organize
                    your products better.
                  </p>
                  <button
                    onClick={() => setShowAddSubCategory(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
                  >
                    <FaPlus className="w-5 h-5" />
                    Add Your First Sub Category
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Render Modal */}
      {showAddSubCategory && (
        <AddSubCategory onClose={handleAddSubCategoryClose} />
      )}

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

export default SubCategoryList;
