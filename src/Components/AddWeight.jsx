import React, { useState } from "react";
import { IoCloudUpload } from "react-icons/io5";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const AddWeight = () => {
  const [weightInput, setWeightInput] = useState("");
  const [weights, setWeights] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // Add or update weight
  const handlePublish = () => {
    if (!weightInput.trim()) {
      toast.error("Please enter a weight before publishing");
      return;
    }

    if (editIndex !== null) {
      // Update
      const updated = weights.map((weight, idx) =>
        idx === editIndex ? weightInput.trim() : weight
      );
      setWeights(updated);
      setEditIndex(null);
      toast.success("Weight updated successfully!");
    } else {
      // Add
      if (weights.includes(weightInput.trim())) {
        toast.error("This weight is already added!");
        return;
      }
      setWeights([...weights, weightInput.trim()]);
      toast.success("Weight added successfully!");
    }

    setWeightInput("");
  };

  // Edit weight
  const handleEdit = (idx) => {
    setWeightInput(weights[idx]);
    setEditIndex(idx);
  };

  // Delete weight (no alert)
  const handleDelete = (idx) => {
    setWeights(weights.filter((_, i) => i !== idx));
    toast.success("Weight deleted successfully!");
  };

  return (
    <div className="lg:w-[50%] pl-4 pr-2 py-5 min-w-0">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Add Product Weight
      </h2>

      {/* Entry section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-5 shadow-sm mb-6">
        <input
          type="text"
          placeholder="Enter weight (e.g., 2kg, 500g, 10)"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
        />
        <button
          onClick={handlePublish}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <IoCloudUpload className="w-5 h-5" />
          {editIndex !== null ? "Update and View" : "Publish and View"}
        </button>
      </div>

      {/* Store section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Weights List</h3>
        {weights.length === 0 ? (
          <p className="text-gray-500">No weights added yet.</p>
        ) : (
          <div className="divide-y divide-gray-300">
            {weights.map((weight, idx) => (
              <div key={idx} className="flex items-center justify-between py-2">
                <span className="font-medium text-gray-700">{weight}</span>
                <div className="flex items-center gap-4">
                  <FaEdit
                    className="text-green-600 cursor-pointer hover:text-green-800"
                    onClick={() => handleEdit(idx)}
                  />
                  <FaTrash
                    className="text-red-500 cursor-pointer hover:text-red-700"
                    onClick={() => handleDelete(idx)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddWeight;
