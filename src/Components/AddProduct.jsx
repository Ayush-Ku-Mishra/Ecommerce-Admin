import React, { useEffect, useState } from "react";
import { IoClose, IoStar, IoStarOutline, IoCloudUpload } from "react-icons/io5";
import { FaRegImages } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress, Backdrop } from "@mui/material";

const AddProduct = ({ isOpen, onClose, onProductAdded, editProductId }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    thirdLevelCategory: "",
    fourthLevelCategory: "",
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
  });

  const [rating, setRating] = useState(1);
  const [images, setImages] = useState([]);
  const [details, setDetails] = useState([
    { label: "", value: "" },
    { label: "", value: "" },
  ]);

  // Sizes states
  const [dressSizes, setDressSizes] = useState([
    { size: "XS", stock: "" },
    { size: "S", stock: "" },
    { size: "M", stock: "" },
    { size: "L", stock: "" },
    { size: "XL", stock: "" },
  ]);

  const [shoesSizes, setShoesSizes] = useState([
    { size: "6", stock: "" },
    { size: "7", stock: "" },
    { size: "8", stock: "" },
    { size: "9", stock: "" },
    { size: "10", stock: "" },
  ]);

  const [freeSize, setFreeSize] = useState("no");

  // Category states
  const [categories, setCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [allThirdLevelCategories, setAllThirdLevelCategories] = useState([]);
  const [allFourthLevelCategories, setAllFourthLevelCategories] = useState([]);
  const [sizeCharts, setSizeCharts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [uploadingImages, setUploadingImages] = useState({});
  const [removingImages, setRemovingImages] = useState({});
  const [selectedChartId, setSelectedChartId] = useState(null);

  const formatPrice = (value) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + "." + parts[1].substring(0, 2);
    }

    return cleanValue;
  };

  const navigate = useNavigate();
  const isEditMode = !!editProductId;

  // Reset form when modal opens/closes or edit mode changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        fetchProductForEdit();
      } else {
        resetForm();
      }
    }
  }, [isOpen, editProductId]);

  // Fetch categories and size charts on mount
  useEffect(() => {
    fetchCategories();
    fetchSizeCharts();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      subCategory: "",
      thirdLevelCategory: "",
      fourthLevelCategory: "",
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
    });
    setImages([]);
    setRating(1);
    setDetails([
      { label: "", value: "" },
      { label: "", value: "" },
    ]);
    setDressSizes([
      { size: "XS", stock: "" },
      { size: "S", stock: "" },
      { size: "M", stock: "" },
      { size: "L", stock: "" },
      { size: "XL", stock: "" },
    ]);
    setShoesSizes([
      { size: "6", stock: "" },
      { size: "7", stock: "" },
      { size: "8", stock: "" },
      { size: "9", stock: "" },
      { size: "10", stock: "" },
    ]);
    setFreeSize("no");
    setSelectedChartId(null);
  };

  const fetchProductForEdit = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/product/getProduct/${editProductId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        const product = response.data.product;

        // Populate form data
        setFormData({
          name: product.name || "",
          description: product.description || "",
          category: product.categoryId || "",
          subCategory: product.subCatId || "",
          thirdLevelCategory: product.thirdSubCatId || "",
          fourthLevelCategory: product.fourthSubCatId || "",
          price: product.price || "",
          oldPrice: product.oldPrice || "",
          isFeatured: product.isFeatured || false,
          stock: product.stock || "",
          brand: product.brand || "",
          discount: product.discount || "",
          weight: product.weight?.[0] || "",
          size: "",
          rating: product.rating || 1,
          mainImage: null,
        });

        setRating(product.rating || 1);

        // Handle product details
        if (
          product.productDetails &&
          typeof product.productDetails === "object"
        ) {
          const detailsArray = Object.entries(product.productDetails).map(
            ([key, value]) => ({
              label: key,
              value: value,
            })
          );
          setDetails(
            detailsArray.length > 0
              ? detailsArray
              : [
                  { label: "", value: "" },
                  { label: "", value: "" },
                ]
          );
        }

        // Handle images
        if (product.images?.length) {
          const imageArray = product.images.map((url, index) => ({
            id: Date.now() + index,
            localUrl: url,
            cloudinaryUrl: url,
            uploading: false,
          }));
          setImages(imageArray);
        }

        // Handle sizes
        if (product.dressSizes?.length) {
          setDressSizes(
            product.dressSizes.map((size) => ({
              size: typeof size === "object" ? size.size : size,
              stock: typeof size === "object" ? size.stock : "",
            }))
          );
        }

        if (product.shoesSizes?.length) {
          setShoesSizes(
            product.shoesSizes.map((size) => ({
              size: typeof size === "object" ? size.size : size,
              stock: typeof size === "object" ? size.stock : "",
            }))
          );
        }

        setFreeSize(product.freeSize || "no");
        setSelectedChartId(product.sizeChartId || null);
      } else {
        toast.error("Failed to fetch product details for editing");
      }
    } catch (error) {
      console.error("Error fetching product for edit:", error);
      toast.error("Failed to load product for editing");
    } finally {
      setLoading(false);
    }
  };

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

        // All categories with parentId (subcategories of any level)
        const subCats = allCategories.filter((cat) => cat.parentId);

        // Separate into levels based on parent relationships
        const secondLevelCategories = [];
        const thirdLevelCategories = [];

        // First, identify second level categories (direct children of main categories)
        subCats.forEach((cat) => {
          const parentIsMain = mainCategories.some(
            (mainCat) => mainCat._id === cat.parentId
          );
          if (parentIsMain) {
            secondLevelCategories.push(cat);
          }
        });

        // Then, identify third level categories (direct children of second level categories)
        subCats.forEach((cat) => {
          const parentIsSecondLevel = secondLevelCategories.some(
            (secondCat) => secondCat._id === cat.parentId
          );
          if (parentIsSecondLevel) {
            thirdLevelCategories.push(cat);
          }
        });

        // Finally, identify fourth level categories (direct children of third level categories)
        const fourthLevelCategories = [];
        subCats.forEach((cat) => {
          const parentIsThirdLevel = thirdLevelCategories.some(
            (thirdCat) => thirdCat._id === cat.parentId
          );
          if (parentIsThirdLevel) {
            fourthLevelCategories.push(cat);
          }
        });

        setAllSubCategories(secondLevelCategories);
        setAllThirdLevelCategories(thirdLevelCategories);
        setAllFourthLevelCategories(fourthLevelCategories);
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
    if (!formData.category) return [];
    return allSubCategories.filter(
      (subCat) =>
        subCat.parentId &&
        subCat.parentId.toString() === formData.category.toString()
    );
  };

  // Filter third level categories based on selected subcategory
  const getFilteredThirdLevelCategories = () => {
    if (!formData.subCategory) return [];
    return allThirdLevelCategories.filter(
      (thirdCat) =>
        thirdCat.parentId &&
        thirdCat.parentId.toString() === formData.subCategory.toString()
    );
  };

  const getFilteredFourthLevelCategories = () => {
    if (!formData.thirdLevelCategory) return [];
    return allFourthLevelCategories.filter(
      (fourthCat) =>
        fourthCat.parentId &&
        fourthCat.parentId.toString() === formData.thirdLevelCategory.toString()
    );
  };

  // Reset dependent selections when parent category changes
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value,
        subCategory: "", // Reset subcategory
        thirdLevelCategory: "", // Reset third level category
      }));
    } else if (name === "subCategory") {
      setFormData((prev) => ({
        ...prev,
        subCategory: value,
        thirdLevelCategory: "", // Reset third level category
        fourthLevelCategory: "", // Reset fourth level category
      }));
    } else if (name === "thirdLevelCategory") {
      setFormData((prev) => ({
        ...prev,
        thirdLevelCategory: value,
        fourthLevelCategory: "", // Reset fourth level category
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const fetchSizeCharts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/sizecharts/all`,
        { withCredentials: true }
      );
      if (Array.isArray(response.data)) {
        setSizeCharts(response.data);
      }
    } catch (error) {
      console.error("Error fetching size charts:", error);
      toast.error("Failed to fetch size charts");
    }
  };

  const uploadSingleImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("images", file);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/product/upload-images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (
        response.data.success &&
        response.data.images &&
        response.data.images.length > 0
      ) {
        return response.data.images[0];
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // Remove image from Cloudinary via backend
  const removeImageFromCloudinary = async (imageUrl) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/product/deleteImage`,
        {
          params: { img: imageUrl },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        return true;
      } else {
        throw new Error("Failed to remove image from Cloudinary");
      }
    } catch (error) {
      console.error("Error removing image from Cloudinary:", error);
      throw error;
    }
  };

  const createProduct = async (productData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/product/create`,
        productData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/product/update/${productId}`,
        productData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.localUrl && img.localUrl.startsWith("blob:")) {
          URL.revokeObjectURL(img.localUrl);
        }
      });
    };
  }, [images]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "price" || name === "oldPrice") {
      const formattedValue = formatPrice(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleDetailsChange = (index, key, val) => {
    setDetails((details) => {
      const updated = [...details];
      updated[index][key] = val;
      return updated;
    });
  };

  const handleAddDetails = () => {
    setDetails((details) => [...details, { label: "", value: "" }]);
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (files.length === 0) return;
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const tempId = Date.now() + Math.random();
      const localUrl = URL.createObjectURL(file);

      // Add image to local state with uploading true
      const tempImage = {
        id: tempId,
        localUrl,
        cloudinaryUrl: null,
        uploading: true,
        file,
      };
      setImages((prev) => [...prev, tempImage]);
      setUploadingImages((prev) => ({ ...prev, [tempId]: true }));

      try {
        const cloudinaryUrl = await uploadSingleImage(file);
        setImages((prev) =>
          prev.map((img) =>
            img.id === tempId
              ? { ...img, cloudinaryUrl, uploading: false }
              : img
          )
        );
        setUploadingImages((prev) => {
          const updated = { ...prev };
          delete updated[tempId];
          return updated;
        });
        toast.success("Image uploaded successfully!");
      } catch (error) {
        setImages((prev) => prev.filter((img) => img.id !== tempId));
        setUploadingImages((prev) => {
          const updated = { ...prev };
          delete updated[tempId];
          return updated;
        });
        URL.revokeObjectURL(localUrl);
        toast.error("Failed to upload image. Please try again.");
      }
    }

    // Reset input value to allow re-uploading same files
    event.target.value = "";
  };

  // Handle individual image removal with Cloudinary and local cleanup
  const handleRemoveImage = async (id) => {
    const imageToRemove = images.find((img) => img.id === id);
    if (!imageToRemove) return;

    if (imageToRemove.uploading) {
      toast.error(
        "Please wait for the image to finish uploading before removing it."
      );
      return;
    }

    setRemovingImages((prev) => ({ ...prev, [id]: true }));
    try {
      if (imageToRemove.cloudinaryUrl && !isEditMode) {
        await removeImageFromCloudinary(imageToRemove.cloudinaryUrl);
      }

      setImages((prev) => {
        const filtered = prev.filter((img) => img.id !== id);
        if (
          imageToRemove.localUrl &&
          imageToRemove.localUrl.startsWith("blob:")
        ) {
          URL.revokeObjectURL(imageToRemove.localUrl);
        }
        return filtered;
      });

      toast.success("Image removed successfully!");
    } catch (error) {
      toast.error("Failed to remove image. Please try again.");
    } finally {
      setRemovingImages((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  // Dress size handlers
  const handleDressSizeChange = (index, key, value) => {
    setDressSizes((prev) => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };

  const handleAddDressSize = (position = "bottom") => {
    if (position === "top") {
      setDressSizes((prev) => [{ size: "", stock: "" }, ...prev]);
    } else {
      setDressSizes((prev) => [...prev, { size: "", stock: "" }]);
    }
  };

  const handleRemoveDressSize = (index) => {
    setDressSizes((prev) => prev.filter((_, i) => i !== index));
  };

  // Shoes size handlers
  const handleShoesSizeChange = (index, key, value) => {
    setShoesSizes((prev) => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };

  const handleAddShoesSize = (position = "bottom") => {
    if (position === "top") {
      setShoesSizes((prev) => [{ size: "", stock: "" }, ...prev]);
    } else {
      setShoesSizes((prev) => [...prev, { size: "", stock: "" }]);
    }
  };

  const handleRemoveShoesSize = (index) => {
    setShoesSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitFinal = async () => {
    // Basic validation for essential form fields
    if (!formData.name.trim()) {
      toast.error("Please enter the product name.");
      return;
    }
    if (
      details.every((detail) => !detail.label.trim() && !detail.value.trim())
    ) {
      toast.error("Please enter at least one product detail.");
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

    // Check if any images are still uploading
    if (Object.keys(uploadingImages).length > 0) {
      toast.error("Please wait for all images to finish uploading.");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one product image.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Get uploaded image URLs (already uploaded to Cloudinary)
      const uploadedImageUrls = images
        .map((img) => img.cloudinaryUrl)
        .filter(Boolean);

      if (uploadedImageUrls.length === 0) {
        toast.error("No valid images found. Please upload at least one image.");
        setLoading(false);
        return;
      }

      // Step 2: Find selected category, subcategory, third level, and fourth level category details
      const selectedCategory = categories.find(
        (cat) => cat._id === formData.category
      );
      const selectedSubCategory = getFilteredSubCategories().find(
        (subCat) => subCat._id === formData.subCategory
      );
      const selectedThirdCategory = getFilteredThirdLevelCategories().find(
        (thirdCat) => thirdCat._id === formData.thirdLevelCategory
      );
      const selectedFourthCategory = getFilteredFourthLevelCategories().find(
        (fourthCat) => fourthCat._id === formData.fourthLevelCategory
      );

      // Step 3: Prepare product details object
      const productDetails = {};
      details.forEach((detail) => {
        if (detail.label.trim() && detail.value.trim()) {
          productDetails[detail.label.trim()] = detail.value.trim();
        }
      });

      // Step 4: Prepare final product data
      const productData = {
        name: formData.name.trim(),
        productDetails: productDetails,
        images: uploadedImageUrls,
        brand: formData.brand.trim(),
        price: parseFloat(parseFloat(formData.price).toFixed(2)),
        oldPrice: parseFloat(parseFloat(formData.oldPrice).toFixed(2)),
        categoryName: selectedCategory?.name || "",
        categoryId: formData.category,
        subCatId: formData.subCategory,
        subCatName: selectedSubCategory?.name || "",
        thirdSubCatId: formData.thirdLevelCategory,
        thirdSubCatName: selectedThirdCategory?.name || "",
        fourthSubCatId: formData.fourthLevelCategory,
        fourthSubCatName: selectedFourthCategory?.name || "",
        stock: Number(formData.stock),
        rating: rating,
        isFeatured: formData.isFeatured,
        discount: discountValue,
        dressSizes: dressSizes.filter((size) => size.size.trim() && size.stock),
        shoesSizes: shoesSizes.filter((size) => size.size.trim() && size.stock),
        freeSize: freeSize,
        weight: formData.weight ? [formData.weight] : [],
        color: "default",
        sizeChartId:
          selectedChartId && selectedChartId.trim() !== ""
            ? selectedChartId
            : null,
      };

      // Step 5: Create or update product
      let response;
      if (isEditMode) {
        response = await updateProduct(editProductId, productData);
        if (response.success) {
          toast.success("Product updated successfully!");
        }
      } else {
        response = await createProduct(productData);
        if (response.success) {
          toast.success("Product created successfully!");
        }
      }

      if (response.success) {
        // Reset form
        resetForm();

        if (onProductAdded) {
          onProductAdded();
        }

        // Close the modal after reset
        onClose();
      } else {
        toast.error(
          response.message ||
            `Failed to ${isEditMode ? "update" : "create"} product`
        );
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} product:`,
        error
      );
      toast.error(
        `Failed to ${
          isEditMode ? "update" : "create"
        } product. Please try again.`
      );
    } finally {
      setLoading(false);
    }
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
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <div className="text-center">
          <CircularProgress color="inherit" />
          <p className="mt-2">
            {isEditMode ? "Updating product..." : "Creating product..."}
          </p>
        </div>
      </Backdrop>

      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50 overflow-hidden" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Product" : "Add Product"}
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <IoClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 py-4">
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
                  disabled={loading}
                />
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Details
                </label>
                {details.map((row, idx) => (
                  <div key={idx} className="flex gap-4 mb-3">
                    <input
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg"
                      type="text"
                      placeholder="Label"
                      value={row.label}
                      onChange={(e) =>
                        handleDetailsChange(idx, "label", e.target.value)
                      }
                      disabled={loading}
                    />
                    <input
                      className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg"
                      type="text"
                      placeholder="Value"
                      value={row.value}
                      onChange={(e) =>
                        handleDetailsChange(idx, "value", e.target.value)
                      }
                      disabled={loading}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
                  onClick={handleAddDetails}
                  disabled={loading}
                >
                  Add more details
                </button>
              </div>

              {/* Row 1 - Updated with proper category filtering */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    disabled={loading}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Sub Category
                  </label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    disabled={loading || !formData.category}
                  >
                    <option value="">Select Sub Category</option>
                    {getFilteredSubCategories().map((subCategory) => (
                      <option key={subCategory._id} value={subCategory._id}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Third Level Category
                  </label>
                  <select
                    name="thirdLevelCategory"
                    value={formData.thirdLevelCategory}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    disabled={loading || !formData.subCategory}
                  >
                    <option value="">Select Third Level</option>
                    {getFilteredThirdLevelCategories().map((thirdCategory) => (
                      <option key={thirdCategory._id} value={thirdCategory._id}>
                        {thirdCategory.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Fourth Level Category
                  </label>
                  <select
                    name="fourthLevelCategory"
                    value={formData.fourthLevelCategory}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    disabled={loading || !formData.thirdLevelCategory}
                  >
                    <option value="">Select Fourth Level</option>
                    {getFilteredFourthLevelCategories().map(
                      (fourthCategory) => (
                        <option
                          key={fourthCategory._id}
                          value={fourthCategory._id}
                        >
                          {fourthCategory.name}
                        </option>
                      )
                    )}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Discount (%)
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
                    disabled={loading}
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
                    disabled={loading}
                  >
                    <option value="">Select Weight</option>
                    <option value="2KG">2KG</option>
                    <option value="3KG">3KG</option>
                    <option value="6KG">6KG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Rating
                  </label>
                  <StarRating />
                </div>
              </div>

              {/* Size Sections - Three separate sections */}
              <div className="space-y-8">
                <h2 className="text-xl font-bold text-gray-800">
                  Product Sizes
                </h2>

                {/* 1. Dress Sizes Section */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Dress Sizes & Stock
                  </h3>

                  {/* Add more button at top */}
                  <div className="mb-3">
                    <button
                      type="button"
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition disabled:opacity-50"
                      onClick={() => handleAddDressSize("top")}
                      disabled={loading}
                    >
                      Add More Size
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dressSizes.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input
                          type="text"
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Size (e.g. S)"
                          value={row.size}
                          onChange={(e) =>
                            handleDressSizeChange(idx, "size", e.target.value)
                          }
                          disabled={loading}
                        />
                        <input
                          type="number"
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Stock"
                          min="0"
                          value={row.stock}
                          onChange={(e) =>
                            handleDressSizeChange(idx, "stock", e.target.value)
                          }
                          disabled={loading}
                        />
                        {dressSizes.length > 1 && (
                          <button
                            type="button"
                            className="px-2 py-2 bg-red-400 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                            onClick={() => handleRemoveDressSize(idx)}
                            title="Remove row"
                            disabled={loading}
                          >
                            <IoClose className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add more button at bottom */}
                  <div className="mt-3">
                    <button
                      type="button"
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
                      onClick={() => handleAddDressSize("bottom")}
                      disabled={loading}
                    >
                      Add More Size
                    </button>
                  </div>
                </div>

                {/* 2. Shoes Sizes Section */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Shoes Sizes & Stock
                  </h3>

                  {/* Add more button at top */}
                  <div className="mb-3">
                    <button
                      type="button"
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition disabled:opacity-50"
                      onClick={() => handleAddShoesSize("top")}
                      disabled={loading}
                    >
                      Add More Size
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {shoesSizes.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input
                          type="text"
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Size (e.g. 8)"
                          value={row.size}
                          onChange={(e) =>
                            handleShoesSizeChange(idx, "size", e.target.value)
                          }
                          disabled={loading}
                        />
                        <input
                          type="number"
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Stock"
                          min="0"
                          value={row.stock}
                          onChange={(e) =>
                            handleShoesSizeChange(idx, "stock", e.target.value)
                          }
                          disabled={loading}
                        />
                        {shoesSizes.length > 1 && (
                          <button
                            type="button"
                            className="px-2 py-2 bg-red-400 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                            onClick={() => handleRemoveShoesSize(idx)}
                            title="Remove row"
                            disabled={loading}
                          >
                            <IoClose className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add more button at bottom */}
                  <div className="mt-3">
                    <button
                      type="button"
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-50"
                      onClick={() => handleAddShoesSize("bottom")}
                      disabled={loading}
                    >
                      Add More Size
                    </button>
                  </div>
                </div>

                {/* 3. Free Size Section */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Free Size
                  </h3>
                  <div className="flex items-center gap-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Is this product free size?
                    </label>
                    <select
                      value={freeSize}
                      onChange={(e) => setFreeSize(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      disabled={loading}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Size Chart Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size Chart
                </label>
                <div className="flex items-center gap-4">
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    value={selectedChartId || ""}
                    onChange={(e) => setSelectedChartId(e.target.value || null)}
                    disabled={loading}
                  >
                    <option value="">Select a Size Chart</option>
                    {sizeCharts.map((chart) => (
                      <option key={chart._id} value={chart._id}>
                        {chart.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 whitespace-nowrap disabled:opacity-50"
                    onClick={() => navigate("/add-product-Sizechart")}
                    disabled={loading}
                  >
                    + Add Size Chart
                  </button>
                </div>
              </div>

              {/* Media & Images Section */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Media & Images
                </h2>
                <div className="mb-8">
                  <div className="flex flex-wrap gap-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="relative w-36 h-36 rounded-lg overflow-hidden shadow-md"
                      >
                        {/* Overlay spinner when uploading */}
                        {image.uploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                            <CircularProgress
                              size={24}
                              className="text-white"
                            />
                          </div>
                        )}
                        {/* Overlay spinner when removing */}
                        {removingImages[image.id] && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                            <CircularProgress
                              size={24}
                              className="text-white"
                            />
                          </div>
                        )}
                        <img
                          src={image.cloudinaryUrl || image.localUrl}
                          alt="Uploaded preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {!image.uploading && !removingImages[image.id] && (
                          <button
                            onClick={() => handleRemoveImage(image.id)}
                            className="absolute top-1 right-1 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                            title="Remove image"
                            type="button"
                          >
                            <IoClose className="text-white w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {/* Upload Input */}
                    <div className="relative w-36 h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        multiple
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={loading}
                      />
                      <FaRegImages className="text-gray-400 text-3xl mb-2 select-none" />
                      <span className="text-sm text-gray-500 select-none text-center">
                        Upload Images
                      </span>
                    </div>
                  </div>
                  {/* Uploading images count message */}
                  {Object.keys(uploadingImages).length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Uploading {Object.keys(uploadingImages).length}{" "}
                        image(s)...
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 pb-6">
                <button
                  onClick={handleSubmitFinal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={loading || Object.keys(uploadingImages).length > 0}
                >
                  <IoCloudUpload className="w-5 h-5" />
                  {loading
                    ? `${isEditMode ? "Updating" : "Creating"} Product...`
                    : `${isEditMode ? "UPDATE" : "PUBLISH"} AND VIEW`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
