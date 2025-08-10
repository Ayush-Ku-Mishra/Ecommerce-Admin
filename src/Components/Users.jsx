import React from "react";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import TablePagination from "@mui/material/TablePagination";
import AddProduct from "./AddProduct";
import { RiMailCheckLine } from "react-icons/ri";
import { IoMdCall } from "react-icons/io";
import { SlCalender } from "react-icons/sl";

const ROWS_PER_PAGE = 50;

const Users = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Dushyant suthar",
      email: "*********",
      phone: "*********",
      created: "2025-08-10",
      avatar: { type: "initial", value: "D", color: "bg-purple-500" },
    },
    {
      id: 2,
      name: "Shambhavi Pandey",
      email: "*********",
      phone: "*********",
      created: "2025-08-10",
      avatar: { type: "initial", value: "S", color: "bg-green-600" },
    },
    {
      id: 3,
      name: "djsfuyjsdvh",
      email: "*********",
      phone: "*********",
      created: "2025-08-10",
      avatar: { type: "default", value: null, color: "bg-gray-400" },
    },
    {
      id: 4,
      name: "xzz",
      email: "*********",
      phone: "*********",
      created: "2025-08-10",
      avatar: { type: "default", value: null, color: "bg-gray-400" },
    },
    {
      id: 5,
      name: "Abhishek pandey",
      email: "*********",
      phone: "*********",
      created: "2025-08-10",
      avatar: {
        type: "image",
        value:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        color: "",
      },
    },
    {
      id: 6,
      name: "test",
      email: "*********",
      phone: "*********",
      created: "2025-08-10",
      avatar: { type: "default", value: null, color: "bg-gray-400" },
    },
    {
      id: 7,
      name: "sujan",
      email: "*********",
      phone: "*********",
      created: "2025-08-10",
      avatar: { type: "default", value: null, color: "bg-gray-400" },
    },
  ]);
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
  const [selected, setSelected] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Calculate pagination
  const pagedData = users.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      // select all rows
      const newSelected = {};
      pagedData.forEach((_, idx) => {
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

  const handleDeleteUser = (userId) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
    setSelected({});
    setSelectAll(false);
  };

  const renderAvatar = (avatar, name) => {
    if (avatar.type === "image") {
      return (
        <img
          src={avatar.value}
          alt={name}
          className="w-[40px] h-[40px] md:w-[65px] md:h-[65px] rounded-md object-cover"
        />
      );
    } else if (avatar.type === "initial") {
      return (
        <div
          className={`w-[40px] h-[40px] md:w-[65px] md:h-[65px] rounded-md ${avatar.color} flex items-center justify-center text-white font-semibold text-sm md:text-lg`}
        >
          {avatar.value}
        </div>
      );
    } else {
      return (
        <div
          className={`w-[40px] h-[40px] md:w-[65px] md:h-[65px] rounded-md ${avatar.color} flex items-center justify-center`}
        >
          <div className="w-6 h-6 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white bg-opacity-60 rounded-full"></div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full pl-4 pr-2 py-8 min-w-0">
      <div className="bg-white rounded-md min-w-0 overflow-hidden shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 min-w-0 items-center">
          {/* Title */}
          <p className="text-lg sm:text-xl font-semibold text-gray-800">
            Users List
          </p>

          {/* Search Input */}
          <div className="w-full md:col-span-1 lg:col-span-2">
            {/* Hidden label for accessibility */}
            <label htmlFor="userSearch" className="sr-only">
              Search
            </label>
            <div className="relative">
              <input
                id="userSearch"
                type="text"
                placeholder="Search here..."
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 w-full bg-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
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
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    USER PHONE NO
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 whitespace-nowrap md:px-6"
                  >
                    CREATED
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
                {pagedData.map((product, idx) => {
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
                          {/* ----------- FIXED MAPPING BELOW ----------- */}
                          <div className="w-[30px] h-[30px] md:w-[40px] md:h-[40px] rounded-md overflow-hidden group">
                            {renderAvatar(product.avatar, product.name)}
                          </div>
                          <div className="w-auto">
                            <h3 className="font-[700] text-[11px] text-black hover:text-blue-500 transition">
                              {product.name}
                            </h3>
                            <p className="text-[10px] md:text-[12px] text-gray-800">
                              <div className="flex items-center gap-2">
                                <RiMailCheckLine />
                                <span>{product.email}</span>
                              </div>
                            </p>
                          </div>
                          {/* ----------- FIXED MAPPING ABOVE ----------- */}
                        </div>
                      </td>
                      <td className="px-2 py-2 md:px-6">
                        <p className="text-[12px] md:text-[13px] font-[400] text-gray-800">
                          <div className="flex items-center gap-2">
                            <IoMdCall />
                            <span>{product.phone}</span>
                          </div>
                        </p>
                      </td>
                      <td className="px-2 py-2 md:px-6">
                        <p className="text-[12px] md:text-[13px] font-[400] text-gray-800">
                          <div className="flex items-center gap-2">
                            <SlCalender />
                            <span>{product.created}</span>
                          </div>
                        </p>
                      </td>

                      <td className="px-2 py-2 md:px-6">
                        <div className="col-span-2">
                          <button
                            onClick={() => handleDeleteUser(product.id)}
                            className="px-2 py-1 text-red-600 border border-red-200 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors font-medium text-sm flex items-center gap-2"
                          >
                            DELETE
                          </button>
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
            count={users.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[
              50,
              100,
              150,
              200,
              { label: "All", value: -1 },
            ]}
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

export default Users;
