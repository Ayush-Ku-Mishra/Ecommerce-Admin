import React, { useState, useEffect } from "react";
import { MdBrandingWatermark } from "react-icons/md";
import { TbCategoryPlus } from "react-icons/tb";
import { MdOutlineSettings } from "react-icons/md";
import { MdOutlineRateReview } from "react-icons/md";
import { VscVerifiedFilled } from "react-icons/vsc";

const ProductDetails = () => {
  // Sample product data
  const productImages = [
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop",
    "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400&h=500&fit=crop",
  ];

  const [selectedImage, setSelectedImage] = useState(productImages[0]);
  const [imageKey, setImageKey] = useState(null);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setImageKey(Date.now());
  }, [selectedImage]);

  const handleImageClick = (img) => {
    if (img !== selectedImage) {
      setSelectedImage(img);
      setImageKey(Date.now());
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.2)",
    });
  };

  const resetZoom = () => {
    setZoomStyle({
      transform: "scale(1)",
      transformOrigin: "center center",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Page Title */}
      <h1 className="text-xl font-semibold mb-6">Product Details</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Gallery Section */}
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Thumbnails */}
          <div className="flex flex-row sm:flex-col justify-start gap-2 order-2 sm:order-1">
            {productImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumb-${index}`}
                className={`w-16 h-16 rounded-lg cursor-pointer object-cover transition-all duration-200 ${
                  selectedImage === img
                    ? "border-2 border-gray-800"
                    : "border-2 border-transparent opacity-60 hover:opacity-80"
                }`}
                onClick={() => handleImageClick(img)}
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="relative order-1 sm:order-2">
            <div
              className="md:w-[350px] md:h-[460px] sm:w-[350px] sm:h-[460px] w-[315px] h-[460px] border border-gray-200 rounded-lg overflow-hidden relative cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => {
                setIsHovering(false);
                resetZoom();
              }}
            >
              <img
                key={imageKey}
                src={selectedImage}
                alt="Product"
                className="w-full h-full object-cover transition-all duration-300"
                style={isHovering ? zoomStyle : {}}
              />
            </div>
          </div>
        </div>

        {/* Product Information Section */}
        <div className="flex-1 max-w-2xl">
          {/* Product Title */}
          <h2 className="text-2xl font-[500] mb-6 leading-tight">
            Women Wide Leg High-Rise Light Fade Stretchable Jeans
          </h2>

          {/* Product Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 ">
              <MdBrandingWatermark className="text-gray-600" />
              <span className="text-gray-700">Brand :</span>
              <span className="text-gray-900">Flying Machine</span>
            </div>

            <div className="flex items-center gap-3">
              <TbCategoryPlus className="text-gray-600" />
              <span className=" text-gray-700">Category :</span>
              <span className="text-gray-900">Fashion</span>
            </div>

            <div className="flex items-center gap-3">
              <MdOutlineSettings className="text-gray-600" />
              <span className=" text-gray-700">SIZE :</span>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm font-medium">
                  S
                </span>
                <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm font-medium">
                  M
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MdOutlineRateReview className="text-gray-600" />
              <span className=" text-gray-700">Review :</span>
              <span className="text-gray-900">(0) Review</span>
            </div>

            <div className="flex items-center gap-3">
              <VscVerifiedFilled className="text-gray-600" />
              <span className=" text-gray-700">Published :</span>
              <span className="text-gray-900">2025-07-28</span>
            </div>
          </div>

          {/* Product Description */}
          <div>
            <h3 className="text-xl font-[400] text-gray-900 mb-4">
              Product Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
