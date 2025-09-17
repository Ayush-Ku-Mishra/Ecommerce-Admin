import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose, IoCloudUpload, IoChevronDown } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import  toast from "react-hot-toast";

const AddHomeBanner = () => {
  const inputRef = useRef();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedThirdCategory, setSelectedThirdCategory] = useState("");
  const [price, setPrice] = useState(""); // NEW: price input value
  const [alignInfo, setAlignInfo] = useState(""); // NEW: align info dropdown

  const categories = [
    { id: 1, name: "Fashion" },
    { id: 2, name: "Electronics" },
    { id: 3, name: "Books" },
    { id: 4, name: "Home & Garden" },
    { id: 5, name: "Sports" },
  ];

  const subCategories = [
    { id: 1, name: "Women" },
    { id: 2, name: "Men" },
    { id: 3, name: "Girls" },
    { id: 4, name: "Mobiles" },
    { id: 5, name: "Laptops" },
  ];

  const thirdCategories = [
    { id: 1, name: "Saree" },
    { id: 2, name: "Tops" },
    { id: 3, name: "Jeans" },
    { id: 4, name: "Kurta" },
    { id: 5, name: "Apple" },
  ];

  const handleClose = () => navigate(-1);
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newImages = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const imgToRemove = prev.find((img) => img.id === id);
      if (imgToRemove?.url) URL.revokeObjectURL(imgToRemove.url);
      return prev.filter((img) => img.id !== id);
    });
  };

  // Validate independent fields
  const handlePublish = () => {
    const title = inputRef.current?.value.trim();
    if (!title) return toast.error("Please enter a banner title.");
    if (!images.length)
      return toast.error("Please upload at least one banner image.");
    if (!selectedCategory) return toast.error("Please select a category.");
    if (!selectedSubCategory)
      return toast.error("Please select a sub category.");
    if (!selectedThirdCategory)
      return toast.error("Please select a third level category.");
    if (!price) return toast.error("Please enter the price.");
    if (!alignInfo) return toast.error("Please select align info.");

    toast.success("Banner published successfully!");
    inputRef.current.value = "";
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedThirdCategory("");
    setPrice(""); // reset price field
    setAlignInfo(""); // reset align info field

    setTimeout(() => handleClose(), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-start justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-8xl mx-auto min-h-screen flex flex-col shadow-xl relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2 border-b bg-gray-100 shadow-md">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
            Add Home Banner List
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded hover:bg-gray-200"
          >
            <IoClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col gap-6 sm:gap-8">
          {/* Top Inputs Row */}
          <div className="flex flex-wrap gap-6">
            {/* Banner Title */}
            <div className="w-full sm:w-64 md:w-72">
              <label
                htmlFor="bannerTitle"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Banner Title
              </label>
              <input
                ref={inputRef}
                id="bannerTitle"
                type="text"
                className="border border-gray-300 rounded w-full px-3 py-2 outline-none focus:ring focus:ring-blue-100 text-sm sm:text-base"
                placeholder="Enter Banner Title"
              />
            </div>

            {/* Category */}
            <div className="w-full sm:w-64 md:w-72">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-gray-900"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Sub Category */}
            <div className="w-full sm:w-64 md:w-72">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Category
              </label>
              <div className="relative">
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-gray-900"
                >
                  <option value="">Select a sub category</option>
                  {subCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Third Level Category */}
            <div className="w-full sm:w-64 md:w-72">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Third Level Category
              </label>
              <div className="relative">
                <select
                  value={selectedThirdCategory}
                  onChange={(e) => setSelectedThirdCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-gray-900"
                >
                  <option value="">Select a third category</option>
                  {thirdCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Price Input */}
            <div className="w-full sm:w-64 md:w-72">
              <label
                htmlFor="bannerPrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Price
              </label>
              <input
                id="bannerPrice"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                className="border border-gray-300 rounded w-full px-3 py-2 outline-none focus:ring focus:ring-blue-100 text-sm sm:text-base"
                placeholder="Enter Price"
              />
            </div>

            {/* Align Info Dropdown */}
            <div className="w-full sm:w-64 md:w-72">
              <label
                htmlFor="alignInfo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Align Info
              </label>
              <div className="relative">
                <select
                  id="alignInfo"
                  value={alignInfo}
                  onChange={(e) => setAlignInfo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-gray-900"
                >
                  <option value="">Select alignment</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
                <IoChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Images
            </label>
            <div className="flex flex-wrap gap-4 mb-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-lg overflow-hidden border border-dashed border-gray-300 shadow-sm"
                >
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute top-0 right-0 bg-red-700 rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <IoClose className="text-white w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-dashed border-2 border-gray-300 bg-gray-100 rounded w-28 h-28 sm:w-40 sm:h-32 flex flex-col items-center justify-center cursor-pointer relative hover:bg-gray-200">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0"
              />
              <MdOutlineImage className="text-gray-400 text-3xl mb-2" />
              <span className="text-gray-500 text-xs">Upload Images</span>
            </div>
          </div>

          {/* Publish */}
          <button
            onClick={handlePublish}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition w-full sm:w-2/3 md:w-2/5 flex items-center justify-center gap-2"
          >
            <IoCloudUpload className="w-5 h-5" />
            <span className="text-sm sm:text-base">PUBLISH AND VIEW</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddHomeBanner;
