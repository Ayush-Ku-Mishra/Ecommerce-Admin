import React, { useState, useEffect } from "react";
import { MdBrandingWatermark } from "react-icons/md";
import { TbCategoryPlus } from "react-icons/tb";
import { MdOutlineSettings } from "react-icons/md";
import { MdOutlineRateReview } from "react-icons/md";
import { VscVerifiedFilled } from "react-icons/vsc";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
} from "react-icons/fa";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Rating from "@mui/material/Rating";
import { Dialog, CircularProgress } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";

const ProductDetails = () => {
  const { pathname } = useLocation();
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();

  // Product data state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Image states
  const [selectedImage, setSelectedImage] = useState("");
  const [imageKey, setImageKey] = useState(null);
  const [zoomStyle, setZoomStyle] = useState({});
  const [isHovering, setIsHovering] = useState(false);
  const [imageModal, setImageModal] = useState({
    open: false,
    images: [],
    currentIndex: 0,
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    setImageKey(Date.now());
  }, [selectedImage]);

  useEffect(() => {
    // Scroll to top on any route change
    window.scrollTo(0, 0);
  }, [pathname]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/product/getProduct/${id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        const productData = response.data.product;
        setProduct(productData);

        // Set the first image as selected
        if (productData.images && productData.images.length > 0) {
          setSelectedImage(productData.images[0]);
        }
      } else {
        setError(response.data.message || "Failed to fetch product");
        toast.error("Failed to fetch product details");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to load product details");

      if (error.response?.status === 404) {
        toast.error("Product not found");
      } else {
        toast.error("Failed to fetch product details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (img) => {
    if (img !== selectedImage) {
      setSelectedImage(img);
      setImageKey(Date.now());
    }
  };

  const handleMainImageClick = () => {
    if (product?.images && product.images.length > 0) {
      const currentIndex = product.images.findIndex(
        (img) => img === selectedImage
      );
      setImageModal({
        open: true,
        images: product.images,
        currentIndex: currentIndex >= 0 ? currentIndex : 0,
      });
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Fixed getSizeDisplay function to handle object sizes properly
  const getSizeDisplay = () => {
    if (!product) return [];

    const sizes = [];
    
    // Handle dress sizes - check if it's an array of objects or strings
    if (product.dressSizes?.length) {
      product.dressSizes.forEach(dressSize => {
        if (typeof dressSize === 'object' && dressSize.size) {
          // If it's an object with size property
          sizes.push(`${dressSize.size} (${dressSize.stock || 0} stock)`);
        } else if (typeof dressSize === 'string') {
          // If it's a string
          sizes.push(dressSize);
        }
      });
    }
    
    // Handle shoes sizes - check if it's an array of objects or strings
    if (product.shoesSizes?.length) {
      product.shoesSizes.forEach(shoeSize => {
        if (typeof shoeSize === 'object' && shoeSize.size) {
          // If it's an object with size property
          sizes.push(`${shoeSize.size} (${shoeSize.stock || 0} stock)`);
        } else if (typeof shoeSize === 'string') {
          // If it's a string
          sizes.push(shoeSize);
        }
      });
    }
    
    // Handle regular size array
    if (product.size?.length) {
      product.size.forEach(size => {
        if (typeof size === 'object' && size.size) {
          sizes.push(`${size.size} (${size.stock || 0} stock)`);
        } else if (typeof size === 'string') {
          sizes.push(size);
        }
      });
    }
    
    // Handle free size
    if (product.freeSize === "yes") {
      sizes.push("Free Size");
    }

    return sizes.length > 0 ? sizes : ["N/A"];
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <CircularProgress size={40} />
            <span className="mt-2 text-gray-600">
              Loading product details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">
              {error || "Product not found"}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <FaArrowLeft /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Page Title */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          title="Go back"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold">Product Details</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Gallery Section */}
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex flex-row sm:flex-col justify-start gap-2 order-2 sm:order-1">
              {product.images.map((img, index) => (
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
          )}

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
              onClick={handleMainImageClick}
            >
              <img
                key={imageKey}
                src={
                  selectedImage ||
                  product.images?.[0] ||
                  "/placeholder-image.jpg"
                }
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
                style={isHovering ? zoomStyle : {}}
              />
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  Click to view gallery
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Information Section */}
        <div className="flex-1 max-w-2xl">
          {/* Product Title */}
          <h2 className="text-2xl font-[500] mb-6 leading-tight">
            {product.name}
          </h2>

          {/* Product Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <MdBrandingWatermark className="text-gray-600" />
              <span className="text-gray-700">Brand :</span>
              <span className="text-gray-900">{product.brand || "N/A"}</span>
            </div>

            <div className="flex items-center gap-3">
              <TbCategoryPlus className="text-gray-600" />
              <span className="text-gray-700">Category :</span>
              <div className="flex flex-col">
                <span className="text-gray-900">
                  {product.categoryName || "N/A"}
                </span>
                {product.subCatName && (
                  <span className="text-sm text-gray-600">
                    Sub: {product.subCatName}
                  </span>
                )}
                {product.thirdSubCatName && (
                  <span className="text-sm text-gray-600">
                    Third: {product.thirdSubCatName}
                  </span>
                )}
                {product.fourthSubCatName && (
                  <span className="text-sm text-gray-600">
                    Fourth: {product.fourthSubCatName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MdOutlineSettings className="text-gray-600" />
              <span className="text-gray-700">SIZE :</span>
              <div className="flex gap-2 flex-wrap">
                {getSizeDisplay().map((size, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm font-medium"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MdOutlineRateReview className="text-gray-600" />
              <span className="text-gray-700">Rating :</span>
              <div className="flex items-center gap-2">
                <Rating
                  value={product.rating || 0}
                  precision={0.5}
                  size="small"
                  readOnly
                />
                <span className="text-gray-900">({product.rating || 0})</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <VscVerifiedFilled className="text-gray-600" />
              <span className="text-gray-700">Published :</span>
              <span className="text-gray-900">
                {formatDate(product.createdAt)}
              </span>
            </div>

            {/* Price Information */}
            <div className="flex items-center gap-3">
              <span className="text-gray-700">Price :</span>
              <div className="flex items-center gap-2">
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="line-through text-gray-500 text-lg">
                    ₹{product.oldPrice}
                  </span>
                )}
                <span className="text-xl font-semibold text-blue-600">
                  ₹{product.price}
                </span>
                {product.discount > 0 && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Stock Information */}
            <div className="flex items-center gap-3">
              <span className="text-gray-700">Stock :</span>
              <span
                className={`font-semibold ${
                  product.stock > 10
                    ? "text-green-600"
                    : product.stock > 0
                    ? "text-orange-600"
                    : "text-red-600"
                }`}
              >
                {product.stock > 0 ? `${product.stock} units` : "Out of Stock"}
              </span>
            </div>

            {/* Featured Status */}
            {product.isFeatured && (
              <div className="flex items-center gap-3">
                <span className="text-gray-700">Status :</span>
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm font-medium">
                  Featured Product
                </span>
              </div>
            )}
          </div>

          {/* Product Description */}
          <div>
            <h3 className="text-xl font-[400] text-gray-900 mb-4">
              Product Details
            </h3>
            <div className="text-gray-700 leading-relaxed">
              {product.productDetails?.description ? (
                <p>{product.productDetails.description}</p>
              ) : (
                <p>No details available for this product.</p>
              )}

              {/* Additional product details */}
              {product.productDetails &&
                Object.keys(product.productDetails).length > 1 && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(product.productDetails).map(
                      ([key, value]) => {
                        if (key === "description") return null;
                        return (
                          <div key={key} className="flex gap-2">
                            <span className="font-medium text-gray-700 capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span className="text-gray-600">{value}</span>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Color Variants */}
          {product.colorVariants && product.colorVariants.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Available Colors
              </h3>
              <div className="flex gap-2 flex-wrap">
                {product.colorVariants.map((variant, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-2 bg-gray-50"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {variant.colorName || variant.name}
                    </span>
                    {variant.price && (
                      <div className="text-xs text-gray-600">
                        ₹{variant.price}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={imageModal.open}
        onClose={() =>
          setImageModal({ open: false, images: [], currentIndex: 0 })
        }
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
            maxWidth: "95vw",
            maxHeight: "95vh",
          },
        }}
      >
        <div className="relative bg-black rounded-lg overflow-hidden">
          <button
            onClick={() =>
              setImageModal({ open: false, images: [], currentIndex: 0 })
            }
            className="absolute top-4 right-4 z-50 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          >
            <FaTimes size={20} />
          </button>

          {imageModal.images.length > 0 && (
            <Swiper
              modules={[Navigation, Pagination, Zoom]}
              spaceBetween={0}
              slidesPerView={1}
              navigation={{
                prevEl: ".swiper-button-prev-custom",
                nextEl: ".swiper-button-next-custom",
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              zoom={{
                maxRatio: 3,
                minRatio: 1,
              }}
              initialSlide={imageModal.currentIndex}
              className="w-full h-[80vh]"
            >
              {imageModal.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="swiper-zoom-container flex items-center justify-center h-full">
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </SwiperSlide>
              ))}

              {/* Custom Navigation Buttons */}
              {imageModal.images.length > 1 && (
                <>
                  <button className="swiper-button-prev-custom absolute left-4 top-1/2 transform -translate-y-1/2 z-40 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all">
                    <FaChevronLeft size={20} />
                  </button>
                  <button className="swiper-button-next-custom absolute right-4 top-1/2 transform -translate-y-1/2 z-40 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all">
                    <FaChevronRight size={20} />
                  </button>
                </>
              )}
            </Swiper>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default ProductDetails;