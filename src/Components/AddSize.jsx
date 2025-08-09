import React, { useState } from "react";
import { IoCloudUpload } from "react-icons/io5";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddSize = () => {
  const [sizeInput, setSizeInput] = useState("");
  const [sizes, setSizes] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // Handle add or update
  const handlePublish = () => {
    if (!sizeInput.trim()) {
      toast.error("Please enter a size before publishing");
      return;
    }

    if (editIndex !== null) {
      // Update existing size
      const updatedSizes = sizes.map((size, idx) =>
        idx === editIndex ? sizeInput.trim() : size
      );
      setSizes(updatedSizes);
      setEditIndex(null);
      toast.success("Size updated successfully!");
    } else {
      // Add new size
      if (sizes.includes(sizeInput.trim())) {
        toast.error("This size is already added!");
        return;
      }
      setSizes([...sizes, sizeInput.trim()]);
      toast.success("Size added successfully!");
    }

    setSizeInput("");
  };

  // Handle edit
  const handleEdit = (index) => {
    setSizeInput(sizes[index]);
    setEditIndex(index);
  };

  // Handle delete
  const handleDelete = (index) => {
  const updatedSizes = sizes.filter((_, i) => i !== index);
  setSizes(updatedSizes);
  toast.success("Size deleted successfully!");
};


  return (
    <div className="lg:w-[50%] pl-4 pr-2 py-5 min-w-0">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Add Product Size</h2>

      {/* Entry Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm mb-6">
        {/* Input */}
        <input
          type="text"
          placeholder="Enter size (e.g., S, M, L, XL)"
          value={sizeInput}
          onChange={(e) => setSizeInput(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />

        {/* Publish and View button */}
        <button
          onClick={handlePublish}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <IoCloudUpload className="w-5 h-5" />
          {editIndex !== null ? "Update and View" : "Publish and View"}
        </button>
      </div>

      {/* Store Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Sizes List</h3>

        {sizes.length === 0 ? (
          <p className="text-gray-500">No sizes added yet.</p>
        ) : (
          <div className="divide-y divide-gray-300">
            {sizes.map((size, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                {/* Size text */}
                <span className="font-medium text-gray-700">{size}</span>

                {/* Action icons */}
                <div className="flex items-center gap-4">
                  <FaEdit
                    className="text-blue-500 cursor-pointer hover:text-blue-700"
                    onClick={() => handleEdit(index)}
                  />
                  <FaTrash
                    className="text-red-500 cursor-pointer hover:text-red-700"
                    onClick={() => handleDelete(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
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

export default AddSize;
