import React, { useState, useEffect, useRef } from "react";
import {
  FaStar,
  FaThumbsUp,
  FaThumbsDown,
  FaImage,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaFilter,
  FaChartLine,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaSearch,
  FaReply,
  FaUserShield,
  FaCheck,
  FaUser,
  FaTimes,
  FaEdit,
  FaSave,
  FaSpinner,
} from "react-icons/fa";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { format, subDays, parseISO } from "date-fns";
import { Dialog, Tabs, Tab, Tooltip, IconButton, Zoom } from "@mui/material";
import toast from "react-hot-toast";

// Register Chart.js components
Chart.register(...registerables);

const ReviewsAdmin = ({ activeTab: initialTab = "overview" }) => {
  // State variables
  const [activeTab, setActiveTab] = useState(initialTab);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [reportedReviews, setReportedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalReviews: 0,
    averageRating: 0,
    reviewsWithImages: 0,
    verifiedReviews: 0,
    totalLikes: 0,
    totalDislikes: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    rating: "all",
    hasImages: false,
    isVerified: false,
    dateRange: "all",
    sortBy: "newest",
  });
  const [reviewDetailModal, setReviewDetailModal] = useState({
    open: false,
    review: null,
  });
  const [responseText, setResponseText] = useState("");
  const [editingResponse, setEditingResponse] = useState(false);
  const [hideReasonText, setHideReasonText] = useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    open: false,
    reviewId: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [productAnalytics, setProductAnalytics] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [imageModal, setImageModal] = useState({
    open: false,
    url: "",
    index: 0,
    images: [],
  });

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch reviews
        const reviewsRes = await fetch(
          `${API_BASE_URL}/api/v1/reviews/admin/all`,
          {
            credentials: "include",
          }
        );
        const reviewsData = await reviewsRes.json();

        // Fetch products (for dropdown filters)
        const productsRes = await fetch(
          `${API_BASE_URL}/api/v1/product/getAllProducts`,
          {
            credentials: "include",
          }
        );
        const productsData = await productsRes.json();

        // Fetch reported reviews
        const reportedRes = await fetch(
          `${API_BASE_URL}/api/v1/reviews/admin/reported`,
          {
            credentials: "include",
          }
        );
        const reportedData = await reportedRes.json();

        // Fetch analytics
        const analyticsRes = await fetch(
          `${API_BASE_URL}/api/v1/reviews/admin/analytics`,
          {
            credentials: "include",
          }
        );
        const analyticsData = await analyticsRes.json();

        if (reviewsData.success) {
          setReviews(reviewsData.reviews || []);
          setFilteredReviews(reviewsData.reviews || []);
        }

        if (productsData.success) {
          setProducts(productsData.products || []);
        }

        if (reportedData.success) {
          setReportedReviews(reportedData.reviews || []);
        }

        if (analyticsData.success) {
          setAnalytics(analyticsData.analytics || {});
        }

        // Process data for charts and analytics
        processAnalyticsData(reviewsData.reviews || []);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialTab]);

  // Process analytics data for charts
  const processAnalyticsData = (reviewsData) => {
    // Process product analytics
    const productMap = {};
    reviewsData.forEach((review) => {
      const productId = review.productId?._id || review.productId;
      const productName = review.productId?.name || "Unknown Product";

      if (!productMap[productId]) {
        productMap[productId] = {
          id: productId,
          name: productName,
          totalReviews: 0,
          totalRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          withImages: 0,
          verified: 0,
          likes: 0,
          dislikes: 0,
          reports: 0,
        };
      }

      productMap[productId].totalReviews++;
      productMap[productId].totalRating += review.rating;
      productMap[productId].ratingDistribution[review.rating]++;
      if (review.images?.length > 0) productMap[productId].withImages++;
      if (review.isVerifiedPurchase) productMap[productId].verified++;
      productMap[productId].likes += review.likes?.length || 0;
      productMap[productId].dislikes += review.dislikes?.length || 0;
      productMap[productId].reports += review.reports?.length || 0;
    });

    // Convert to array and calculate averages
    const productAnalytics = Object.values(productMap).map((product) => ({
      ...product,
      averageRating: product.totalRating / product.totalReviews,
      imagePercentage: (product.withImages / product.totalReviews) * 100,
      verifiedPercentage: (product.verified / product.totalReviews) * 100,
    }));

    setProductAnalytics(productAnalytics);

    // Process daily stats for time series chart
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date,
        formattedDate: format(date, "yyyy-MM-dd"),
        reviews: 0,
        avgRating: 0,
        totalRating: 0,
      };
    });

    const dailyMap = {};
    last30Days.forEach((day) => {
      dailyMap[day.formattedDate] = {
        ...day,
        reviews: 0,
        avgRating: 0,
        totalRating: 0,
      };
    });

    reviewsData.forEach((review) => {
      if (!review.createdAt) return;
      try {
        const reviewDate = format(parseISO(review.createdAt), "yyyy-MM-dd");
        if (dailyMap[reviewDate]) {
          dailyMap[reviewDate].reviews++;
          dailyMap[reviewDate].totalRating += review.rating;
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    });

    // Calculate average ratings
    Object.values(dailyMap).forEach((day) => {
      day.avgRating = day.reviews > 0 ? day.totalRating / day.reviews : 0;
    });

    setDailyStats(Object.values(dailyMap));
  };

  // Filter reviews based on selected criteria
  useEffect(() => {
    if (reviews.length === 0) return;

    let filtered = [...reviews];

    // Filter by product
    if (selectedProduct !== "all") {
      filtered = filtered.filter(
        (review) =>
          review.productId?._id === selectedProduct ||
          review.productId === selectedProduct
      );
    }

    // Filter by rating
    if (filters.rating !== "all") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(filters.rating)
      );
    }

    // Filter by images
    if (filters.hasImages) {
      filtered = filtered.filter((review) => review.images?.length > 0);
    }

    // Filter by verified purchase
    if (filters.isVerified) {
      filtered = filtered.filter((review) => review.isVerifiedPurchase);
    }

    // Filter by date range
    if (filters.dateRange !== "all") {
      const daysToSubtract =
        filters.dateRange === "7days"
          ? 7
          : filters.dateRange === "30days"
          ? 30
          : filters.dateRange === "90days"
          ? 90
          : 365;
      const cutoffDate = subDays(new Date(), daysToSubtract);
      filtered = filtered.filter(
        (review) => new Date(review.createdAt) >= cutoffDate
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (review) =>
          review.text?.toLowerCase().includes(query) ||
          review.title?.toLowerCase().includes(query) ||
          review.userId?.name?.toLowerCase().includes(query) ||
          review.productId?.name?.toLowerCase().includes(query)
      );
    }

    // Sort reviews
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        case "mostLiked":
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        case "mostReported":
          return (b.reports?.length || 0) - (a.reports?.length || 0);
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredReviews(filtered);
  }, [reviews, selectedProduct, filters, searchQuery]);

  // Filter products based on search
  const filteredProducts = products.filter((product) => {
    if (!productSearchQuery) return true;
    return product.name
      ?.toLowerCase()
      .includes(productSearchQuery.toLowerCase());
  });

  // Toggle review visibility (hide/unhide)
  const toggleReviewVisibility = async (reviewId, isCurrentlyHidden) => {
    try {
      if (!isCurrentlyHidden && !hideReasonText.trim()) {
        toast.error("Please provide a reason for hiding the review");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/reviews/admin/${reviewId}/visibility`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: hideReasonText }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update reviews in state
        const updatedReviews = reviews.map((review) =>
          review._id === reviewId
            ? {
                ...review,
                isHidden: !isCurrentlyHidden,
                hiddenReason: !isCurrentlyHidden ? hideReasonText : undefined,
                hiddenAt: !isCurrentlyHidden ? new Date() : undefined,
              }
            : review
        );
        setReviews(updatedReviews);

        // If review detail modal is open, update the review in it
        if (
          reviewDetailModal.open &&
          reviewDetailModal.review?._id === reviewId
        ) {
          setReviewDetailModal({
            ...reviewDetailModal,
            review: {
              ...reviewDetailModal.review,
              isHidden: !isCurrentlyHidden,
              hiddenReason: !isCurrentlyHidden ? hideReasonText : undefined,
              hiddenAt: !isCurrentlyHidden ? new Date() : undefined,
            },
          });
        }

        // Reset hide reason
        setHideReasonText("");

        toast.success(
          `Review ${isCurrentlyHidden ? "unhidden" : "hidden"} successfully`
        );
      } else {
        toast.error(data.message || "Failed to update review visibility");
      }
    } catch (error) {
      console.error("Error toggling review visibility:", error);
      toast.error("Failed to update review visibility");
    }
  };

  // Delete a review
  const deleteReview = async (reviewId) => {
    try {
      setDeleteLoading(true);
      setDeletingReviewId(reviewId);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/reviews/${reviewId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        // Remove review from state
        setReviews(reviews.filter((review) => review._id !== reviewId));
        setReportedReviews(
          reportedReviews.filter((review) => review._id !== reviewId)
        );

        // Close modals
        setDeleteConfirmModal({ open: false, reviewId: null });
        setReviewDetailModal({ open: false, review: null });

        toast.success("Review deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    } finally {
      setDeleteLoading(false);
      setDeletingReviewId(null);
    }
  };

  // Update admin response
  const updateResponse = async (reviewId, isNew = false) => {
  try {
    // Check if we're editing an existing response and the text is empty
    const isDeleting = !isNew && !responseText.trim();

    // For new responses, don't allow empty submissions
    if (isNew && !responseText.trim()) {
      toast.error("Response text cannot be empty");
      return;
    }

    let endpoint, method;
    
    if (isDeleting) {
      // If we're deleting, use DELETE endpoint
      endpoint = `${API_BASE_URL}/api/v1/reviews/${reviewId}/response`;
      method = "DELETE";
    } else if (isNew) {
      // If it's a new response, use POST endpoint
      endpoint = `${API_BASE_URL}/api/v1/reviews/${reviewId}/response`;
      method = "POST";
    } else {
      // If it's an edit, use PUT endpoint
      endpoint = `${API_BASE_URL}/api/v1/reviews/${reviewId}/response/edit`;
      method = "PUT";
    }

    // Different request options based on the method
    const requestOptions = {
      method: method,
      credentials: "include",
    };

    // Add headers and body for non-DELETE requests
    if (method !== "DELETE") {
      requestOptions.headers = {
        "Content-Type": "application/json",
      };
      requestOptions.body = JSON.stringify({ text: responseText });
    }

    const response = await fetch(endpoint, requestOptions);
    const data = await response.json();

    if (data.success) {
      // Update reviews in state
      const updatedReviews = reviews.map((review) => {
        if (review._id === reviewId) {
          if (isDeleting) {
            // Remove response property entirely
            const { response, ...reviewWithoutResponse } = review;
            return reviewWithoutResponse;
          } else {
            // Update with new response
            return {
              ...review,
              response: data.review.response || {
                text: responseText,
                respondedAt: new Date(),
                role: "admin",
              },
            };
          }
        }
        return review;
      });
      
      setReviews(updatedReviews);

      // Update current review in modal
      if (reviewDetailModal.review?._id === reviewId) {
        if (isDeleting) {
          // Remove response from modal review
          const { response, ...reviewWithoutResponse } = reviewDetailModal.review;
          setReviewDetailModal({
            ...reviewDetailModal,
            review: reviewWithoutResponse,
          });
        } else {
          // Update with new response
          setReviewDetailModal({
            ...reviewDetailModal,
            review: {
              ...reviewDetailModal.review,
              response: data.review.response || {
                text: responseText,
                respondedAt: new Date(),
                role: "admin",
              },
            },
          });
        }
      }

      // Reset response text and editing state
      setResponseText("");
      setEditingResponse(false);

      toast.success(
        isDeleting
          ? "Response removed successfully"
          : isNew
          ? "Response added successfully"
          : "Response updated successfully"
      );
    } else {
      toast.error(data.message || "Failed to process response");
    }
  } catch (error) {
    console.error("Error processing response:", error);
    toast.error("Failed to process response");
  }
};

  // When response editing starts
  const startEditResponse = (text) => {
    setResponseText(text);
    setEditingResponse(true);
  };

  // Open image modal
  const openImageModal = (url, images = [], index = 0) => {
    setImageModal({
      open: true,
      url,
      images: images.length > 0 ? images.map((img) => img.url || img) : [url],
      index: index,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-blue-600 border-b-transparent border-l-transparent"></div>
        <p className="text-gray-700 font-medium mt-4 text-lg">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  // Chart data for rating distribution with more appealing colors
  const ratingDistributionData = {
    labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
    datasets: [
      {
        label: "Reviews Count",
        data: [
          analytics.ratingDistribution[1],
          analytics.ratingDistribution[2],
          analytics.ratingDistribution[3],
          analytics.ratingDistribution[4],
          analytics.ratingDistribution[5],
        ],
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)", // Red for 1 star
          "rgba(249, 115, 22, 0.8)", // Orange for 2 stars
          "rgba(234, 179, 8, 0.8)", // Yellow for 3 stars
          "rgba(16, 185, 129, 0.8)", // Green for 4 stars
          "rgba(59, 130, 246, 0.8)", // Blue for 5 stars
        ],
        borderColor: [
          "rgba(239, 68, 68, 1)", // Red
          "rgba(249, 115, 22, 1)", // Orange
          "rgba(234, 179, 8, 1)", // Yellow
          "rgba(16, 185, 129, 1)", // Green
          "rgba(59, 130, 246, 1)", // Blue
        ],
        borderWidth: 1,
        hoverOffset: 15,
      },
    ],
  };

  // Chart data for daily reviews with enhanced colors
  const dailyReviewsData = {
    labels: dailyStats.map((day) => format(day.date, "MMM d")),
    datasets: [
      {
        label: "Number of Reviews",
        data: dailyStats.map((day) => day.reviews),
        fill: true,
        backgroundColor: "rgba(79, 70, 229, 0.2)", // Indigo with transparency
        borderColor: "rgba(79, 70, 229, 0.8)", // Indigo
        tension: 0.4,
        pointBackgroundColor: "rgba(79, 70, 229, 1)",
        pointBorderColor: "#fff",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Average Rating",
        data: dailyStats.map((day) => day.avgRating),
        fill: true,
        backgroundColor: "rgba(16, 185, 129, 0.1)", // Green with transparency
        borderColor: "rgba(16, 185, 129, 0.8)", // Green
        tension: 0.4,
        yAxisID: "y-axis-2",
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        pointBorderColor: "#fff",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Chart options for daily reviews
  const dailyReviewsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Reviews",
          font: {
            weight: "bold",
          },
        },
        grid: {
          color: "rgba(156, 163, 175, 0.15)", // Light gray grid lines
        },
      },
      "y-axis-2": {
        position: "right",
        beginAtZero: true,
        max: 5,
        title: {
          display: true,
          text: "Rating",
          font: {
            weight: "bold",
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
          font: {
            weight: "bold",
          },
        },
        grid: {
          color: "rgba(156, 163, 175, 0.15)", // Light gray grid lines
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  // Chart data for product comparison with enhanced colors
  const topProducts = productAnalytics
    .sort((a, b) => b.totalReviews - a.totalReviews)
    .slice(0, 10);

  const productComparisonData = {
    labels: topProducts.map((product) => product.name),
    datasets: [
      {
        label: "Total Reviews",
        data: topProducts.map((product) => product.totalReviews),
        backgroundColor: "rgba(79, 70, 229, 0.7)", // Indigo
        borderRadius: 6,
      },
      {
        label: "Avg. Rating",
        data: topProducts.map((product) => product.averageRating),
        backgroundColor: "rgba(16, 185, 129, 0.7)", // Green
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Reviews Dashboard
            </h1>
            <p className="text-indigo-100 mt-2">
              Manage and analyze all customer reviews in one place
            </p>
          </div>

          <div className="p-4 sm:p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Total Reviews
                  </h3>
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FaStar className="text-indigo-600 text-xl" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {analytics.totalReviews}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  {analytics.verifiedReviews} verified purchases (
                  {Math.round(
                    (analytics.verifiedReviews /
                      (analytics.totalReviews || 1)) *
                      100
                  )}
                  %)
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Average Rating
                  </h3>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`${
                            star <= Math.round(analytics.averageRating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          } text-sm`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {analytics.averageRating.toFixed(1)}
                </p>
                <div className="mt-2 text-sm text-gray-500">Out of 5 stars</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 rounded-xl border border-purple-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700">
                    With Images
                  </h3>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FaImage className="text-purple-600 text-xl" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {analytics.reviewsWithImages}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  {Math.round(
                    (analytics.reviewsWithImages /
                      (analytics.totalReviews || 1)) *
                      100
                  )}
                  % of all reviews
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Interactions
                  </h3>
                  <div className="flex space-x-1">
                    <div className="p-1 bg-green-100 rounded-lg">
                      <FaThumbsUp className="text-green-600" />
                    </div>
                    <div className="p-1 bg-red-100 rounded-lg">
                      <FaThumbsDown className="text-red-600" />
                    </div>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {analytics.totalLikes + analytics.totalDislikes}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  {analytics.totalLikes} likes, {analytics.totalDislikes}{" "}
                  dislikes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              <button
                className={`px-4 py-4 font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "overview"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                <FaChartLine className="inline mr-2" /> Analytics Overview
              </button>
              <button
                className={`px-4 py-4 font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "reviews"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                <FaStar className="inline mr-2" /> All Reviews
              </button>
              <button
                className={`px-4 py-4 font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "reported"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("reported")}
              >
                <FaExclamationTriangle className="inline mr-2" /> Reported
                Reviews
                {reportedReviews.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                    {reportedReviews.length}
                  </span>
                )}
              </button>
              <button
                className={`px-4 py-4 font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "products"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("products")}
              >
                <FaFilter className="inline mr-2" /> Product Analysis
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Rating Distribution
                  </h2>
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80 transition-all duration-300 hover:shadow-md">
                    <Doughnut
                      data={ratingDistributionData}
                      options={{
                        plugins: {
                          legend: {
                            position: "right",
                            labels: {
                              usePointStyle: true,
                              padding: 20,
                              font: {
                                size: 12,
                              },
                            },
                          },
                        },
                        cutout: "65%", // Donut hole size
                        radius: "90%", // Overall chart size
                      }}
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      Reviews Over Time
                    </h2>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        className={`px-3 py-1.5 text-sm rounded-md ${
                          timeRange === "7days"
                            ? "bg-white shadow-sm font-medium text-indigo-600"
                            : "text-gray-600 hover:bg-white/50"
                        }`}
                        onClick={() => setTimeRange("7days")}
                      >
                        7 Days
                      </button>
                      <button
                        className={`px-3 py-1.5 text-sm rounded-md ${
                          timeRange === "30days"
                            ? "bg-white shadow-sm font-medium text-indigo-600"
                            : "text-gray-600 hover:bg-white/50"
                        }`}
                        onClick={() => setTimeRange("30days")}
                      >
                        30 Days
                      </button>
                      <button
                        className={`px-3 py-1.5 text-sm rounded-md ${
                          timeRange === "90days"
                            ? "bg-white shadow-sm font-medium text-indigo-600"
                            : "text-gray-600 hover:bg-white/50"
                        }`}
                        onClick={() => setTimeRange("90days")}
                      >
                        90 Days
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80 transition-all duration-300 hover:shadow-md">
                    <Line
                      data={dailyReviewsData}
                      options={dailyReviewsOptions}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Top Products by Reviews
                    </h2>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80 overflow-auto transition-all duration-300 hover:shadow-md">
                      <Bar
                        data={productComparisonData}
                        options={{
                          indexAxis: "y",
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                usePointStyle: true,
                                padding: 20,
                                font: {
                                  size: 12,
                                },
                              },
                            },
                          },
                          scales: {
                            x: {
                              grid: {
                                color: "rgba(156, 163, 175, 0.15)", // Light gray grid lines
                              },
                            },
                            y: {
                              grid: {
                                display: false,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Recent Activity
                    </h2>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80 overflow-auto transition-all duration-300 hover:shadow-md">
                      <ul className="divide-y divide-gray-200">
                        {reviews.slice(0, 8).map((review) => (
                          <li
                            key={review._id}
                            className="py-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-start">
                              <div
                                className={`p-2 rounded-full ${
                                  review.rating >= 4
                                    ? "bg-green-100"
                                    : review.rating >= 3
                                    ? "bg-yellow-100"
                                    : "bg-red-100"
                                } mr-3`}
                              >
                                <FaStar
                                  className={`${
                                    review.rating >= 4
                                      ? "text-green-600"
                                      : review.rating >= 3
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {review.isAnonymous
                                    ? "Anonymous"
                                    : review.userId?.name || "User"}
                                  <span className="ml-2 text-xs font-normal text-gray-500">
                                    {format(
                                      new Date(review.createdAt),
                                      "MMM d, yyyy"
                                    )}
                                  </span>
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {review.title || review.text?.slice(0, 60)}...
                                </p>
                                <div className="mt-1 flex items-center text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <span className="flex mr-2">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                          key={star}
                                          className={
                                            star <= review.rating
                                              ? "text-yellow-400"
                                              : "text-gray-300"
                                          }
                                          size={10}
                                        />
                                      ))}
                                    </span>
                                    {review.productId?.name || "Product"}
                                  </span>
                                </div>
                              </div>
                              <button
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                onClick={() =>
                                  setReviewDetailModal({ open: true, review })
                                }
                              >
                                View
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>

                      <button
                        className="mt-4 w-full py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-lg hover:bg-indigo-50"
                        onClick={() => setActiveTab("reviews")}
                      >
                        View All Reviews
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Reviews Tab */}
            {activeTab === "reviews" && (
              <div>
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      All Reviews{" "}
                      <span className="text-gray-500 font-normal">
                        ({filteredReviews.length})
                      </span>
                    </h2>
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search reviews..."
                        className="pl-10 pr-4 py-2 w-full md:w-72 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    {/* Product dropdown with search functionality */}
                    <div className="relative min-w-[200px]">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          value={productSearchQuery}
                          onChange={(e) =>
                            setProductSearchQuery(e.target.value)
                          }
                        />
                      </div>
                      <select
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                      >
                        <option value="all">All Products</option>
                        {filteredProducts.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <select
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={filters.rating}
                      onChange={(e) =>
                        setFilters({ ...filters, rating: e.target.value })
                      }
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>

                    <select
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={filters.dateRange}
                      onChange={(e) =>
                        setFilters({ ...filters, dateRange: e.target.value })
                      }
                    >
                      <option value="all">All Time</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="90days">Last 90 Days</option>
                      <option value="365days">Last Year</option>
                    </select>

                    <select
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={filters.sortBy}
                      onChange={(e) =>
                        setFilters({ ...filters, sortBy: e.target.value })
                      }
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                      <option value="mostLiked">Most Liked</option>
                      <option value="mostReported">Most Reported</option>
                    </select>

                    <button
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        filters.hasImages
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      } transition-colors`}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          hasImages: !filters.hasImages,
                        })
                      }
                    >
                      <FaImage className="inline mr-1" /> With Images
                    </button>

                    <button
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        filters.isVerified
                          ? "bg-green-600 text-white border-green-600"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      } transition-colors`}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          isVerified: !filters.isVerified,
                        })
                      }
                    >
                      <FaCheck className="inline mr-1" /> Verified Only
                    </button>
                  </div>
                </div>

                {filteredReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <FaSearch className="mx-auto text-gray-300 text-4xl mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No reviews found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div
                            className={`p-4 ${
                              review.isHidden ? "bg-gray-100" : "bg-white"
                            } flex-1`}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                  <FaUser className="text-white" />
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-2">
                                  <span className="font-semibold text-gray-900">
                                    {review.isAnonymous
                                      ? "Anonymous"
                                      : review.userId?.name || "User"}
                                  </span>

                                  {review.isVerifiedPurchase && (
                                    <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-100">
                                      ✓ Verified
                                    </span>
                                  )}

                                  {review.isHidden && (
                                    <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full border border-red-100">
                                      Hidden
                                    </span>
                                  )}

                                  {review.reports?.length > 0 && (
                                    <span className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full border border-amber-100">
                                      {review.reports.length}{" "}
                                      {review.reports.length === 1
                                        ? "Report"
                                        : "Reports"}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center mt-1 mb-2">
                                  <div className="flex mr-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <FaStar
                                        key={star}
                                        className={
                                          star <= review.rating
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                        }
                                        size={16}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {format(
                                      new Date(review.createdAt),
                                      "MMM d, yyyy"
                                    )}
                                  </span>
                                </div>

                                {review.title && (
                                  <h4 className="font-medium text-gray-900 mb-1">
                                    {review.title}
                                  </h4>
                                )}

                                <p className="text-gray-700 text-sm">
                                  {review.text?.length > 150
                                    ? `${review.text.slice(0, 150)}...`
                                    : review.text}
                                </p>

                                {review.images?.length > 0 && (
                                  <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                    {review.images.map((image, index) => (
                                      <div
                                        key={index}
                                        className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border border-gray-200 cursor-pointer transform transition-transform hover:scale-105"
                                        onClick={() =>
                                          openImageModal(
                                            image.url || image,
                                            review.images,
                                            index
                                          )
                                        }
                                      >
                                        <img
                                          src={image.url || image}
                                          alt={`Review ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {review.response && (
                                  <div className="mt-3 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                                    <p className="text-xs font-medium text-indigo-700 mb-1">
                                      Admin Response:
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      {review.response.text}
                                    </p>
                                  </div>
                                )}

                                {review.isHidden && review.hiddenReason && (
                                  <div className="mt-3 bg-red-50 p-2 rounded-lg border border-red-100">
                                    <p className="text-xs font-medium text-red-700 mb-1">
                                      Reason for hiding:
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      {review.hiddenReason}
                                    </p>
                                  </div>
                                )}

                                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <FaThumbsUp className="mr-1 text-green-500" />
                                    {review.likes?.length || 0} likes
                                  </span>
                                  <span className="flex items-center">
                                    <FaThumbsDown className="mr-1 text-red-500" />
                                    {review.dislikes?.length || 0} dislikes
                                  </span>
                                  <span className="flex items-center">
                                    Product:{" "}
                                    {review.productId?.name ||
                                      "Unknown Product"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="py-2 px-4 sm:p-4 sm:border-l border-t sm:border-t-0 border-gray-200 bg-gray-50 flex sm:flex-col sm:justify-center gap-2 flex-wrap">
                            <button
                              className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                              onClick={() =>
                                setReviewDetailModal({ open: true, review })
                              }
                            >
                              <FaEye className="mr-1" /> View
                            </button>

                            <button
                              className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg ${
                                review.isHidden
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "bg-amber-600 text-white hover:bg-amber-700"
                              } transition-colors`}
                              onClick={() => {
                                if (review.isHidden) {
                                  // Unhide immediately
                                  toggleReviewVisibility(review._id, true);
                                } else {
                                  // Open modal to get reason
                                  setReviewDetailModal({ open: true, review });
                                  setHideReasonText("");
                                }
                              }}
                            >
                              {review.isHidden ? (
                                <FaEye className="mr-1" />
                              ) : (
                                <FaEyeSlash className="mr-1" />
                              )}
                              {review.isHidden ? "Unhide" : "Hide"}
                            </button>

                            <button
                              className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                              onClick={() =>
                                setDeleteConfirmModal({
                                  open: true,
                                  reviewId: review._id,
                                })
                              }
                              disabled={
                                deleteLoading && deletingReviewId === review._id
                              }
                            >
                              {deleteLoading &&
                              deletingReviewId === review._id ? (
                                <>
                                  <FaSpinner className="mr-1 animate-spin" />{" "}
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <FaTrash className="mr-1" /> Delete
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reported Reviews Tab */}
            {activeTab === "reported" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Reported Reviews{" "}
                  <span className="text-gray-500 font-normal">
                    ({reportedReviews.length})
                  </span>
                </h2>

                {reportedReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <FaExclamationTriangle className="mx-auto text-gray-300 text-4xl mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No reported reviews
                    </h3>
                    <p className="text-gray-500">
                      All clear! There are no reviews that have been reported.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reportedReviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                      >
                        <div className="bg-red-50 border-b border-red-200 p-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-red-800 flex items-center">
                              <FaExclamationTriangle className="mr-2 text-red-600" />
                              {review.reports.length}{" "}
                              {review.reports.length === 1
                                ? "Report"
                                : "Reports"}
                            </h3>
                            <div className="flex items-center gap-2">
                              <button
                                className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                onClick={() =>
                                  setReviewDetailModal({ open: true, review })
                                }
                              >
                                <FaEye className="mr-1" /> View Details
                              </button>
                              <button
                                className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                onClick={() =>
                                  setDeleteConfirmModal({
                                    open: true,
                                    reviewId: review._id,
                                  })
                                }
                                disabled={
                                  deleteLoading &&
                                  deletingReviewId === review._id
                                }
                              >
                                {deleteLoading &&
                                deletingReviewId === review._id ? (
                                  <>
                                    <FaSpinner className="mr-1 animate-spin" />{" "}
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <FaTrash className="mr-1" /> Delete Review
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="mt-2 space-y-2">
                            {review.reports.slice(0, 2).map((report, index) => (
                              <div
                                key={index}
                                className="bg-white p-2 rounded-lg border border-red-100 text-sm"
                              >
                                <div className="flex justify-between text-gray-700">
                                  <span className="font-medium">
                                    {report.reportedBy?.name || "User"}:
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {format(
                                      new Date(report.reportedAt),
                                      "MMM d, yyyy"
                                    )}
                                  </span>
                                </div>
                                <div className="mt-1">
                                  <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                                    {report.reason}
                                  </span>
                                  {report.description && (
                                    <p className="mt-1 text-gray-600">
                                      {report.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}

                            {review.reports.length > 2 && (
                              <button
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                onClick={() =>
                                  setReviewDetailModal({ open: true, review })
                                }
                              >
                                Show {review.reports.length - 2} more{" "}
                                {review.reports.length - 2 === 1
                                  ? "report"
                                  : "reports"}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <FaUser className="text-white" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900">
                                  {review.isAnonymous
                                    ? "Anonymous"
                                    : review.userId?.name || "User"}
                                </span>

                                {review.isVerifiedPurchase && (
                                  <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-100">
                                    ✓ Verified
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center mt-1 mb-2">
                                <div className="flex mr-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                      key={star}
                                      className={
                                        star <= review.rating
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }
                                      size={16}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {format(
                                    new Date(review.createdAt),
                                    "MMM d, yyyy"
                                  )}
                                </span>
                              </div>

                              {review.title && (
                                <h4 className="font-medium text-gray-900 mb-1">
                                  {review.title}
                                </h4>
                              )}

                              <p className="text-gray-700 text-sm">
                                {review.text}
                              </p>

                              {review.images?.length > 0 && (
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                  {review.images.map((image, index) => (
                                    <div
                                      key={index}
                                      className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-gray-200 cursor-pointer transform transition-transform hover:scale-105"
                                      onClick={() =>
                                        openImageModal(
                                          image.url || image,
                                          review.images,
                                          index
                                        )
                                      }
                                    >
                                      <img
                                        src={image.url || image}
                                        alt={`Review ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <FaThumbsUp className="mr-1 text-green-500" />
                                  {review.likes?.length || 0} likes
                                </span>
                                <span className="flex items-center">
                                  <FaThumbsDown className="mr-1 text-red-500" />
                                  {review.dislikes?.length || 0} dislikes
                                </span>
                                <span className="flex items-center">
                                  Product:{" "}
                                  {review.productId?.name || "Unknown Product"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Product Analysis Tab */}
            {activeTab === "products" && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Product Review Analysis
                </h2>

                <div className="mb-6">
                  {/* Product search for analysis tab */}
                  <div className="relative min-w-[300px] max-w-lg">
                    <div className="relative mb-2">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                      />
                    </div>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      <option value="all">All Products</option>
                      {filteredProducts.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {productAnalytics
                    .filter(
                      (product) =>
                        selectedProduct === "all" ||
                        product.id === selectedProduct
                    )
                    .map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
                      >
                        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                          <h3
                            className="font-semibold text-lg text-gray-800 truncate"
                            title={product.name}
                          >
                            {product.name}
                          </h3>
                        </div>

                        <div className="p-5 space-y-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm text-gray-500">
                                Total Reviews
                              </p>
                              <p className="text-2xl font-bold text-gray-800">
                                {product.totalReviews}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Avg Rating
                              </p>
                              <div className="flex items-center">
                                <p className="text-2xl font-bold text-gray-800 mr-2">
                                  {product.averageRating.toFixed(1)}
                                </p>
                                <FaStar className="text-yellow-400" />
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500">
                                Rating Distribution
                              </span>
                            </div>
                            <div className="space-y-2">
                              {[5, 4, 3, 2, 1].map((rating) => {
                                const count =
                                  product.ratingDistribution[rating] || 0;
                                const percentage =
                                  product.totalReviews > 0
                                    ? (count / product.totalReviews) * 100
                                    : 0;

                                return (
                                  <div
                                    key={rating}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="flex items-center w-8">
                                      <span className="text-sm text-gray-700">
                                        {rating}
                                      </span>
                                      <FaStar
                                        className="text-yellow-400 ml-1"
                                        size={10}
                                      />
                                    </div>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          rating >= 4
                                            ? "bg-green-500"
                                            : rating >= 3
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                        } transition-all duration-500 ease-out`}
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-500 w-8 text-right">
                                      {count}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-3 hover:shadow-md transition-all duration-300">
                              <p className="text-xs text-blue-700 mb-1">
                                With Images
                              </p>
                              <div className="flex items-end">
                                <p className="text-xl font-bold text-gray-800">
                                  {product.withImages}
                                </p>
                                <p className="text-xs text-gray-500 ml-1 mb-0.5">
                                  ({Math.round(product.imagePercentage)}%)
                                </p>
                              </div>
                            </div>

                            <div className="bg-green-50 rounded-lg p-3 hover:shadow-md transition-all duration-300">
                              <p className="text-xs text-green-700 mb-1">
                                Verified
                              </p>
                              <div className="flex items-end">
                                <p className="text-xl font-bold text-gray-800">
                                  {product.verified}
                                </p>
                                <p className="text-xs text-gray-500 ml-1 mb-0.5">
                                  ({Math.round(product.verifiedPercentage)}%)
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-all duration-300">
                            <div className="flex justify-between">
                              <div>
                                <p className="text-xs text-gray-700 mb-1">
                                  Likes
                                </p>
                                <p className="text-base font-semibold text-green-600">
                                  {product.likes}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-700 mb-1">
                                  Dislikes
                                </p>
                                <p className="text-base font-semibold text-red-600">
                                  {product.dislikes}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-700 mb-1">
                                  Reports
                                </p>
                                <p className="text-base font-semibold text-amber-600">
                                  {product.reports}
                                </p>
                              </div>
                            </div>
                          </div>

                          <button
                            className="w-full py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-all"
                            onClick={() => {
                              setSelectedProduct(product.id);
                              setActiveTab("reviews");
                            }}
                          >
                            View All Reviews
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {selectedProduct !== "all" && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {products.find((p) => p._id === selectedProduct)
                          ?.name || "Product"}{" "}
                        Reviews
                      </h3>
                    </div>

                    <div className="p-5">
                      {filteredReviews.length === 0 ? (
                        <div className="text-center py-8">
                          <FaStar className="mx-auto text-gray-300 text-4xl mb-4" />
                          <p className="text-gray-500">
                            No reviews found for this product
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {filteredReviews.slice(0, 5).map((review) => (
                            <div
                              key={review._id}
                              className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0 hover:bg-gray-50 p-3 rounded-lg transition-colors"
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mr-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <FaUser className="text-white" />
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center flex-wrap gap-2">
                                    <span className="font-semibold text-gray-900">
                                      {review.isAnonymous
                                        ? "Anonymous"
                                        : review.userId?.name || "User"}
                                    </span>

                                    {review.isVerifiedPurchase && (
                                      <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-100">
                                        ✓ Verified
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center mt-1 mb-2">
                                    <div className="flex mr-2">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                          key={star}
                                          className={
                                            star <= review.rating
                                              ? "text-yellow-400"
                                              : "text-gray-300"
                                          }
                                          size={16}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {format(
                                        new Date(review.createdAt),
                                        "MMM d, yyyy"
                                      )}
                                    </span>
                                  </div>

                                  {review.title && (
                                    <h4 className="font-medium text-gray-900 mb-1">
                                      {review.title}
                                    </h4>
                                  )}

                                  <p className="text-gray-700 text-sm">
                                    {review.text?.length > 150
                                      ? `${review.text.slice(0, 150)}...`
                                      : review.text}
                                  </p>
                                </div>

                                <button
                                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                                  onClick={() =>
                                    setReviewDetailModal({ open: true, review })
                                  }
                                >
                                  <FaEye />
                                </button>
                              </div>
                            </div>
                          ))}

                          {filteredReviews.length > 5 && (
                            <div className="text-center pt-2">
                              <button
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                onClick={() => setActiveTab("reviews")}
                              >
                                View All {filteredReviews.length} Reviews
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Detail Modal */}
      <Dialog
        open={reviewDetailModal.open}
        onClose={() => setReviewDetailModal({ open: false, review: null })}
        maxWidth="md"
        fullWidth
      >
        {reviewDetailModal.review && (
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Review Details
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() =>
                  setReviewDetailModal({ open: false, review: null })
                }
              >
                <FaTimes />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <FaUser className="text-white" size={20} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <span className="font-semibold text-gray-900">
                      {reviewDetailModal.review.isAnonymous
                        ? "Anonymous"
                        : reviewDetailModal.review.userId?.name || "User"}
                    </span>

                    {reviewDetailModal.review.isVerifiedPurchase && (
                      <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-100">
                        ✓ Verified Purchase
                      </span>
                    )}

                    {reviewDetailModal.review.isHidden && (
                      <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full border border-red-100">
                        Hidden
                      </span>
                    )}
                  </div>

                  <div className="flex items-center mb-3">
                    <div className="flex mr-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={
                            star <= reviewDetailModal.review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                          size={18}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(
                        new Date(reviewDetailModal.review.createdAt),
                        "MMMM d, yyyy"
                      )}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">
                      Product:{" "}
                      {reviewDetailModal.review.productId?.name ||
                        "Unknown Product"}
                    </p>
                  </div>

                  {reviewDetailModal.review.title && (
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {reviewDetailModal.review.title}
                    </h3>
                  )}

                  <p className="text-gray-700">
                    {reviewDetailModal.review.text}
                  </p>

                  {reviewDetailModal.review.images?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Review Images ({reviewDetailModal.review.images.length})
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {reviewDetailModal.review.images.map((image, index) => (
                          <div
                            key={index}
                            className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer transform transition-transform hover:scale-105"
                            onClick={() =>
                              openImageModal(
                                image.url || image,
                                reviewDetailModal.review.images,
                                index
                              )
                            }
                          >
                            <img
                              src={image.url || image}
                              alt={`Review ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center text-gray-600">
                      <FaThumbsUp className="mr-1 text-green-600" />
                      <span>
                        {reviewDetailModal.review.likes?.length || 0} likes
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaThumbsDown className="mr-1 text-red-600" />
                      <span>
                        {reviewDetailModal.review.dislikes?.length || 0}{" "}
                        dislikes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {reviewDetailModal.review.response && !editingResponse ? (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-800">
                    Admin Response
                  </h3>
                  <button
                    onClick={() =>
                      startEditResponse(reviewDetailModal.review.response.text)
                    }
                    className="text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <FaEdit className="mr-1" /> Edit Response
                  </button>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <p className="text-gray-700">
                    {reviewDetailModal.review.response.text}
                  </p>
                  <div className="mt-2 text-sm text-gray-500">
                    Responded by:{" "}
                    {reviewDetailModal.review.response.respondedBy?.name ||
                      "Admin"}{" "}
                    •{" "}
                    {format(
                      new Date(reviewDetailModal.review.response.respondedAt),
                      "MMM d, yyyy"
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {editingResponse ? "Edit Response" : "Add Response"}
                </h3>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Write your response to this review..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                ></textarea>
                <div className="flex space-x-2 mt-2">
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    onClick={() =>
                      updateResponse(
                        reviewDetailModal.review._id,
                        !reviewDetailModal.review.response
                      )
                    }
                  >
                    <FaSave className="inline mr-1" />{" "}
                    {editingResponse ? "Update Response" : "Submit Response"}
                  </button>
                  {editingResponse && (
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                      onClick={() => {
                        setResponseText("");
                        setEditingResponse(false);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}

            {reviewDetailModal.review.reports?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Reports ({reviewDetailModal.review.reports.length})
                </h3>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <div className="space-y-3">
                    {reviewDetailModal.review.reports.map((report, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-lg border border-red-50"
                      >
                        <div className="flex justify-between text-gray-800">
                          <span className="font-medium">
                            {report.reportedBy?.name || "User"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(report.reportedAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                            {report.reason}
                          </span>
                          {report.description && (
                            <p className="mt-2 text-sm text-gray-600">
                              {report.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {reviewDetailModal.review.isHidden &&
              reviewDetailModal.review.hiddenReason && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Hide Reason
                  </h3>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="text-gray-700">
                      {reviewDetailModal.review.hiddenReason}
                    </p>
                    {reviewDetailModal.review.hiddenAt && (
                      <div className="mt-2 text-sm text-gray-500">
                        Hidden on:{" "}
                        {format(
                          new Date(reviewDetailModal.review.hiddenAt),
                          "MMM d, yyyy"
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

            {!reviewDetailModal.review.isHidden && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Hide Review
                </h3>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  placeholder="Reason for hiding this review..."
                  value={hideReasonText}
                  onChange={(e) => setHideReasonText(e.target.value)}
                ></textarea>
                <button
                  className="mt-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                  onClick={() =>
                    toggleReviewVisibility(reviewDetailModal.review._id, false)
                  }
                >
                  <FaEyeSlash className="inline mr-1" /> Hide Review
                </button>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                onClick={() =>
                  setDeleteConfirmModal({
                    open: true,
                    reviewId: reviewDetailModal.review._id,
                  })
                }
                disabled={
                  deleteLoading &&
                  deletingReviewId === reviewDetailModal.review._id
                }
              >
                {deleteLoading &&
                deletingReviewId === reviewDetailModal.review._id ? (
                  <>
                    <FaSpinner className="inline mr-1 animate-spin" />{" "}
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="inline mr-1" /> Delete Review
                  </>
                )}
              </button>

              {reviewDetailModal.review.isHidden && (
                <button
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  onClick={() =>
                    toggleReviewVisibility(reviewDetailModal.review._id, true)
                  }
                >
                  <FaEye className="inline mr-1" /> Unhide Review
                </button>
              )}

              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() =>
                  setReviewDetailModal({ open: false, review: null })
                }
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirmModal.open}
        onClose={() => setDeleteConfirmModal({ open: false, reviewId: null })}
        maxWidth="xs"
        fullWidth
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <FaTrash className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Delete Review</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete this review? This action cannot be
              undone. All associated images will also be deleted from
              Cloudinary.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
              onClick={() =>
                setDeleteConfirmModal({ open: false, reviewId: null })
              }
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
              onClick={() =>
                deleteConfirmModal.reviewId &&
                deleteReview(deleteConfirmModal.reviewId)
              }
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="mr-2" />
                  Yes, Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Full Screen Image Modal */}
      <Dialog
        open={imageModal.open}
        onClose={() =>
          setImageModal({ open: false, url: "", images: [], index: 0 })
        }
        fullScreen
        PaperProps={{
          style: { backgroundColor: "rgba(0, 0, 0, 0.95)", overflow: "hidden" },
        }}
      >
        <div className="h-screen w-screen flex flex-col relative overflow-hidden">
          <button
            className="absolute top-4 right-4 z-50 bg-white/10 rounded-full p-2 text-white hover:bg-white/20 transition-all"
            onClick={() =>
              setImageModal({ open: false, url: "", images: [], index: 0 })
            }
          >
            <FaTimes size={24} />
          </button>

          <div className="absolute inset-0 flex items-center justify-center">
            {imageModal.images.length > 1 ? (
              <div className="w-full h-full">
                <Swiper
                  slidesPerView={1}
                  initialSlide={imageModal.index}
                  pagination={{ clickable: true, type: "fraction" }}
                  modules={[Zoom, Pagination]}
                  zoom={{ maxRatio: 3 }}
                  className="h-full"
                >
                  {imageModal.images.map((img, idx) => (
                    <SwiperSlide
                      key={idx}
                      className="h-full flex items-center justify-center"
                    >
                      <div className="swiper-zoom-container">
                        <img
                          src={img.url || img}
                          alt={`Review image ${idx + 1}`}
                          className="max-h-screen max-w-screen object-contain"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={imageModal.url}
                  alt="Review image"
                  className="max-h-screen max-w-screen object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ReviewsAdmin;
