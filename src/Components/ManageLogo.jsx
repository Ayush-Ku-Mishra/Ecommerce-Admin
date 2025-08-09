import React, { useState } from "react";
import { IoCloudUpload } from "react-icons/io5";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineImage } from "react-icons/md";

const ManageLogo = () => {
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logos, setLogos] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // Handle logo file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (optional)
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // Handle add or update logo
  const handlePublish = () => {
    if (!logoFile) {
      toast.error("Please select a logo image before publishing.");
      return;
    }

    if (editIndex !== null) {
      // Update existing logo
      const updatedLogos = logos.map((logo, idx) =>
        idx === editIndex ? { file: logoFile, preview: logoPreview } : logo
      );
      setLogos(updatedLogos);
      setEditIndex(null);
      toast.success("Logo updated successfully!");
    } else {
      // Add new logo
      setLogos([...logos, { file: logoFile, preview: logoPreview }]);
      toast.success("Logo added successfully!");
    }

    // Reset input and preview
    setLogoFile(null);
    setLogoPreview(null);
    // Reset file input value to allow re-upload of the same file if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Reference to clear file input
  const fileInputRef = React.useRef(null);

  // Handle edit logo
  const handleEdit = (index) => {
    const logo = logos[index];
    setLogoFile(logo.file);
    setLogoPreview(logo.preview);
    setEditIndex(index);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle delete logo (no alert)
  const handleDelete = (index) => {
    setLogos(logos.filter((_, i) => i !== index));
    toast.success("Logo deleted successfully!");
  };

  return (
    <div className="lg:w-[50%] pl-4 pr-2 py-5 min-w-0">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Manage Logo</h2>

      {/* Entry section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 shadow-sm mb-6">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          id="logo-upload"
          className="hidden"
        />

        {/* Clickable div acting as label */}
        <label
          htmlFor="logo-upload"
          className="cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed border-yellow-400 rounded-md p-10 text-yellow-600 hover:bg-yellow-100 transition"
          title="Click to upload logo"
        >
          <MdOutlineImage className="w-12 h-12" />
          <span className="text-sm font-semibold select-none">Upload Logo</span>
        </label>

        {/* Preview */}
        {logoPreview && (
          <div className="mt-4">
            <img
              src={logoPreview}
              alt="Logo Preview"
              className="w-32 h-32 object-contain border rounded-md mx-auto"
            />
          </div>
        )}

        {/* Publish and View button (unchanged) */}
        <button
          onClick={handlePublish}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
        >
          <IoCloudUpload className="w-5 h-5" />
          {editIndex !== null ? "Update and View" : "Publish and View"}
        </button>
      </div>

      {/* Stored logos section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Stored Logos</h3>
        {logos.length === 0 ? (
          <p className="text-gray-500">No logos added yet.</p>
        ) : (
          <div className="divide-y divide-gray-300">
            {logos.map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <img
                  src={logo.preview}
                  alt={`Logo ${index + 1}`}
                  className="w-20 h-20 object-contain border rounded-md"
                />

                {/* Action icons */}
                <div className="flex items-center gap-4">
                  <FaEdit
                    className="text-yellow-600 cursor-pointer hover:text-yellow-800"
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

export default ManageLogo;
