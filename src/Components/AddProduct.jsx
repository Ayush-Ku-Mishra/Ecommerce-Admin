import React, { useEffect, useState } from "react";
import {
  IoClose,
  IoStar,
  IoStarOutline,
  IoCloudUpload,
  IoImageOutline,
} from "react-icons/io5";
import { FaRegImages } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddProduct = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    thirdLevelCategory: "",
    price: "",
    oldPrice: "",
    isFeatured: false,
    stock: "",
    brand: "",
    discount: "",
    weight: "",
    size: "",
    rating: 1,
    mainImage: null,
    bannerTitle: "",
    bannerEnabled: true,
  });

  const [rating, setRating] = useState(1);
  const [images, setImages] = useState([]);
  const [bannerImages, setBannerImages] = useState([]);

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup main images
      images.forEach((img) => {
        if (img.url) {
          URL.revokeObjectURL(img.url);
        }
      });
      // Cleanup banner images
      bannerImages.forEach((img) => {
        if (img.url) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    const newImages = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(), // More unique ID
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Reset input to enable re-uploading the same files
    event.target.value = "";
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove && imageToRemove.url) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleBannerImageUpload = (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    const newBannerImages = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(), // More unique ID
      file,
      url: URL.createObjectURL(file),
    }));

    setBannerImages((prev) => [...prev, ...newBannerImages]);

    // Reset input to enable re-uploading the same files
    event.target.value = "";
  };

  const handleRemoveBannerImage = (id) => {
    setBannerImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove && imageToRemove.url) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleSubmitFinal = () => {
    // Basic validation for essential form fields
    if (!formData.name.trim()) {
      toast.error("Please enter the product name.");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description for the product.");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a product category.");
      return;
    }
    if (!formData.subCategory) {
      toast.error("Please select a product sub category.");
      return;
    }
    if (!formData.thirdLevelCategory) {
      toast.error("Please select a product third level category.");
      return;
    }
    if (
      !formData.price ||
      isNaN(formData.price) ||
      Number(formData.price) <= 0
    ) {
      toast.error("Please enter a valid product price.");
      return;
    }
    if (
      !formData.oldPrice ||
      isNaN(formData.oldPrice) ||
      Number(formData.oldPrice) <= 0
    ) {
      toast.error("Please enter a valid product old Price.");
      return;
    }
    if (
      !formData.stock ||
      isNaN(formData.stock) ||
      Number(formData.stock) < 0
    ) {
      toast.error("Please enter a valid stock number.");
      return;
    }
    if (!formData.brand.trim()) {
      toast.error("Please enter the product brand.");
      return;
    }

    // Validate Product Discount
    const discountValue = Number(formData.discount);
    if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
      toast.error("Please enter a valid discount between 0 and 100.");
      return;
    }

    // Validate Product Rating
    if (rating < 1 || rating > 5) {
      toast.error("Please provide a rating between 1 and 5 stars.");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least one product image.");
      return;
    }

    // If banner is enabled, check banner images and title
    if (formData.bannerEnabled) {
      if (bannerImages.length === 0) {
        toast.error("Please upload at least one banner image.");
        return;
      }
      if (!formData.bannerTitle.trim()) {
        toast.error("Please enter the banner title.");
        return;
      }
    }

    // If all validations pass, prepare final form data
    const finalFormData = {
      ...formData,
      rating,
      mainImages: images.map((img) => img.file),
      bannerImages: bannerImages.map((img) => img.file),
    };

    console.log("✅ Product data ready to submit:", finalFormData);

    toast.success("Product published successfully!");

    // ✅ Reset all states back to initial
    setFormData({
      name: "",
      description: "",
      category: "",
      subCategory: "",
      thirdLevelCategory: "",
      price: "",
      oldPrice: "",
      isFeatured: false,
      stock: "",
      brand: "",
      discount: "",
      weight: "",
      size: "",
      rating: 1,
      mainImage: null,
      bannerTitle: "",
      bannerEnabled: true,
    });
    setImages([]);
    setBannerImages([]);
    setRating(1);

    // Close the modal after reset
    onClose();
  };

  const StarRating = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= rating ? (
            <IoStar
              key={star}
              className="w-6 h-6 cursor-pointer transition-colors text-yellow-400"
              onClick={() => setRating(star)}
            />
          ) : (
            <IoStarOutline
              key={star}
              className="w-6 h-6 cursor-pointer transition-colors text-gray-300 hover:text-yellow-400"
              onClick={() => setRating(star)}
            />
          )
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50 overflow-hidden" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-1 border-b border-gray-200 bg-gray-200 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Add Product</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 py-4 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-8">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter product name"
                />
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter product description"
                />
              </div>

              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select Category</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="books">Books</option>
                    <option value="home">Home & Garden</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Sub Category
                  </label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select Sub Category</option>
                    <option value="smartphones">Smartphones</option>
                    <option value="laptops">Laptops</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Third Level Category
                  </label>
                  <select
                    name="thirdLevelCategory"
                    value={formData.thirdLevelCategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select Third Level</option>
                    <option value="premium">Premium</option>
                    <option value="standard">Standard</option>
                    <option value="budget">Budget</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Old Price
                  </label>
                  <input
                    type="number"
                    name="oldPrice"
                    value={formData.oldPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is Featured?
                  </label>
                  <select
                    name="isFeatured"
                    value={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter brand name"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Discount
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Weight
                  </label>
                  <select
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select Weight</option>
                    <option value="light">2KG</option>
                    <option value="medium">3KG</option>
                    <option value="heavy">6KG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Size
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select Size</option>
                    <option value="xs">XS</option>
                    <option value="s">S</option>
                    <option value="m">M</option>
                    <option value="l">L</option>
                    <option value="xl">XL</option>
                    <option value="xxl">XXL</option>
                  </select>
                </div>
              </div>

              {/* Product Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Rating
                </label>
                <StarRating />
              </div>

              {/* Media & Images Section */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Media & Images
                </h2>

                {/* Main Product Image */}
                <div className="mb-8">
                  <div className="flex flex-wrap gap-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="relative w-36 h-36 rounded-lg overflow-hidden shadow-md"
                      >
                        <img
                          src={image.url}
                          alt="Uploaded preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleRemoveImage(image.id)}
                          className="absolute top-0 right-0 bg-red-700 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 transition"
                          title="Remove image"
                          type="button"
                        >
                          <IoClose className="text-white w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Always show one upload input */}
                    <div className="relative w-36 h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        multiple
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <span className="text-gray-400 text-3xl mb-2 select-none">
                        <FaRegImages />
                      </span>
                      <span className="text-sm text-gray-500 select-none">
                        Upload Image
                      </span>
                    </div>
                  </div>
                </div>

                {/* Banner Images Section */}
                <div className="mb-6 bg-gray-100 p-3">
                  <div className="flex items-center gap-3 mb-4">
                    <label className="block text-xl font-bold text-gray-800">
                      Banner Images
                    </label>
                  </div>

                  {formData.bannerEnabled && (
                    <>
                      {/* Images container with flex wrap for horizontal and next line */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {bannerImages.map((image) => (
                          <div
                            key={image.id}
                            className="relative w-36 h-36 rounded-lg overflow-hidden shadow-md"
                          >
                            <img
                              src={image.url}
                              alt="Banner preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              className="absolute top-0 right-0 bg-red-700 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 transition"
                              onClick={() => handleRemoveBannerImage(image.id)}
                              title="Remove image"
                            >
                              <IoClose className="text-white w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {/* Always show one upload input for adding more images */}
                        <div className="relative w-36 h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerImageUpload}
                            multiple
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <IoImageOutline className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">
                            Image Upload
                          </span>
                        </div>
                      </div>

                      {/* Banner Title Input */}
                      <div>
                        <label className="block text-xl font-bold text-gray-800 mb-2">
                          Banner Title
                        </label>
                        <input
                          type="text"
                          name="bannerTitle"
                          value={formData.bannerTitle}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter banner title"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 pb-6">
                <button
                  onClick={handleSubmitFinal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <IoCloudUpload className="w-5 h-5" />
                  PUBLISH AND VIEW
                </button>
              </div>
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
    </>
  );
};

export default AddProduct;
