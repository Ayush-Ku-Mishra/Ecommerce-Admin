import React, { useRef, useState } from "react";
import { IoClose, IoCloudUpload, IoChevronDown } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddSubCategory = () => {
  // Separate refs for each form
  const subCatNameRef = useRef();
  const thirdLevelNameRef = useRef();
  const navigate = useNavigate();

  // Separate states for each form
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState("");
  const [selectedCategoryForThird, setSelectedCategoryForThird] = useState("");

  // Sample data
  const categories = [
    { id: 1, name: "Fashion" },
    { id: 2, name: "Electronics" },
    { id: 3, name: "Books" },
    { id: 4, name: "Home & Garden" },
    { id: 5, name: "Sports" },
  ];

  const subCategories = [
    { id: 1, name: "Women", parentId: 1 },
    { id: 2, name: "Men", parentId: 1 },
    { id: 3, name: "Girls", parentId: 1 },
    { id: 4, name: "Mobiles", parentId: 2 },
    { id: 5, name: "Laptops", parentId: 2 },
  ];

  // Close modal
  const handleClose = () => {
    console.log("Close modal");
    navigate(-1);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  // Submit for Sub Category
  const handlePublishSubCategory = () => {
    const name = subCatNameRef.current?.value.trim();

    if (!selectedCategoryForSub) {
      toast.error("Please select a product category.");
      return;
    }
    if (!name) {
      toast.error("Please enter a sub category name.");
      return;
    }

    toast.success("Sub Category published successfully!");
    subCatNameRef.current.value = "";
    setSelectedCategoryForSub("");
    setTimeout(() => handleClose(), 2000);
  };

  // Submit for Third Level Category
  const handlePublishThirdLevel = () => {
    const name = thirdLevelNameRef.current?.value.trim();

    if (!selectedCategoryForThird) {
      toast.error("Please select a product category.");
      return;
    }
    if (!name) {
      toast.error("Please enter a sub category name.");
      return;
    }

    toast.success("Third Level Category published successfully!");
    thirdLevelNameRef.current.value = "";
    setSelectedCategoryForThird("");
    setTimeout(() => handleClose(), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-start justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-8xl mx-auto min-h-screen flex flex-col shadow-xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-2 border-b bg-gray-100 shadow-md">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            Add Categories
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded hover:bg-gray-200 transition"
          >
            <IoClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Sub Category */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Add Sub Category
            </h3>

            {/* Product Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategoryForSub}
                  onChange={(e) => setSelectedCategoryForSub(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                             focus:ring-blue-500 appearance-none bg-white text-gray-900"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <IoChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 
                                           w-4 h-4 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Sub Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Category Name
              </label>
              <input
                ref={subCatNameRef}
                type="text"
                placeholder="Enter sub category name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500"
              />
            </div>

            {/* Publish Button */}
            <button
              onClick={handlePublishSubCategory}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 
                         rounded-lg flex items-center justify-center gap-2 shadow-md"
            >
              <IoCloudUpload className="w-5 h-5" /> PUBLISH AND VIEW
            </button>
          </div>

          {/* Add Third Level Category */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Add Third Level Category
            </h3>

            {/* Product Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategoryForThird}
                  onChange={(e) => setSelectedCategoryForThird(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                             focus:ring-blue-500 appearance-none bg-white text-gray-900"
                >
                  <option value="">Select a category</option>
                  {subCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <IoChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 
                                           w-4 h-4 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Sub Category Name (for third level) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Category Name
              </label>
              <input
                ref={thirdLevelNameRef}
                type="text"
                placeholder="Enter sub category name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500"
              />
            </div>

            {/* Publish Button */}
            <button
              onClick={handlePublishThirdLevel}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 
                         rounded-lg flex items-center justify-center gap-2 shadow-md"
            >
              <IoCloudUpload className="w-5 h-5" /> PUBLISH AND VIEW
            </button>
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

export default AddSubCategory;
