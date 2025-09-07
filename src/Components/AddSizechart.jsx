import React, { useState, useEffect } from "react";
import {
  IoChevronUp,
  IoChevronDown,
  IoAdd,
  IoTrash,
  IoSave,
  IoCloudUpload,
  IoCreateOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { Backdrop, CircularProgress } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";

const AddSizechart = () => {
  const [formData, setFormData] = useState({
    name: "",
    unit: "inch",
    howToMeasureDescription: "",
    sizes: [
      {
        sizeLabel: "S",
        shoulder: "",
        length: "",
        chest: "",
        waist: "",
        hip: "",
        sleeve: "",
        neck: "",
        thigh: "",
      },
      {
        sizeLabel: "M",
        shoulder: "",
        length: "",
        chest: "",
        waist: "",
        hip: "",
        sleeve: "",
        neck: "",
        thigh: "",
      },
      {
        sizeLabel: "L",
        shoulder: "",
        length: "",
        chest: "",
        waist: "",
        hip: "",
        sleeve: "",
        neck: "",
        thigh: "",
      },
      {
        sizeLabel: "XL",
        shoulder: "",
        length: "",
        chest: "",
        waist: "",
        hip: "",
        sleeve: "",
        neck: "",
        thigh: "",
      },
    ],
  });

  const [savedCharts, setSavedCharts] = useState([]);
  const [expandedCharts, setExpandedCharts] = useState({});
  const [chartViewUnit, setChartViewUnit] = useState({});
  const [editingChart, setEditingChart] = useState(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageLoading, setImageLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});

  // Fetch saved charts from backend on component mount
  useEffect(() => {
    fetchSizeCharts();
  }, []);

  const fetchSizeCharts = async () => {
    setFetchLoading(true);
    try {
      const res = await fetch("/api/v1/sizecharts/all", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load size charts");
      const data = await res.json();
      setSavedCharts(data);
    } catch (err) {
      console.error(err);
      toast.error("Error loading size charts");
    } finally {
      setFetchLoading(false);
    }
  };

  const measurementFields = [
    { key: "shoulder", label: "Shoulder" },
    { key: "length", label: "Length" },
    { key: "chest", label: "Chest" },
    { key: "waist", label: "Waist" },
    { key: "hip", label: "Hip" },
    { key: "sleeve", label: "Sleeve" },
    { key: "neck", label: "Neck" },
    { key: "thigh", label: "Thigh" },
  ];

  // Convert inch to cm and vice versa
  const convertUnit = (value, fromUnit, toUnit) => {
    if (!value || isNaN(value)) return "";
    const numValue = parseFloat(value);
    if (fromUnit === "inch" && toUnit === "cm") {
      return (numValue * 2.54).toFixed(1);
    } else if (fromUnit === "cm" && toUnit === "inch") {
      return (numValue / 2.54).toFixed(1);
    }
    return value;
  };

  // Get converted sizes for display
  const getConvertedSizes = (sizes, fromUnit, toUnit) => {
    if (!sizes || !Array.isArray(sizes)) return [];
    return sizes.map((size) => {
      const convertedSize = { ...size };
      const fields = [
        "shoulder",
        "length",
        "chest",
        "waist",
        "hip",
        "sleeve",
        "neck",
        "thigh",
      ];
      fields.forEach((field) => {
        if (convertedSize[field]) {
          convertedSize[field] = convertUnit(
            convertedSize[field],
            fromUnit,
            toUnit
          );
        }
      });
      return convertedSize;
    });
  };

  // Get only filled measurement fields for a chart
  const getFilledFields = (sizes) => {
    if (!sizes || !Array.isArray(sizes)) return [];
    const allFields = [
      "shoulder",
      "length",
      "chest",
      "waist",
      "hip",
      "sleeve",
      "neck",
      "thigh",
    ];
    const filledFields = [];
    allFields.forEach((field) => {
      const hasValue = sizes.some(
        (size) => size[field] && size[field].toString().trim() !== ""
      );
      if (hasValue) {
        const fieldInfo = measurementFields.find((f) => f.key === field);
        if (fieldInfo) {
          filledFields.push(fieldInfo);
        }
      }
    });
    return filledFields;
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const imageId = Date.now() + Math.random();
      
      setImageLoading(prev => ({ ...prev, [imageId]: true }));
      
      const tempImage = {
        id: imageId,
        url: URL.createObjectURL(file),
        name: file.name,
        uploading: true,
      };
      
      setUploadedImages(prev => [...prev, tempImage]);
      
      try {
        const formDataImage = new FormData();
        formDataImage.append("images", file);
        
        const res = await fetch("/api/v1/sizecharts/upload-images", {
          method: "POST",
          body: formDataImage,
        });
        
        const data = await res.json();
        
        if (res.ok && data.success && data.images.length > 0) {
          setUploadedImages(prev => 
            prev.map(img => 
              img.id === imageId 
                ? { 
                    id: imageId, 
                    url: data.images[0], 
                    name: file.name, 
                    uploading: false 
                  }
                : img
            )
          );
          toast.success("Image uploaded successfully");
        } else {
          throw new Error(data.message || "Image upload failed");
        }
      } catch (error) {
        console.error(error);
        toast.error("Image upload error: " + error.message);
        
        setUploadedImages(prev => prev.filter(img => img.id !== imageId));
        URL.revokeObjectURL(tempImage.url);
      } finally {
        setImageLoading(prev => {
          const newState = { ...prev };
          delete newState[imageId];
          return newState;
        });
      }
    }
    
    e.target.value = "";
  };

  // Remove image - fixed to handle 404 errors properly
  const removeImage = async (imageId, imageUrl) => {
    setImageLoading(prev => ({ ...prev, [imageId]: true }));
    
    try {
      // Only try to delete from Cloudinary if it's not a local blob URL
      if (imageUrl && !imageUrl.startsWith('blob:')) {
        try {
          const res = await fetch(`/api/v1/sizecharts/remove-image?img=${encodeURIComponent(imageUrl)}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
          
          // If we get a 404, the image might already be deleted from Cloudinary
          // We'll still remove it from our local state
          if (res.status === 404) {
            console.warn("Image not found in Cloudinary, removing from local state");
          } else if (!res.ok) {
            // For other errors, try to get the error message
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const errorData = await res.json();
              throw new Error(errorData.message || `Server error: ${res.status}`);
            } else {
              throw new Error(`Server error: ${res.status}`);
            }
          } else {
            // Success response
            const result = await res.json();
            if (!result.success) {
              throw new Error(result.message || "Failed to delete image");
            }
          }
        } catch (fetchError) {
          // If it's a network error or the image doesn't exist, we'll still remove it locally
          if (fetchError.message.includes('404') || fetchError.message.includes('not found')) {
            console.warn("Image not found in Cloudinary, removing from local state");
          } else {
            throw fetchError;
          }
        }
      }
      
      // Remove from local state regardless of Cloudinary result
      setUploadedImages(prev => {
        const imageToRemove = prev.find(img => img.id === imageId);
        if (imageToRemove && imageToRemove.url.startsWith('blob:')) {
          URL.revokeObjectURL(imageToRemove.url);
        }
        return prev.filter(img => img.id !== imageId);
      });
      
      toast.success("Image removed successfully");
      
    } catch (error) {
      console.error(error);
      toast.error("Error removing image: " + error.message);
    } finally {
      setImageLoading(prev => {
        const newState = { ...prev };
        delete newState[imageId];
        return newState;
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSizeChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((size, i) =>
        i === index ? { ...size, [field]: value } : size
      ),
    }));
  };

  const addSize = (position = "bottom") => {
    const newSize = {
      sizeLabel: "",
      shoulder: "",
      length: "",
      chest: "",
      waist: "",
      hip: "",
      sleeve: "",
      neck: "",
      thigh: "",
    };
    setFormData((prev) => ({
      ...prev,
      sizes:
        position === "top"
          ? [newSize, ...prev.sizes]
          : [...prev.sizes, newSize],
    }));
  };

  const removeSize = (index) => {
    if (formData.sizes.length > 1) {
      setFormData((prev) => ({
        ...prev,
        sizes: prev.sizes.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.info("Please enter a size chart name");
      return;
    }

    if (uploadedImages.length === 0) {
      toast.info("Please upload at least one image for the measurement guide");
      return;
    }

    const hasUploadingImages = uploadedImages.some(img => img.uploading);
    if (hasUploadingImages) {
      toast.info("Please wait for all images to finish uploading");
      return;
    }

    try {
      setPublishLoading(true);
      
      const uploadedImageUrls = uploadedImages.map(img => img.url);

      const payload = {
        ...formData,
        howToMeasureImageUrls: uploadedImageUrls,
      };

      const url = editingChart
        ? `/api/v1/sizecharts/update/${editingChart.id || editingChart._id}`
        : "/api/v1/sizecharts/create";

      const method = editingChart ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save size chart");
      }

      if (editingChart) {
        setSavedCharts((prev) =>
          prev.map((chart) => {
            if ((chart.id || chart._id) === (editingChart.id || editingChart._id)) {
              return {
                ...result.sizeChart,
                createdAt: new Date(result.sizeChart.createdAt).toLocaleDateString(),
                updatedAt: new Date(result.sizeChart.updatedAt).toLocaleDateString(),
                howToMeasureImages: result.sizeChart.howToMeasureImageUrls?.map((url, idx) => ({
                  id: `updated_${idx}_${Date.now()}`,
                  url: url,
                  name: `Image ${idx + 1}`,
                })) || []
              };
            }
            return chart;
          })
        );
        setEditingChart(null);
      } else {
        const formattedNewChart = {
          ...result.sizeChart,
          createdAt: new Date(result.sizeChart.createdAt).toLocaleDateString(),
          updatedAt: new Date(result.sizeChart.updatedAt).toLocaleDateString(),
          howToMeasureImages: result.sizeChart.howToMeasureImageUrls?.map((url, idx) => ({
            id: `new_${idx}_${Date.now()}`,
            url: url,
            name: `Image ${idx + 1}`,
          })) || []
        };
        
        setSavedCharts((prev) => [formattedNewChart, ...prev]);
      }

      // Reset form
      setFormData({
        name: "",
        unit: "inch",
        howToMeasureDescription: "",
        sizes: [
          {
            sizeLabel: "S",
            shoulder: "",
            length: "",
            chest: "",
            waist: "",
            hip: "",
            sleeve: "",
            neck: "",
            thigh: "",
          },
          {
            sizeLabel: "M",
            shoulder: "",
            length: "",
            chest: "",
            waist: "",
            hip: "",
            sleeve: "",
            neck: "",
            thigh: "",
          },
          {
            sizeLabel: "L",
            shoulder: "",
            length: "",
            chest: "",
            waist: "",
            hip: "",
            sleeve: "",
            neck: "",
            thigh: "",
          },
          {
            sizeLabel: "XL",
            shoulder: "",
            length: "",
            chest: "",
            waist: "",
            hip: "",
            sleeve: "",
            neck: "",
            thigh: "",
          },
        ],
      });
      setUploadedImages([]);
      
      toast.success(editingChart ? "Size chart updated successfully" : "Size chart created successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error saving size chart");
    } finally {
      setPublishLoading(false);
    }
  };

  const handleEdit = (chart) => {
    setFormData({
      name: chart.name || "",
      unit: chart.unit || "inch",
      howToMeasureDescription: chart.howToMeasureDescription || "",
      sizes: (chart.sizes || []).map(size => ({
        sizeLabel: size.sizeLabel || "",
        shoulder: size.shoulder || "",
        length: size.length || "",
        chest: size.chest || "",
        waist: size.waist || "",
        hip: size.hip || "",
        sleeve: size.sleeve || "",
        neck: size.neck || "",
        thigh: size.thigh || "",
      })),
    });
    
    const existingImages = (chart.howToMeasureImages || []).map((img, idx) => ({
      id: `existing_${idx}_${chart.id || chart._id}_${Date.now()}`, 
      url: img.url,
      name: img.name || `Image ${idx + 1}`,
      uploading: false,
    }));
    
    setUploadedImages(existingImages);
    setEditingChart({
      ...chart,
      id: chart.id || chart._id
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (chartId) => {
    if (window.confirm("Are you sure you want to delete this size chart?")) {
      try {
        setDeleteLoading(prev => ({ ...prev, [chartId]: true }));
        
        const res = await fetch(`/api/v1/sizecharts/delete/${chartId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        
        if (!res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Server error: ${res.status}`);
          } else {
            throw new Error(`Server error: ${res.status}`);
          }
        }
        
        setSavedCharts((prev) => prev.filter((chart) => (chart.id || chart._id) !== chartId));
        if (editingChart && (editingChart.id || editingChart._id) === chartId) {
          cancelEdit();
        }
        
        toast.success("Size chart deleted successfully");
      } catch (err) {
        console.error(err);
        toast.error("Error deleting size chart: " + err.message);
      } finally {
        setDeleteLoading(prev => {
          const newState = { ...prev };
          delete newState[chartId];
          return newState;
        });
      }
    }
  };

  const cancelEdit = () => {
    setEditingChart(null);
    setFormData({
      name: "",
      unit: "inch",
      howToMeasureDescription: "",
      sizes: [
        {
          sizeLabel: "S",
          shoulder: "",
          length: "",
          chest: "",
          waist: "",
          hip: "",
          sleeve: "",
          neck: "",
          thigh: "",
        },
        {
          sizeLabel: "M",
          shoulder: "",
          length: "",
          chest: "",
          waist: "",
          hip: "",
          sleeve: "",
          neck: "",
          thigh: "",
        },
        {
          sizeLabel: "L",
          shoulder: "",
          length: "",
          chest: "",
          waist: "",
          hip: "",
          sleeve: "",
          neck: "",
          thigh: "",
        },
        {
          sizeLabel: "XL",
          shoulder: "",
          length: "",
          chest: "",
          waist: "",
          hip: "",
          sleeve: "",
          neck: "",
          thigh: "",
        },
      ],
    });
    setUploadedImages([]);
  };

  const toggleChart = (chartId) => {
    setExpandedCharts((prev) => ({
      ...prev,
      [chartId]: !prev[chartId],
    }));
  };

  const toggleChartUnit = (chartId, currentUnit) => {
    const newUnit = currentUnit === "inch" ? "cm" : "inch";
    setChartViewUnit((prev) => ({
      ...prev,
      [chartId]: newUnit,
    }));
  };

  // Show full-page loading when fetching charts
  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <CircularProgress size={60} sx={{ color: '#3B82F6' }} />
          <p className="mt-6 text-xl font-medium text-gray-600">
            Loading size charts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {editingChart ? "Edit Size Chart" : "Create Size Chart"}
          </h1>
          {editingChart && (
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size Chart Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Men's T-Shirt Size Chart"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Unit
            </label>
            <select
              value={formData.unit}
              onChange={(e) => handleInputChange("unit", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="inch">Inch</option>
              <option value="cm">Centimeter</option>
            </select>
          </div>
        </div>

        {/* How to Measure Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            How to Measure
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How to Measure Images *
              </label>

              {/* File Upload */}
              <div className="mb-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <IoCloudUpload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span>{" "}
                      multiple images
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG (MAX. 5MB each)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* Image Preview Grid */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.url}
                        alt={image.name || "Upload image"}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      
                      {/* Loading overlay for individual image */}
                      {(image.uploading || imageLoading[image.id]) && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <CircularProgress size={20} sx={{ color: 'white' }} />
                        </div>
                      )}
                      
                      {/* Remove button */}
                      {!image.uploading && !imageLoading[image.id] && (
                        <button
                          onClick={() => removeImage(image.id, image.url)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          title="Remove image"
                          type="button"
                        >
                          ×
                        </button>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                        {image.uploading ? "Uploading..." : (image.name || "Image")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How to Measure Description
              </label>
              <textarea
                value={formData.howToMeasureDescription}
                onChange={(e) =>
                  handleInputChange("howToMeasureDescription", e.target.value)
                }
                placeholder="Instructions on how to measure..."
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Size Measurements */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Size Measurements ({formData.unit})
          </h3>

          <div className="space-y-4">
            {formData.sizes.map((size, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-3 items-center">
                  {/* Size Label */}
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <input
                      type="text"
                      value={size.sizeLabel || ""}
                      onChange={(e) =>
                        handleSizeChange(index, "sizeLabel", e.target.value)
                      }
                      placeholder="S/M/L"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-center font-semibold"
                    />
                  </div>

                  {/* Measurement Fields */}
                  {measurementFields.map(({ key, label }) => (
                    <div key={key} className="lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={size[key] || ""}
                        onChange={(e) =>
                          handleSizeChange(index, key, e.target.value)
                        }
                        placeholder="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </div>
                  ))}

                  {/* Remove Button */}
                  <div className="lg:col-span-1 flex justify-center">
                    {formData.sizes.length > 1 && (
                      <button
                        onClick={() => removeSize(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                      >
                        <IoTrash size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => addSize("top")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <IoAdd size={16} />
              Add Size at Top
            </button>

            <button
              onClick={() => addSize("bottom")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <IoAdd size={16} />
              Add Size at Bottom
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Preview</h3>

          {/* Primary Unit Table */}
          <div className="mb-4">
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              {formData.name || "Size Chart"} - {formData.unit}
            </h4>
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Size
                    </th>
                    {measurementFields.map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap"
                      >
                        {label} ({formData.unit})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.sizes.map((size, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                        {size.sizeLabel}
                      </td>
                      {measurementFields.map(({ key }) => (
                        <td
                          key={key}
                          className="px-3 py-2 text-sm text-gray-700"
                        >
                          {size[key] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Converted Unit Table */}
          <div className="mb-4">
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              {formData.name || "Size Chart"} -{" "}
              {formData.unit === "inch" ? "cm" : "inch"}
            </h4>
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Size
                    </th>
                    {measurementFields.map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap"
                      >
                        {label} ({formData.unit === "inch" ? "cm" : "inch"})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getConvertedSizes(
                    formData.sizes,
                    formData.unit,
                    formData.unit === "inch" ? "cm" : "inch"
                  ).map((size, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                        {size.sizeLabel}
                      </td>
                      {measurementFields.map(({ key }) => (
                        <td
                          key={key}
                          className="px-3 py-2 text-sm text-gray-700"
                        >
                          {size[key] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={publishLoading}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoSave size={16} />
            {publishLoading ? "Saving..." : editingChart ? "Update Size Chart" : "Publish Size Chart"}
          </button>
        </div>
      </div>

      {/* Saved Charts Section */}
      {savedCharts.length > 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Saved Size Charts
          </h2>

          {/* Mobile horizontal scroll container */}
          <div className="overflow-x-auto">
            <div className="min-w-full space-y-4">
              {savedCharts.map((chart) => {
                const isExpanded = expandedCharts[chart.id || chart._id];
                const viewUnit = chartViewUnit[chart.id || chart._id] || chart.unit;
                const displaySizes =
                  viewUnit === chart.unit
                    ? chart.sizes || []
                    : getConvertedSizes(chart.sizes || [], chart.unit, viewUnit);
                const filledFields = getFilledFields(chart.sizes || []);

                const measureImages = chart.howToMeasureImages || [];

                return (
                  <div
                    key={chart.id || chart._id}
                    className="border border-gray-200 rounded-lg overflow-hidden min-w-[320px]"
                  >
                    {/* Chart Header */}
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {chart.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          Created: {chart.createdAt}
                          {chart.updatedAt && (
                            <span className="ml-2">
                              • Updated: {chart.updatedAt}
                            </span>
                          )}
                        </span>
                        {editingChart && (editingChart.id === chart.id || editingChart.id === chart._id) && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Editing
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isExpanded && (
                          <button
                            onClick={() => toggleChartUnit(chart.id || chart._id, viewUnit)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                          >
                            Switch to {viewUnit === "inch" ? "cm" : "inch"}
                          </button>
                        )}

                        <button
                          onClick={() => handleEdit(chart)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Chart"
                        >
                          <IoCreateOutline size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(chart.id || chart._id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors relative"
                          title="Delete Chart"
                          disabled={deleteLoading[chart.id || chart._id]}
                        >
                          {deleteLoading[chart.id || chart._id] ? (
                            <CircularProgress size={18} sx={{ color: 'currentColor' }} />
                          ) : (
                            <IoTrashOutline size={18} />
                          )}
                        </button>

                        <button
                          onClick={() => toggleChart(chart.id || chart._id)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          {isExpanded ? (
                            <IoChevronUp size={20} />
                          ) : (
                            <IoChevronDown size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Chart Content */}
                    {isExpanded && (
                      <div className="p-4">
                        {/* How to Measure Info */}
                        {(measureImages.length > 0 || chart.howToMeasureDescription) && (
                          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-3">
                              How to Measure
                            </h4>

                            {/* Images */}
                            {measureImages.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                                {measureImages.map((image, idx) => (
                                  <div key={`chart_${chart.id || chart._id}_img_${idx}`} className="relative">
                                    <img
                                      src={image.url}
                                      alt={image.name || `Measurement guide ${idx + 1}`}
                                      className="w-full h-24 object-cover rounded border"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b truncate">
                                      {image.name || `Image ${idx + 1}`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Description */}
                            {chart.howToMeasureDescription && (
                              <p className="text-sm text-gray-700">
                                {chart.howToMeasureDescription}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Size Chart Table */}
                        <div className="overflow-x-auto border border-gray-300 rounded-lg">
                          <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-100">
                                  Size
                                </th>
                                {filledFields.map(({ key, label }) => (
                                  <th
                                    key={`header_${key}`}
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap"
                                  >
                                    {label} ({viewUnit})
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {displaySizes.map((size, index) => (
                                <tr key={`size_row_${chart.id || chart._id}_${index}`} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                                    {size.sizeLabel || "-"}
                                  </td>
                                  {filledFields.map(({ key }) => (
                                    <td
                                      key={`cell_${key}_${index}`}
                                      className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap"
                                    >
                                      {size[key] || "-"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Saved Size Charts
          </h2>
          <div className="text-center py-8 text-gray-500">
            No size charts found. Create your first size chart above!
          </div>
        </div>
      )}

      {/* Backdrop for save/update operations */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(4px)'
        }}
        open={publishLoading}
      >
        <div className="flex flex-col items-center">
          <CircularProgress color="inherit" size={60} />
          <p className="mt-4 text-lg font-medium">
            {editingChart ? "Updating size chart..." : "Publishing size chart..."}
          </p>
        </div>
      </Backdrop>

      <ToastContainer 
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default AddSizechart;