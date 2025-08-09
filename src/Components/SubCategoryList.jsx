import React, { useState } from "react";
import {
  FaEdit,
  FaTrashAlt,
  FaChevronDown,
  FaChevronRight,
  FaPlus,
} from "react-icons/fa";
import { IoImageOutline } from "react-icons/io5";

const SubCategoryList = () => {
  // Sample hierarchical category data
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Fashion",
      isOpen: true, // Default open
      subcategories: [
        {
          id: 11,
          name: "Women",
          subcategories: [
            {
              id: 111,
              name: "Saree",
            },
            {
              id: 112,
              name: "Tops",
            },
            {
              id: 113,
              name: "Jeans",
            },
          ],
        },
        {
          id: 12,
          name: "Girls",
          subcategories: [
            {
              id: 121,
              name: "Kurtis",
            },
            {
              id: 122,
              name: "Tops",
            },
          ],
        },
        {
          id: 13,
          name: "Men",
          subcategories: [
            {
              id: 131,
              name: "Shirts",
            },
            {
              id: 132,
              name: "Trousers",
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Electronics",
      isOpen: false,
      subcategories: [
        {
          id: 21,
          name: "Mobiles",
          subcategories: [
            {
              id: 211,
              name: "Smartphones",
            },
            {
              id: 212,
              name: "Feature Phones",
            },
          ],
        },
        {
          id: 22,
          name: "Laptops",
          subcategories: [],
        },
      ],
    },
    {
      id: 3,
      name: "Bags",
      isOpen: false,
      subcategories: [
        {
          id: 31,
          name: "Handbags",
          subcategories: [],
        },
        {
          id: 32,
          name: "Backpacks",
          subcategories: [],
        },
      ],
    },
    {
      id: 4,
      name: "Footwear",

      isOpen: false,
      subcategories: [
        {
          id: 41,
          name: "Sports Shoes",
          subcategories: [],
        },
        {
          id: 42,
          name: "Formal Shoes",
          subcategories: [],
        },
      ],
    },
  ]);

  // Toggle category open/close - only one at a time
  const toggleCategory = (categoryId) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) => ({
        ...cat,
        isOpen: cat.id === categoryId ? !cat.isOpen : false,
      }))
    );
  };

  const handleEdit = (item, level) => {
    console.log(`Edit ${level}:`, item);
    // Add your edit logic here
  };

  const handleDelete = (item, level) => {
    if (window.confirm(`Are you sure you want to delete this ${level}?`)) {
      console.log(`Delete ${level}:`, item);
      // Add your delete logic here
    }
  };

  const handleAddSubcategory = (parentId, level) => {
    console.log(`Add subcategory to ${level} with ID:`, parentId);
    // Add your add subcategory logic here
  };

  const ActionButtons = ({ item, level }) => (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => handleEdit(item, level)}
        className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded transition-colors"
        title={`Edit ${level}`}
      >
        <FaEdit className="w-3 h-3" />
      </button>
      <button
        onClick={() => handleDelete(item, level)}
        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors"
        title={`Delete ${level}`}
      >
        <FaTrashAlt className="w-3 h-3" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Sub Category List
          </h1>
          <button
            onClick={() => handleAddSubcategory(null, "main category")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <FaPlus className="w-3 h-3" />
            Add Main Category
          </button>
        </div>

        {/* Category Tree */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div key={category.id} className="group">
                {/* Main Category */}
                <div className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {category.isOpen ? (
                          <FaChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <FaChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                      </button>

                      <div className="flex-1">
                        <h3 className="text-md font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {category.subcategories.length} subcategories
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleAddSubcategory(category.id, "subcategory")
                        }
                        className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Add Subcategory"
                      >
                        <FaPlus className="w-3 h-3" />
                      </button>
                      <ActionButtons item={category} level="main category" />
                    </div>
                  </div>
                </div>

                {/* Subcategories */}
                {category.isOpen && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="group/sub">
                        {/* Subcategory */}
                        <div className="pl-12 pr-4 py-3 hover:bg-gray-100 transition-colors border-l-2 border-blue-200 ml-8">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-800">
                                  {subcategory.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {subcategory.subcategories?.length || 0}{" "}
                                  sub-subcategories
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {subcategory.subcategories?.length > 0 && (
                                <button
                                  onClick={() =>
                                    handleAddSubcategory(
                                      subcategory.id,
                                      "sub-subcategory"
                                    )
                                  }
                                  className="p-1.5 bg-green-100 hover:bg-green-200 text-green-600 rounded transition-colors opacity-0 group-hover/sub:opacity-100"
                                  title="Add Sub-subcategory"
                                >
                                  <FaPlus className="w-3 h-3" />
                                </button>
                              )}
                              <div className="opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                <ActionButtons
                                  item={subcategory}
                                  level="subcategory"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sub-subcategories */}
                        {subcategory.subcategories &&
                          subcategory.subcategories.map((subSubcategory) => (
                            <div
                              key={subSubcategory.id}
                              className="group/subsub"
                            >
                              <div className="pl-20 pr-4 py-2 hover:bg-gray-200 transition-colors border-l-2 border-green-200 ml-16">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex-1">
                                      <h5 className="text-sm font-medium text-gray-700">
                                        {subSubcategory.name}
                                      </h5>
                                    </div>
                                  </div>
                                  <div className="opacity-0 group-hover/subsub:opacity-100 transition-opacity">
                                    <ActionButtons
                                      item={subSubcategory}
                                      level="sub-subcategory"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubCategoryList;
