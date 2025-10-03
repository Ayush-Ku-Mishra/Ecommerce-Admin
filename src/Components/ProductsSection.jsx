import React from "react";
import { RiArrowDropDownFill, RiArrowDropUpFill } from "react-icons/ri";
import { useEffect, useRef, useState } from "react";
import {
  FaSearch,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Checkbox from "@mui/material/Checkbox";
import { Link, useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import Rating from "@mui/material/Rating";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import TablePagination from "@mui/material/TablePagination";
import AddProduct from "./AddProduct";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";

const ROWS_PER_PAGE = 5;

const ProductsSection = () => {
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Product data state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  // Dropdown states
  const [isOpen, setIsOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [isThirdOpen, setIsThirdOpen] = useState(false);
  const [isFourthOpen, setIsFourthOpen] = useState(false);

  // Filter states
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [thirdLevelCategory, setThirdLevelCategory] = useState("");
  const [fourthLevelCategory, setFourthLevelCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Category data states
  const [categories, setCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [allThirdLevelCategories, setAllThirdLevelCategories] = useState([]);
  const [allFourthLevelCategories, setAllFourthLevelCategories] = useState([]);

  // Modal and action states
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    productId: null,
    productName: "",
    type: "single",
  });
  const [deletingProducts, setDeletingProducts] = useState(new Set());
  const [imageModal, setImageModal] = useState({
    open: false,
    images: [],
    currentIndex: 0,
  });

  const categoryRef = useRef(null);
  const subCategoryRef = useRef(null);
  const thirdCategoryRef = useRef(null);
  const fourthCategoryRef = useRef(null);

  const anySelected = Object.values(selected).some(Boolean);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Filter products when filters change
  useEffect(() => {
    applyFilters();
  }, [
    products,
    category,
    subcategory,
    thirdLevelCategory,
    fourthLevelCategory,
    searchTerm,
  ]);

  const fetchCategories = async () => {
    try {
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
        const fourthLevelCategories = [];

        // Second level categories (direct children of main categories)
        subCats.forEach((cat) => {
          const parentIsMain = mainCategories.some(
            (mainCat) => mainCat._id === cat.parentId
          );
          if (parentIsMain) {
            secondLevelCategories.push(cat);
          }
        });

        // Third level categories (direct children of second level categories)
        subCats.forEach((cat) => {
          const parentIsSecondLevel = secondLevelCategories.some(
            (secondCat) => secondCat._id === cat.parentId
          );
          if (parentIsSecondLevel) {
            thirdLevelCategories.push(cat);
          }
        });

        // Fourth level categories (direct children of third level categories)
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
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log(
        "Fetching products from:",
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/product/getAllProducts`
      );

      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/product/getAllProducts?page=1&perPage=1000`,
        {
          withCredentials: true,
          timeout: 10000, // 10 second timeout
        }
      );

      console.log("Response received:", response);

      if (response.data.success) {
        setProducts(response.data.products || []);
        setTotalProducts(response.data.products?.length || 0);
      } else {
        console.error("API returned success: false", response.data);
        toast.error(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);

      if (error.code === "ECONNABORTED") {
        toast.error("Request timeout - please check your connection");
      } else if (error.response) {
        console.error(
          "Response error:",
          error.response.status,
          error.response.data
        );
        toast.error(
          `Server error: ${error.response.status} - ${error.response.statusText}`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error(
          "No response from server - please check if backend is running"
        );
      } else {
        console.error("Request setup error:", error.message);
        toast.error("Failed to fetch products");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const applyFilters = () => {
    let filtered = [...products];

    // Filter by category
    if (category && category !== "None") {
      const selectedCat = categories.find((cat) => cat.name === category);
      if (selectedCat) {
        filtered = filtered.filter(
          (product) => product.categoryId === selectedCat._id
        );
      }
    }

    // Filter by subcategory
    if (subcategory && subcategory !== "None") {
      const selectedSubCat = allSubCategories.find(
        (subCat) => subCat.name === subcategory
      );
      if (selectedSubCat) {
        filtered = filtered.filter(
          (product) => product.subCatId === selectedSubCat._id
        );
      }
    }

    // Filter by third level category
    if (thirdLevelCategory && thirdLevelCategory !== "None") {
      const selectedThirdCat = allThirdLevelCategories.find(
        (thirdCat) => thirdCat.name === thirdLevelCategory
      );
      if (selectedThirdCat) {
        filtered = filtered.filter(
          (product) => product.thirdSubCatId === selectedThirdCat._id
        );
      }
    }

    // Filter by fourth level category
    if (fourthLevelCategory && fourthLevelCategory !== "None") {
      const selectedFourthCat = allFourthLevelCategories.find(
        (fourthCat) => fourthCat.name === fourthLevelCategory
      );
      if (selectedFourthCat) {
        filtered = filtered.filter(
          (product) => product.fourthSubCatId === selectedFourthCat._id
        );
      }
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product._id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  // Clear all other filters when one filter is selected
  const clearOtherFilters = (keepFilter) => {
    if (keepFilter !== "category") setCategory("");
    if (keepFilter !== "subcategory") setSubcategory("");
    if (keepFilter !== "thirdLevel") setThirdLevelCategory("");
    if (keepFilter !== "fourthLevel") setFourthLevelCategory("");
    if (keepFilter !== "search") setSearchTerm("");
  };

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (
        subCategoryRef.current &&
        !subCategoryRef.current.contains(event.target)
      ) {
        setIsSubOpen(false);
      }
      if (
        thirdCategoryRef.current &&
        !thirdCategoryRef.current.contains(event.target)
      ) {
        setIsThirdOpen(false);
      }
      if (
        fourthCategoryRef.current &&
        !fourthCategoryRef.current.contains(event.target)
      ) {
        setIsFourthOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const toggleSubDropdown = () => setIsSubOpen((prev) => !prev);
  const toggleThirdDropdown = () => setIsThirdOpen((prev) => !prev);
  const toggleFourthDropdown = () => setIsFourthOpen((prev) => !prev);

  // Updated category selections with filter clearing
  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setIsOpen(false);
    if (selectedCategory) {
      clearOtherFilters("category");
    }
  };

  const handleSubCategorySelect = (selectedSubCategory) => {
    setSubcategory(selectedSubCategory);
    setIsSubOpen(false);
    if (selectedSubCategory) {
      clearOtherFilters("subcategory");
    }
  };

  const handleThirdCategorySelect = (selectedThirdCategory) => {
    setThirdLevelCategory(selectedThirdCategory);
    setIsThirdOpen(false);
    if (selectedThirdCategory) {
      clearOtherFilters("thirdLevel");
    }
  };

  const handleFourthCategorySelect = (selectedFourthCategory) => {
    setFourthLevelCategory(selectedFourthCategory);
    setIsFourthOpen(false);
    if (selectedFourthCategory) {
      clearOtherFilters("fourthLevel");
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      clearOtherFilters("search");
    }
  };

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      const newSelected = {};
      filteredProducts.forEach((_, idx) => {
        newSelected[idx] = true;
      });
      setSelected(newSelected);
    } else {
      setSelected({});
    }
  };

  const handleSelect = (idx) => (event) => {
    setSelected((prev) => ({ ...prev, [idx]: event.target.checked }));
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRows = parseInt(event.target.value, 10);
    setRowsPerPage(newRows);
    setPage(0);
  };

  // Action handlers
  const handleEdit = (productId) => {
    setEditProductId(productId);
    setIsAddProductOpen(true);
  };

  const handleView = (productId) => {
    // Navigate to product details view page
    navigate(`/product/${productId}`);
  };

  const handleDeleteClick = (productId, productName) => {
    setDeleteDialog({
      open: true,
      productId,
      productName: productName || "this product",
      type: "single",
    });
  };

  const handleDeleteSelectedClick = () => {
    const selectedCount = Object.values(selected).filter(Boolean).length;
    setDeleteDialog({
      open: true,
      productId: null,
      productName: `${selectedCount} selected product(s)`,
      type: "multiple",
    });
  };

  const handleDeleteConfirm = async () => {
    const { productId, type } = deleteDialog;

    if (type === "single") {
      // Delete single product
      setDeletingProducts((prev) => new Set([...prev, productId]));

      try {
        await axios.delete(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/product/deleteProduct/${productId}`,
          { withCredentials: true }
        );

        toast.success("Product deleted successfully");
        fetchProducts(); // Refresh the product list
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      } finally {
        setDeletingProducts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    } else {
      // Delete multiple products
      const selectedProductIds = Object.keys(selected)
        .filter((key) => selected[key])
        .map((key) => filteredProducts[parseInt(key)]._id);

      if (selectedProductIds.length === 0) return;

      try {
        setLoading(true);
        await Promise.all(
          selectedProductIds.map((productId) =>
            axios.delete(
              `${
                import.meta.env.VITE_BACKEND_URL
              }/api/v1/product/deleteProduct/${productId}`,
              { withCredentials: true }
            )
          )
        );

        toast.success("Selected products deleted successfully");
        setSelected({});
        setSelectAll(false);
        fetchProducts(); // Refresh the product list
      } catch (error) {
        console.error("Error deleting products:", error);
        toast.error("Failed to delete products");
      } finally {
        setLoading(false);
      }
    }

    setDeleteDialog({
      open: false,
      productId: null,
      productName: "",
      type: "single",
    });
  };

  const handleImageClick = (images, currentIndex) => {
    setImageModal({ open: true, images, currentIndex });
  };

  const handleProductNameClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleProductAdded = () => {
    fetchProducts(); // Refresh products when a new product is added
    setEditProductId(null); // Clear edit mode
  };

  const handleModalClose = () => {
    setIsAddProductOpen(false);
    setEditProductId(null);
  };

  // Calculate pagination for filtered products
  const pagedData = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between px-2 mb-5">
        <p className="text-[18px] font-semibold text-gray-800">
          Products ({filteredProducts.length})
        </p>
        <div className="flex items-center gap-2">
          {anySelected && (
            <button
              onClick={handleDeleteSelectedClick}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 px-4 py-1 text-[14px] rounded-sm font-semibold text-white shadow-sm disabled:opacity-50"
            >
              DELETE SELECTED
            </button>
          )}
          <button
            onClick={() => {
              setEditProductId(null);
              setIsAddProductOpen(true);
            }}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-1 text-[14px] rounded-sm font-semibold text-white disabled:opacity-50"
          >
            ADD PRODUCT
          </button>
        </div>
      </div>

      <div className="bg-white rounded-md min-w-0 overflow-hidden shadow-md">
        {/* Filter Section */}
        <div className="p-4 border-b border-gray-200">
          {/* Category Filters in One Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 min-w-0">
            {/* Category Dropdown */}
            <div className="relative w-full z-60" ref={categoryRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={category}
                  onClick={toggleDropdown}
                  readOnly
                  placeholder="Select category"
                  className="border border-gray-300 placeholder:text-sm rounded-md px-3 pr-8 py-2 w-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                />
                <div className="absolute right-3 top-3 text-gray-400 text-lg pointer-events-none">
                  {isOpen ? <RiArrowDropUpFill /> : <RiArrowDropDownFill />}
                </div>
                {isOpen && (
                  <ul className="absolute top-12 left-0 w-full bg-white shadow-lg rounded-md border border-gray-200 z-[80] max-h-48 overflow-y-auto">
                    <li
                      onClick={() => handleCategorySelect("")}
                      className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                    >
                      All Categories
                    </li>
                    {categories.map((cat) => (
                      <li
                        key={cat._id}
                        onClick={() => handleCategorySelect(cat.name)}
                        className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                      >
                        {cat.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Sub Category Dropdown */}
            <div className="relative w-full z-60" ref={subCategoryRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Category
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={subcategory}
                  onClick={toggleSubDropdown}
                  readOnly
                  placeholder="Select subcategory"
                  className="border border-gray-300 placeholder:text-sm rounded-md px-3 pr-8 py-2 w-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                />
                <div className="absolute right-3 top-3 text-gray-400 text-lg pointer-events-none">
                  {isSubOpen ? <RiArrowDropUpFill /> : <RiArrowDropDownFill />}
                </div>
                {isSubOpen && (
                  <ul className="absolute top-12 left-0 w-full bg-white shadow-lg rounded-md border border-gray-200 z-[80] max-h-48 overflow-y-auto">
                    <li
                      onClick={() => handleSubCategorySelect("")}
                      className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                    >
                      All Subcategories
                    </li>
                    {allSubCategories.map((subCat) => (
                      <li
                        key={subCat._id}
                        onClick={() => handleSubCategorySelect(subCat.name)}
                        className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                      >
                        {subCat.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Third Level Category Dropdown */}
            <div className="relative w-full z-60" ref={thirdCategoryRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Third Level
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={thirdLevelCategory}
                  onClick={toggleThirdDropdown}
                  readOnly
                  placeholder="Select third level"
                  className="border border-gray-300 placeholder:text-sm rounded-md px-3 pr-8 py-2 w-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                />
                <div className="absolute right-3 top-3 text-gray-400 text-lg pointer-events-none">
                  {isThirdOpen ? (
                    <RiArrowDropUpFill />
                  ) : (
                    <RiArrowDropDownFill />
                  )}
                </div>
                {isThirdOpen && (
                  <ul className="absolute top-12 left-0 w-full bg-white shadow-lg rounded-md border border-gray-200 z-[80] max-h-48 overflow-y-auto">
                    <li
                      onClick={() => handleThirdCategorySelect("")}
                      className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                    >
                      All Third Level
                    </li>
                    {allThirdLevelCategories.map((thirdCat) => (
                      <li
                        key={thirdCat._id}
                        onClick={() => handleThirdCategorySelect(thirdCat.name)}
                        className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                      >
                        {thirdCat.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Fourth Level Category Dropdown */}
            <div className="relative w-full z-60" ref={fourthCategoryRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fourth Level
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fourthLevelCategory}
                  onClick={toggleFourthDropdown}
                  readOnly
                  placeholder="Select fourth level"
                  className="border border-gray-300 placeholder:text-sm rounded-md px-3 pr-8 py-2 w-full bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                />
                <div className="absolute right-3 top-3 text-gray-400 text-lg pointer-events-none">
                  {isFourthOpen ? (
                    <RiArrowDropUpFill />
                  ) : (
                    <RiArrowDropDownFill />
                  )}
                </div>
                {isFourthOpen && (
                  <ul className="absolute top-12 left-0 w-full bg-white shadow-lg rounded-md border border-gray-200 z-[80] max-h-48 overflow-y-auto">
                    <li
                      onClick={() => handleFourthCategorySelect("")}
                      className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                    >
                      All Fourth Level
                    </li>
                    {allFourthLevelCategories.map((fourthCat) => (
                      <li
                        key={fourthCat._id}
                        onClick={() =>
                          handleFourthCategorySelect(fourthCat.name)
                        }
                        className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                      >
                        {fourthCat.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Search Input - Centered Below */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search by name, brand, or product ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="border border-gray-300 rounded-md px-4 pl-10 py-2 w-full bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="mt-0 min-w-0 w-full">
          <div className="w-full h-[400px] overflow-x-auto custom-scrollbar">
            <table
              className="min-w-[700px] w-full text-xs md:text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
              style={{ width: "100%" }}
            >
              <thead className="text-xs md:text-sm text-gray-600 uppercase bg-[#f1f1f1] sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-2 py-0 md:px-6" width="8%">
                    <div className="w-[40px] md:w-[60px]">
                      <Checkbox
                        {...label}
                        size="small"
                        checked={selectAll}
                        indeterminate={false}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-0 py-0 whitespace-nowrap">
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    Product ID
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    SUB CATEGORY
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    THIRD LEVEL
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    FOURTH LEVEL
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    PRICE
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    SALES
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    STOCK
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    RATING
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="11" className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                        <span className="text-gray-500">
                          Loading products...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : pagedData.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FaSearch className="text-4xl mb-2 text-gray-300" />
                        <span>No products found</span>
                        {(category ||
                          subcategory ||
                          thirdLevelCategory ||
                          fourthLevelCategory ||
                          searchTerm) && (
                          <span className="text-sm mt-1">
                            Try adjusting your filters
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedData.map((product, idx) => {
                    const globalIdx = page * rowsPerPage + idx;
                    const isChecked = !!selected[globalIdx];
                    const isDeleting = deletingProducts.has(product._id);

                    return (
                      <tr
                        key={product._id}
                        className={`
                          border-b dark:border-gray-700 border-gray-200 
                          ${isChecked ? "bg-blue-50" : "hover:bg-gray-50"}
                        `}
                      >
                        <td className="px-2 py-2 md:px-6">
                          <div className="w-[40px] md:w-[60px]">
                            <Checkbox
                              {...label}
                              size="small"
                              checked={!!selected[globalIdx]}
                              onChange={handleSelect(globalIdx)}
                            />
                          </div>
                        </td>
                        <td className="px-0 py-2 min-w-[200px] md:min-w-[300px]">
                          <div className="flex items-center gap-2 md:gap-4 w-full">
                            <div
                              className="w-[40px] h-[40px] md:w-[65px] md:h-[65px] rounded-md overflow-hidden group cursor-pointer"
                              onClick={() =>
                                handleImageClick(product.images || [], 0)
                              }
                            >
                              <img
                                src={
                                  product.images?.[0] ||
                                  "/placeholder-image.jpg"
                                }
                                alt={product.name}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-all"
                              />
                            </div>
                            <div className="w-auto">
                              <h3
                                className="font-[700] text-[11px] text-black hover:text-blue-500 transition cursor-pointer"
                                onClick={() =>
                                  handleProductNameClick(product._id)
                                }
                              >
                                {product.name?.substring(0, 50)}...
                              </h3>
                              <p className="text-[10px] md:text-[12px] text-gray-800">
                                {product.brand}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 md:px-6">
                          <p className="text-[12px] md:text-[13px] font-[400] text-gray-800">
                            {product._id}
                          </p>
                        </td>
                        <td className="px-2 py-2 md:px-6">
                          <p className="text-[12px] md:text-[13px] font-[400] text-gray-800">
                            {product.categoryName}
                          </p>
                        </td>
                        <td className="px-2 py-2 md:px-6">
                          <p className="text-[12px] md:text-[13px] font-[400] text-gray-800">
                            {product.subCatName || "-"}
                          </p>
                        </td>
                        <td className="px-2 py-2 md:px-6">
                          <p className="text-[12px] md:text-[13px] font-[400] text-gray-800">
                            {product.thirdSubCatName || "-"}
                          </p>
                        </td>
                        <td className="px-2 py-2 md:px-6">
                          <p className="text-[12px] md:text-[13px] font-[400] text-gray-800">
                            {product.fourthSubCatName || "-"}
                          </p>
                        </td>
                        <td className="px-2 py-2 md:px-6">
                          <div className="flex flex-col items-start">
                            <span className="line-through text-gray-500 text-[13px] md:text-[14px] leading-3 font-[500]">
                              ₹{product.oldPrice}.00
                            </span>
                            <span className="text-[13px] md:text-[14px] text-blue-500 font-[600]">
                              ₹{product.price}.00
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2 md:px-6">
                          <div className="flex flex-col items-start">
                            <span className="text-[13px] md:text-[14px] font-[600] text-green-600">
                              {product.sales || 0}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              units sold
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2 md:px-6">
                          <p className="text-[13px] md:text-[14px] font-[600] text-blue-500">
                            {product.stock}
                          </p>
                          <ProgressBar
                            value={Math.min((product.stock / 100) * 100, 100)}
                            type="success"
                          />
                        </td>
                        <td className="px-2 py-2 md:px-6">
                          <div className="flex items-center">
                            <Rating
                              name={`product-rating-${idx}`}
                              value={product.rating || 0}
                              precision={0.5}
                              size="small"
                              readOnly
                            />
                          </div>
                        </td>
                        <td className="px-2 py-2 md:px-6">
                          <div className="flex gap-2 pt-1 relative">
                            {isDeleting && (
                              <Backdrop
                                sx={{
                                  color: "#fff",
                                  zIndex: 1,
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  borderRadius: 1,
                                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                                }}
                                open={isDeleting}
                              >
                                <CircularProgress color="inherit" size={20} />
                              </Backdrop>
                            )}
                            <span
                              className="p-2 rounded-full transition hover:bg-gray-200 cursor-pointer"
                              onClick={() => handleEdit(product._id)}
                            >
                              <FaEdit
                                className="text-blue-500"
                                title="Edit"
                                size={16}
                              />
                            </span>
                            <span
                              className="p-2 rounded-full transition hover:bg-gray-200 cursor-pointer"
                              onClick={() => handleView(product._id)}
                            >
                              <FaEye
                                className="text-gray-700"
                                title="View"
                                size={17}
                              />
                            </span>
                            <span
                              className="p-2 rounded-full transition hover:bg-gray-200 cursor-pointer"
                              onClick={() =>
                                handleDeleteClick(product._id, product.name)
                              }
                            >
                              <FaTrash
                                className="text-red-500"
                                title="Delete"
                                size={15}
                              />
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredProducts.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, { label: "All", value: -1 }]}
            labelRowsPerPage="Rows per page:"
            sx={{ mt: 1 }}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({
            open: false,
            productId: null,
            productName: "",
            type: "single",
          })
        }
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {deleteDialog.type === "single"
              ? `Are you sure you want to delete "${deleteDialog.productName}"? This action cannot be undone.`
              : `Are you sure you want to delete ${deleteDialog.productName}? This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDeleteDialog({
                open: false,
                productId: null,
                productName: "",
                type: "single",
              })
            }
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Gallery Modal */}
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

      <AddProduct
        isOpen={isAddProductOpen}
        onClose={handleModalClose}
        onProductAdded={handleProductAdded}
        editProductId={editProductId}
      />
    </div>
  );
};

export default ProductsSection;
