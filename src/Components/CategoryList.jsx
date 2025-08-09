import React, { useState } from "react";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { IoImageOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CategoryList = () => {
  // Sample data - replace with your actual data
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Electronics",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop&crop=center",
    },
    {
      id: 2,
      name: "Clothing",
      image:
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&h=100&fit=crop&crop=center",
    },
    {
      id: 3,
      name: "Books",
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100&h=100&fit=crop&crop=center",
    },
    {
      id: 4,
      name: "Home & Garden",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop&crop=center",
    },
    {
      id: 5,
      name: "Sports & Fitness",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop&crop=center",
    },
    {
      id: 6,
      name: "Beauty & Health",
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop&crop=center",
    },
    {
      id: 7,
      name: "Automotive",
      image:
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&h=100&fit=crop&crop=center",
    },
    {
      id: 8,
      name: "Food & Beverage",
      image:
        "https://images.unsplash.com/photo-1546548970-71785318a17b?w=100&h=100&fit=crop&crop=center",
    },
  ]);

  const handleEdit = (categoryId) => {
    console.log("Edit category:", categoryId);
    // Add your edit logic here
  };

  const handleDelete = (categoryId) => {
    setCategories(categories.filter((cat) => cat.id !== categoryId));
    console.log("Delete category:", categoryId);
    toast.success("Category deleted successfully!");
  };

  const navigate = useNavigate();

  const handleAddNew = () => {
    console.log("Add new category");
    navigate("/add-category");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-[18px] font-semibold text-gray-900">
            Category List
          </h1>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <FaPlus className="w-3 h-3" />
            Add New Category
          </button>
        </div>

        {/* Category Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-100 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4 px-6 py-3">
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Image
                </h3>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Category Name
                </h3>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </h3>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="grid grid-cols-3 gap-4 px-6 py-2 hover:bg-gray-50 transition-colors"
                >
                  {/* Image Column */}
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <IoImageOutline className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Name Column */}
                  <div className="flex items-center">
                    <div>
                      <h4 className="text-sm font-[400] text-gray-900">
                        {category.name}
                      </h4>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEdit(category.id)}
                      className="p-2 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors hover:shadow-md"
                      title="Edit Category"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 hover:bg-red-200 text-red-600 rounded-lg transition-colors hover:shadow-md"
                      title="Delete Category"
                    >
                      <FaTrashAlt className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <IoImageOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Categories Found
                </h3>
                <p className="text-gray-500 mb-4">
                  Get started by adding your first category.
                </p>
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 mx-auto shadow-md hover:shadow-lg"
                >
                  <FaPlus className="w-4 h-4" />
                  Add New Category
                </button>
              </div>
            )}
          </div>
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

export default CategoryList;
