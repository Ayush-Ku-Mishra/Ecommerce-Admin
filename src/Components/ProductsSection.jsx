import React from "react";
import { RiArrowDropDownFill, RiArrowDropUpFill } from "react-icons/ri";
import { useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import Rating from "@mui/material/Rating";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import TablePagination from "@mui/material/TablePagination";
import AddProduct from "./AddProduct";

const productData = [
  {
    img: "https://serviceapi.spicezgold.com/download/1753722939206_125c18d6-592d-4082-84e5-49707ae9a4fd1749366193911-Flying-Machine-Women-Wide-Leg-High-Rise-Light-Fade-Stretchab-1.jpg",
    name: "Women Wide Leg High-Rise Light Fade Stretchable Je",
    brand: "Flying Machine",
    category: "Fashion",
    subcategory: "Women",
    oldPrice: 999,
    price: 1200,
    sales: 0,
    stock: 7485,
    rating: 5,
  },
  {
    img: "https://serviceapi.spicezgold.com/download/1753722939206_125c18d6-592d-4082-84e5-49707ae9a4fd1749366193911-Flying-Machine-Women-Wide-Leg-High-Rise-Light-Fade-Stretchab-1.jpg",
    name: "Women Wide Leg High-Rise Light Fade Stretchable Je",
    brand: "Flying Machine",
    category: "Fashion",
    subcategory: "Women",
    oldPrice: 999,
    price: 1200,
    sales: 10,
    stock: 7485,
    rating: 5,
  },
  {
    img: "https://serviceapi.spicezgold.com/download/1753722939206_125c18d6-592d-4082-84e5-49707ae9a4fd1749366193911-Flying-Machine-Women-Wide-Leg-High-Rise-Light-Fade-Stretchab-1.jpg",
    name: "Women Wide Leg High-Rise Light Fade Stretchable Je",
    brand: "Flying Machine",
    category: "Fashion",
    subcategory: "Women",
    oldPrice: 999,
    price: 1200,
    sales: 15,
    stock: 7485,
    rating: 3,
  },
  {
    img: "https://serviceapi.spicezgold.com/download/1753721820703_flexfive-total-hair-wellness-shampoo-strengthen-and-restore-damaged-hair-deep-repair-and-long-lasting-smoothness-suitable-for-all-hair-types-300-ml-pack-of-2-product-images-orvfvqsttsj-p611363019-0-202504281.jpg",
    name: "B&B Bliss & Blush Apple Cider Vinegar For Women &",
    brand: "B&B BLISS & BLUSH",
    category: "Wellness",
    subcategory: "",
    oldPrice: 785,
    price: 899,
    sales: 11,
    stock: 78848,
    rating: 5,
  },
  {
    img: "https://serviceapi.spicezgold.com/download/1742452693161_wow-skin-science-rose-water-for-face-made-with-pure-kannauj-rose-extracts-use-it-as-toner-skin-hyderator-makeup-primer-100-ml-product-images-orvsfyevzsf-p600863991-0-202304241416.webp",
    name: "KA CAYLA Beauzy Makeup fixer spray & Tube primer",
    brand: "KA CAYLA",
    category: "Beauty",
    subcategory: "",
    oldPrice: 658,
    price: 785,
    sales: 20,
    stock: 8478,
    rating: 2,
  },
  {
    img: "https://serviceapi.spicezgold.com/download/1742463343586_file_1734530601190_inlife-super-reds-powder-200-g-prod-o1131152-p607840402-0-202402092238.jpg",
    name: "FLEXFIVE Total Hair Wellness Shampoo | Strengthen",
    brand: "FLEXFIVE",
    category: "Wellness",
    subcategory: "",
    oldPrice: 458,
    price: 895,
    sales: 7,
    stock: 4741,
    rating: 5,
  },
  {
    img: "https://serviceapi.spicezgold.com/download/1753713037073_reliance-jewels-22-kt-yellow-gold-ring-product-images-o30002158-p609667123-0-202408191218.webp",
    name: "JEWAR trendy jewellery set for girls lightweight j",
    brand: "JEWAR",
    category: "Jewellery",
    subcategory: "",
    oldPrice: 7999,
    price: 8999,
    sales: 0,
    stock: 200,
    rating: 4,
  },
  // ...add more products as desired
];

const ROWS_PER_PAGE = 5;

const ProductsSection = () => {
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [isSubSubOpen, setIsSubSubOpen] = useState(false);

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [subSubcategory, setSubSubcategory] = useState("");

  const categoryRef = useRef(null);
  const subCategoryRef = useRef(null);
  const subSubCategoryRef = useRef(null);

  const anySelected = Object.values(selected).some(Boolean);

  const categories = ["None", "Fashion", "Electronics", "Groceries", "Books"];
  const subcategories = [
    "None",
    "Fashion",
    "Electronics",
    "Groceries",
    "Books",
  ];
  const SubSubcategories = [
    "None",
    "Fashion",
    "Electronics",
    "Groceries",
    "Books",
  ];

  // Calculate pagination
  const pagedData = productData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
        subSubCategoryRef.current &&
        !subSubCategoryRef.current.contains(event.target)
      ) {
        setIsSubSubOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const toggleSubDropdown = () => setIsSubOpen((prev) => !prev);
  const toggleSubSubDropdown = () => setIsSubSubOpen((prev) => !prev);

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      // select all rows
      const newSelected = {};
      productData.forEach((_, idx) => {
        newSelected[idx] = true;
      });
      setSelected(newSelected);
    } else {
      // deselect all
      setSelected({});
    }
  };

  const handleSelect = (idx) => (event) => {
    setSelected((prev) => ({ ...prev, [idx]: event.target.checked }));
    // Do NOT update setSelectAll here
  };


  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRows = parseInt(event.target.value, 10);
    setRowsPerPage(newRows);
    setPage(0);
  };

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between px-2 mb-5">
        <p className="text-[18px] font-semibold text-gray-800">Products</p>
        <div className="flex items-center gap-2">
          {anySelected && (
            <button className="bg-red-500 px-4 py-1 text-[14px] rounded-sm font-semibold text-white shadow-sm">
              DELETE
            </button>
          )}
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="bg-blue-500 px-4 py-1 text-[14px] rounded-sm font-semibold text-white"
          >
            ADD PRODUCT
          </button>
        </div>
      </div>

      <div className="bg-white rounded-md min-w-0 overflow-hidden shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 min-w-0">
          {/* Category Dropdown */}
          <div
            className="flex flex-col gap-2 relative w-full z-60"
            ref={categoryRef}
          >
            <p className="font-semibold text-[15px]">Category By</p>
            <div className="relative">
              <input
                type="text"
                value={category}
                onClick={toggleDropdown}
                readOnly
                placeholder="Select a category"
                className="border border-gray-300 placeholder:text-sm rounded-sm px-3 pr-9 py-1 w-full bg-white placeholder-gray-500 focus:outline-none focus:border-2 focus:border-blue-400 cursor-pointer"
              />
              <div className="absolute right-2 top-2.5 text-gray-500 text-xl pointer-events-none">
                {isOpen ? <RiArrowDropUpFill /> : <RiArrowDropDownFill />}
              </div>
              {isOpen && (
                <ul className="absolute top-10 -left-6 min-w-[120%] bg-white shadow-md rounded-sm border border-gray-200 z-[80]">
                  {categories.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setCategory(item);
                        setIsOpen(false);
                      }}
                      className="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Sub Category Dropdown */}
          <div className="flex flex-col gap-2 w-full z-60">
            <p className="font-semibold text-[15px]">Sub Category By</p>
            <div className="relative" ref={subCategoryRef}>
              <input
                type="text"
                value={subcategory}
                onClick={toggleSubDropdown}
                readOnly
                placeholder="Select a subcategory"
                className="border border-gray-300 placeholder:text-sm rounded-sm px-3 pr-9 py-1 w-full bg-white placeholder-gray-500 focus:outline-none focus:border-2 focus:border-blue-400 cursor-pointer"
              />
              <div className="absolute right-2 top-2.5 text-gray-500 text-xl pointer-events-none">
                {isSubOpen ? <RiArrowDropUpFill /> : <RiArrowDropDownFill />}
              </div>
              {isSubOpen && (
                <ul className="absolute top-10 -left-6 min-w-[120%] bg-white shadow-md rounded-sm border border-gray-200 z-[80]">
                  {subcategories.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setSubcategory(item);
                        setIsSubOpen(false);
                      }}
                      className="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Third Level Subcategory Input */}
          <div
            className="flex flex-col gap-2 relative w-full z-60"
            ref={subSubCategoryRef}
          >
            <p className="font-semibold text-[15px]">
              Third Level Sub Category By
            </p>
            <div className="relative">
              <input
                type="text"
                value={subSubcategory}
                onClick={toggleSubSubDropdown}
                readOnly
                placeholder="Select a 3rd level subcategory"
                className="border border-gray-300 placeholder:text-sm rounded-sm px-3 pr-9 py-1 w-full bg-white placeholder-gray-500 focus:outline-none focus:border-2 focus:border-blue-400 cursor-pointer"
              />
              <div className="absolute right-2 top-2.5 text-gray-500 text-xl pointer-events-none">
                {isSubSubOpen ? <RiArrowDropUpFill /> : <RiArrowDropDownFill />}
              </div>
              {isSubSubOpen && (
                <ul className="absolute top-10 -left-6 min-w-[120%] bg-white shadow-md rounded-sm border border-gray-200 z-[80]">
                  {SubSubcategories.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setSubSubcategory(item);
                        setIsSubSubOpen(false);
                      }}
                      className="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Search Input */}
          <div className="w-full">
            <label className="opacity-0 select-none">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search here..."
                className="border border-gray-300 rounded-md px-10 py-2 w-full bg-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="mt-5 min-w-0 w-full">
          <div className="w-full h-[400px] overflow-x-auto custom-scrollbar">
            <table
              className="min-w-[700px] w-full text-xs md:text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
              style={{ width: "100%" }}
            >
              <thead className="text-xs md:text-sm text-gray-600 uppercase bg-[#f1f1f1] sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-2 py-0 md:px-6" width="10%">
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
                {productData.map((product, idx) => {
                  const globalIdx = page * rowsPerPage + idx;
                  const isChecked = !!selected[globalIdx];
                  return (
                    <tr
                      key={globalIdx}
                      className={`
                border-b dark:border-gray-700 border-gray-200 
                ${isChecked ? "bg-blue-50" : ""}
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
                          <div className="w-[40px] h-[40px] md:w-[65px] md:h-[65px] rounded-md overflow-hidden group">
                            <Link to="/product/4572">
                              <img
                                src={product.img}
                                alt={product.name}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-all"
                              />
                            </Link>
                          </div>
                          <div className="w-auto">
                            <h3 className="font-[700] text-[11px] text-black hover:text-blue-500 transition">
                              <Link to="/product/4572">{product.name}</Link>
                            </h3>
                            <p className="text-[10px] md:text-[12px] text-gray-800">
                              {product.brand}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 md:px-6">
                        <p className="text-[12px] md:text-[13px] font-[400] text-gray-800">
                          {product.category}
                        </p>
                      </td>
                      <td className="px-2 py-2 md:px-6">
                        <p className="text-[12px] md:text-[13px] font-[400] text-gray-800">
                          {product.subcategory}
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
                        <p className="text-[13px] md:text-[14px] w-[50px] md:w-[70px] font-[400] text-gray-800">
                          <span className="font-[600] text-black text-[13px] md:text-[14px]">
                            {product.sales}
                          </span>{" "}
                          Sale
                        </p>
                      </td>
                      <td className="px-2 py-2 md:px-6">
                        <p className="text-[13px] md:text-[14px] font-[600] text-blue-500">
                          {product.stock}
                        </p>
                        <ProgressBar value={40} type="success" />
                      </td>
                      <td className="px-2 py-2 md:px-6">
                        <div className="flex items-center">
                          <Rating
                            name={`product-rating-${idx}`}
                            value={product.rating}
                            precision={0.5}
                            size="small"
                            readOnly
                          />
                        </div>
                      </td>
                      <td className="px-2 py-2 md:px-6">
                        <div className="flex gap-2 pt-1">
                          <span className="p-2 rounded-full transition hover:bg-gray-200 cursor-pointer">
                            <FaEdit
                              className="text-blue-500"
                              title="Edit"
                              size={16}
                            />
                          </span>
                          <span className="p-2 rounded-full transition hover:bg-gray-200 cursor-pointer">
                            <FaEye
                              className="text-gray-700"
                              title="View"
                              size={17}
                            />
                          </span>
                          <span className="p-2 rounded-full transition hover:bg-gray-200 cursor-pointer">
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
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <TablePagination
            component="div"
            count={productData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 100, 150, 200, { label: "All", value: -1 }]}
            labelRowsPerPage="Rows per page:"
            sx={{ mt: 1 }}
          />
        </div>
      </div>

      <AddProduct
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
};

export default ProductsSection;
