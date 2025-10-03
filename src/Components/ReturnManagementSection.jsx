import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaTruck,
  FaBoxOpen,
  FaChartBar,
  FaEdit,
  FaLock,
} from "react-icons/fa";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Backdrop,
  CircularProgress,
  TablePagination,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Tab,
  Tabs,
  Card,
  CardContent,
  Typography,
  Grid,
} from "@mui/material";
import axios from "axios";
import  toast  from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ROWS_PER_PAGE = 10;

const ReturnManagementSection = () => {
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [returnTypeFilter, setReturnTypeFilter] = useState("all");
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    returnData: null,
  });
  const [actionDialog, setActionDialog] = useState({
    open: false,
    returnId: null,
    action: null,
    title: "",
    message: "",
  });
  const [updateDialog, setUpdateDialog] = useState({
    open: false,
    returnId: null,
    currentStatus: "",
    newStatus: "",
    trackingId: "",
    refundId: "",
    cancellationReason: "",
  });
  const [processingAction, setProcessingAction] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [statistics, setStatistics] = useState(null);

  // Fetch returns on component mount
  useEffect(() => {
    fetchReturns();
    fetchStatistics();
  }, []);

  // Apply filters when returns or filter values change
  useEffect(() => {
    applyFilters();
  }, [returns, searchTerm, statusFilter, returnTypeFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/returns/admin/all`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setReturns(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch returns");
      }
    } catch (error) {
      console.error("Error fetching returns:", error);

      // Handle 403 Forbidden specifically
      if (error.response && error.response.status === 403) {
        toast.error(
          "You don't have permission to access return management. Please contact an administrator."
        );
      } else {
        toast.error("Failed to load return requests");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/returns/admin/statistics`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching return statistics:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...returns];

    // Filter by search term (order ID or customer name)
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (returnItem) =>
          returnItem.orderId
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          returnItem.user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (returnItem) => returnItem.status === statusFilter
      );
    }

    // Filter by return type
    if (returnTypeFilter !== "all") {
      filtered = filtered.filter(
        (returnItem) => returnItem.returnType === returnTypeFilter
      );
    }

    setFilteredReturns(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleReturnTypeFilterChange = (e) => {
    setReturnTypeFilter(e.target.value);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (returnData) => {
    setDetailsDialog({ open: true, returnData });
  };

  const handleActionClick = (returnId, action) => {
    let title = "";
    let message = "";

    switch (action) {
      case "processing":
        title = "Approve Return Request";
        message =
          "Are you sure you want to approve this return request? This will move it to the processing stage.";
        break;
      case "pickup_scheduled":
        title = "Schedule Pickup";
        message =
          "Are you sure you want to schedule a pickup for this return? This will notify the customer.";
        break;
      case "picked_up":
        title = "Confirm Pickup";
        message =
          "Are you sure you want to confirm that the items have been picked up?";
        break;
      case "completed":
        title = "Complete Return";
        message =
          "Are you sure you want to mark this return as complete? For refunds, this will process the refund to the customer.";
        break;
      case "cancelled":
        title = "Cancel Return Request";
        message =
          "Are you sure you want to cancel this return request? This action cannot be undone.";
        break;
      default:
        break;
    }

    setActionDialog({
      open: true,
      returnId,
      action,
      title,
      message,
    });
  };

  const handleUpdateStatus = (returnItem) => {
    setUpdateDialog({
      open: true,
      returnId: returnItem._id,
      currentStatus: returnItem.status,
      newStatus: returnItem.status,
      trackingId: returnItem.tracking_id || "",
      refundId: returnItem.refund_id || "",
      cancellationReason: "",
    });
  };

  const handleUpdateDialogClose = () => {
    setUpdateDialog({
      open: false,
      returnId: null,
      currentStatus: "",
      newStatus: "",
      trackingId: "",
      refundId: "",
      cancellationReason: "",
    });
  };

  const handleUpdateSubmit = async () => {
    const { returnId, newStatus, trackingId, refundId, cancellationReason } =
      updateDialog;

    try {
      setProcessingAction(true);

      const updateData = {
        status: newStatus,
        tracking_id: trackingId,
        refund_id: refundId,
      };

      if (newStatus === "cancelled" && cancellationReason) {
        updateData.cancellation_reason = cancellationReason;
      }

      const response = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/returns/admin/update/${returnId}`,
        updateData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Return status updated successfully");
        fetchReturns(); // Refresh the returns list
        fetchStatistics(); // Refresh statistics
        handleUpdateDialogClose();
      } else {
        toast.error(response.data.message || "Failed to update return status");
      }
    } catch (error) {
      console.error("Error updating return status:", error);
      toast.error("Failed to update return status");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleActionConfirm = async () => {
    const { returnId, action } = actionDialog;

    try {
      setProcessingAction(true);

      const response = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/returns/admin/update/${returnId}`,
        { status: action },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`Return request ${getActionSuccessMessage(action)}`);
        fetchReturns(); // Refresh the returns list
        fetchStatistics(); // Refresh statistics
      } else {
        toast.error(response.data.message || `Failed to update return status`);
      }
    } catch (error) {
      console.error(`Error updating return status:`, error);
      toast.error(`Failed to update return status`);
    } finally {
      setProcessingAction(false);
      setActionDialog({
        open: false,
        returnId: null,
        action: null,
        title: "",
        message: "",
      });
    }
  };

  const getActionSuccessMessage = (action) => {
    switch (action) {
      case "processing":
        return "approved successfully";
      case "pickup_scheduled":
        return "pickup scheduled successfully";
      case "picked_up":
        return "pickup confirmed successfully";
      case "completed":
        return "completed successfully";
      case "cancelled":
        return "cancelled successfully";
      default:
        return "updated successfully";
    }
  };

  const getStatusChip = (status) => {
    let color = "default";
    let label = status;

    switch (status) {
      case "submitted":
        color = "info";
        label = "Submitted";
        break;
      case "processing":
        color = "warning";
        label = "Processing";
        break;
      case "pickup_scheduled":
        color = "secondary";
        label = "Pickup Scheduled";
        break;
      case "picked_up":
        color = "primary";
        label = "Picked Up";
        break;
      case "completed":
        color = "success";
        label = "Completed";
        break;
      case "cancelled":
        color = "error";
        label = "Cancelled";
        break;
      default:
        break;
    }

    return <Chip label={label} color={color} size="small" />;
  };

  const getReturnTypeChip = (type) => {
    return (
      <Chip
        label={type === "refund" ? "Refund" : "Exchange"}
        color={type === "refund" ? "primary" : "secondary"}
        variant="outlined"
        size="small"
      />
    );
  };

  const getAvailableActions = (returnData) => {
    const { status } = returnData;

    switch (status) {
      case "submitted":
        return [
          {
            action: "processing",
            label: "Approve",
            icon: <FaCheck className="mr-1" />,
          },
          {
            action: "cancelled",
            label: "Cancel",
            icon: <FaTimes className="mr-1" />,
          },
        ];
      case "processing":
        return [
          {
            action: "pickup_scheduled",
            label: "Schedule Pickup",
            icon: <FaTruck className="mr-1" />,
          },
        ];
      case "pickup_scheduled":
        return [
          {
            action: "picked_up",
            label: "Confirm Pickup",
            icon: <FaBoxOpen className="mr-1" />,
          },
        ];
      case "picked_up":
        return [
          {
            action: "completed",
            label: "Complete Return",
            icon: <FaCheck className="mr-1" />,
          },
        ];
      default:
        return [];
    }
  };

  // Calculate pagination for filtered returns
  const pagedData = filteredReturns.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Prepare chart data for statistics
  const prepareChartData = () => {
    if (!statistics) return null;

    // Status distribution chart
    const statusLabels = [
      "Submitted",
      "Processing",
      "Pickup Scheduled",
      "Picked Up",
      "Completed",
      "Cancelled",
    ];
    const statusData = statusLabels.map(
      (label) =>
        statistics.statusCounts[label.toLowerCase().replace(" ", "_")] || 0
    );

    const statusChartData = {
      labels: statusLabels,
      datasets: [
        {
          label: "Returns by Status",
          data: statusData,
          backgroundColor: [
            "rgba(33, 150, 243, 0.6)",
            "rgba(255, 152, 0, 0.6)",
            "rgba(156, 39, 176, 0.6)",
            "rgba(63, 81, 181, 0.6)",
            "rgba(76, 175, 80, 0.6)",
            "rgba(244, 67, 54, 0.6)",
          ],
          borderColor: [
            "rgba(33, 150, 243, 1)",
            "rgba(255, 152, 0, 1)",
            "rgba(156, 39, 176, 1)",
            "rgba(63, 81, 181, 1)",
            "rgba(76, 175, 80, 1)",
            "rgba(244, 67, 54, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    // Return type distribution chart
    const typeLabels = ["Refund", "Exchange"];
    const typeData = [
      statistics.typeCounts.refund || 0,
      statistics.typeCounts.exchange || 0,
    ];

    const typeChartData = {
      labels: typeLabels,
      datasets: [
        {
          label: "Returns by Type",
          data: typeData,
          backgroundColor: [
            "rgba(33, 150, 243, 0.6)",
            "rgba(156, 39, 176, 0.6)",
          ],
          borderColor: ["rgba(33, 150, 243, 1)", "rgba(156, 39, 176, 1)"],
          borderWidth: 1,
        },
      ],
    };

    // Monthly returns chart
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Group by month and year
    const monthlyData = {};
    if (statistics.returnsByMonth) {
      statistics.returnsByMonth.forEach((item) => {
        const monthYear = `${monthNames[item._id.month - 1]} ${item._id.year}`;
        monthlyData[monthYear] = item.count;
      });
    }

    const monthlyChartData = {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: "Returns by Month",
          data: Object.values(monthlyData),
          backgroundColor: "rgba(33, 150, 243, 0.2)",
          borderColor: "rgba(33, 150, 243, 1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };

    return {
      statusChartData,
      typeChartData,
      monthlyChartData,
    };
  };

  const chartData = prepareChartData();

  return (
    <div className="min-w-0 p-3">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="return management tabs"
        >
          <Tab label="Return Requests" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          <div className="flex items-center justify-between px-2 mb-5">
            <p className="text-[18px] font-semibold text-gray-800">
              Return Requests ({filteredReturns.length})
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchReturns}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-1 text-[14px] rounded-sm font-semibold text-white disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-white rounded-md min-w-0 overflow-hidden shadow-md">
            {/* Filter Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Input */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order ID or customer name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="border border-gray-300 rounded-md px-4 pl-10 py-2 w-full bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                  />
                </div>

                {/* Status Filter */}
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    id="status-filter"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    label="Status"
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="pickup_scheduled">
                      Pickup Scheduled
                    </MenuItem>
                    <MenuItem value="picked_up">Picked Up</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>

                {/* Return Type Filter */}
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="return-type-filter-label">
                    Return Type
                  </InputLabel>
                  <Select
                    labelId="return-type-filter-label"
                    id="return-type-filter"
                    value={returnTypeFilter}
                    onChange={handleReturnTypeFilterChange}
                    label="Return Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="refund">Refund</MenuItem>
                    <MenuItem value="exchange">Exchange</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>

            {/* Returns Table */}
            <div className="mt-0 min-w-0 w-full">
              <div className="w-full h-[500px] overflow-x-auto custom-scrollbar">
                <table className="min-w-[700px] w-full text-sm text-left rtl:text-right text-gray-500">
                  <thead className="text-xs text-gray-600 uppercase bg-[#f1f1f1] sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Return ID
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Items
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="9" className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                            <span className="text-gray-500">
                              Loading returns...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : pagedData.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-8">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <FaSearch className="text-4xl mb-2 text-gray-300" />
                            <span>No return requests found</span>
                            {(searchTerm ||
                              statusFilter !== "all" ||
                              returnTypeFilter !== "all") && (
                              <span className="text-sm mt-1">
                                Try adjusting your filters
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pagedData.map((returnItem) => (
                        <tr
                          key={returnItem._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {returnItem._id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className="font-medium text-blue-600 cursor-pointer hover:underline"
                              onClick={() => handleViewDetails(returnItem)}
                            >
                              {returnItem.orderId}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {returnItem.user?.name || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(
                              returnItem.submitted_at
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4">
                            {getReturnTypeChip(returnItem.returnType)}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusChip(returnItem.status)}
                          </td>
                          <td className="px-6 py-4">
                            {returnItem.products?.length || 0}
                          </td>
                          <td className="px-6 py-4 font-medium">
                            ₹{returnItem.refund_amount?.toLocaleString() || "0"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(returnItem)}
                                className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                title="View Details"
                              >
                                <FaEye size={16} />
                              </button>

                              <button
                                onClick={() => handleUpdateStatus(returnItem)}
                                className="p-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                                title="Update Status"
                              >
                                <FaEdit size={16} />
                              </button>

                              {getAvailableActions(returnItem).map(
                                (action, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() =>
                                      handleActionClick(
                                        returnItem._id,
                                        action.action
                                      )
                                    }
                                    className={`flex items-center text-xs px-2 py-1.5 rounded ${
                                      action.action === "cancelled"
                                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                                        : "bg-green-50 text-green-600 hover:bg-green-100"
                                    } transition-colors`}
                                    title={action.label}
                                  >
                                    {action.icon}
                                    {action.label}
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <TablePagination
                component="div"
                count={filteredReturns.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Rows per page:"
                sx={{ mt: 1 }}
              />
            </div>
          </div>
        </>
      )}

      {tabValue === 1 && (
        <div className="bg-white rounded-md shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Return Analytics</h2>

          {!statistics ? (
            <div className="flex justify-center items-center h-64">
              <CircularProgress />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <Grid container spacing={3} className="mb-6">
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Returns
                      </Typography>
                      <Typography variant="h4" component="div">
                        {Object.values(statistics.statusCounts).reduce(
                          (a, b) => a + b,
                          0
                        )}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Pending Returns
                      </Typography>
                      <Typography variant="h4" component="div">
                        {(statistics.statusCounts.submitted || 0) +
                          (statistics.statusCounts.processing || 0) +
                          (statistics.statusCounts.pickup_scheduled || 0) +
                          (statistics.statusCounts.picked_up || 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Completed Returns
                      </Typography>
                      <Typography variant="h4" component="div">
                        {statistics.statusCounts.completed || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Refund Amount
                      </Typography>
                      <Typography variant="h4" component="div">
                        ₹{statistics.totalRefundAmount.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Charts */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Returns by Status
                      </Typography>
                      <div style={{ height: 300 }}>
                        {chartData && (
                          <Bar
                            data={chartData.statusChartData}
                            options={{ maintainAspectRatio: false }}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Returns by Type
                      </Typography>
                      <div style={{ height: 300 }}>
                        {chartData && (
                          <Pie
                            data={chartData.typeChartData}
                            options={{ maintainAspectRatio: false }}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Monthly Returns
                      </Typography>
                      <div style={{ height: 300 }}>
                        {chartData && (
                          <Line
                            data={chartData.monthlyChartData}
                            options={{ maintainAspectRatio: false }}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </div>
      )}

      {/* Return Details Dialog */}
      <Dialog
        open={detailsDialog.open}
        onClose={() => setDetailsDialog({ open: false, returnData: null })}
        maxWidth="md"
        fullWidth
      >
        {detailsDialog.returnData && (
          <>
            <DialogTitle>
              <div className="flex justify-between items-center">
                <span>Return Request Details</span>
                <div className="flex items-center gap-2">
                  {getStatusChip(detailsDialog.returnData.status)}
                  {getReturnTypeChip(detailsDialog.returnData.returnType)}
                </div>
              </div>
            </DialogTitle>
            <DialogContent dividers>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">
                    Return Information
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm mb-1">
                      <span className="font-medium">Return ID:</span>{" "}
                      {detailsDialog.returnData._id}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Order ID:</span>{" "}
                      {detailsDialog.returnData.orderId}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Reason:</span>{" "}
                      {detailsDialog.returnData.reason}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Submitted:</span>{" "}
                      {new Date(
                        detailsDialog.returnData.submitted_at
                      ).toLocaleString()}
                    </p>
                    {detailsDialog.returnData.returnType === "refund" && (
                      <p className="text-sm mb-1">
                        <span className="font-medium">Refund Amount:</span> ₹
                        {detailsDialog.returnData.refund_amount?.toLocaleString() ||
                          "0"}
                      </p>
                    )}
                    {detailsDialog.returnData.tracking_id && (
                      <p className="text-sm mb-1">
                        <span className="font-medium">Tracking ID:</span>{" "}
                        {detailsDialog.returnData.tracking_id}
                      </p>
                    )}
                    {detailsDialog.returnData.refund_id && (
                      <p className="text-sm mb-1">
                        <span className="font-medium">Refund ID:</span>{" "}
                        {detailsDialog.returnData.refund_id}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">
                    Customer Information
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm mb-1">
                      <span className="font-medium">Name:</span>{" "}
                      {detailsDialog.returnData.user?.name || "N/A"}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Email:</span>{" "}
                      {detailsDialog.returnData.user?.email || "N/A"}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Phone:</span>{" "}
                      {detailsDialog.returnData.user?.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Return Status Timeline
              </h3>
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <div className="flex flex-col gap-2">
                  {detailsDialog.returnData.submitted_at && (
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mt-1"></div>
                      <div>
                        <p className="text-sm font-medium">Submitted</p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            detailsDialog.returnData.submitted_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {detailsDialog.returnData.processing_at && (
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 mt-1"></div>
                      <div>
                        <p className="text-sm font-medium">Processing</p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            detailsDialog.returnData.processing_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {detailsDialog.returnData.pickup_scheduled_at && (
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-purple-500 mt-1"></div>
                      <div>
                        <p className="text-sm font-medium">Pickup Scheduled</p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            detailsDialog.returnData.pickup_scheduled_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {detailsDialog.returnData.picked_up_at && (
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-indigo-500 mt-1"></div>
                      <div>
                        <p className="text-sm font-medium">Picked Up</p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            detailsDialog.returnData.picked_up_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {detailsDialog.returnData.completed_at && (
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500 mt-1"></div>
                      <div>
                        <p className="text-sm font-medium">Completed</p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            detailsDialog.returnData.completed_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {detailsDialog.returnData.cancelled_at && (
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500 mt-1"></div>
                      <div>
                        <p className="text-sm font-medium">Cancelled</p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            detailsDialog.returnData.cancelled_at
                          ).toLocaleString()}
                        </p>
                        {detailsDialog.returnData.cancellation_reason && (
                          <p className="text-xs text-red-500">
                            Reason:{" "}
                            {detailsDialog.returnData.cancellation_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Products
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Current Size
                      </th>
                      {detailsDialog.returnData.returnType === "exchange" && (
                        <th
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          New Size
                        </th>
                      )}
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {detailsDialog.returnData.products.map((product, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.currentSize}
                          </div>
                        </td>
                        {detailsDialog.returnData.returnType === "exchange" && (
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.newSize === "unavailable" ? (
                                <span className="text-red-500">
                                  No size available
                                </span>
                              ) : (
                                product.newSize
                              )}
                            </div>
                          </td>
                        )}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.quantity}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₹{product.price?.toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() =>
                  setDetailsDialog({ open: false, returnData: null })
                }
              >
                Close
              </Button>

              <Button
                onClick={() => handleUpdateStatus(detailsDialog.returnData)}
                color="primary"
                variant="outlined"
              >
                Update Status
              </Button>

              {getAvailableActions(detailsDialog.returnData).map(
                (action, idx) => (
                  <Button
                    key={idx}
                    onClick={() => {
                      setDetailsDialog({ open: false, returnData: null });
                      handleActionClick(
                        detailsDialog.returnData._id,
                        action.action
                      );
                    }}
                    color={action.action === "cancelled" ? "error" : "primary"}
                    variant="contained"
                  >
                    {action.label}
                  </Button>
                )
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() =>
          setActionDialog({
            open: false,
            returnId: null,
            action: null,
            title: "",
            message: "",
          })
        }
        aria-labelledby="action-dialog-title"
        aria-describedby="action-dialog-description"
      >
        <DialogTitle id="action-dialog-title">{actionDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="action-dialog-description">
            {actionDialog.message}
          </DialogContentText>

          {actionDialog.action === "cancelled" && (
            <TextField
              autoFocus
              margin="dense"
              id="cancellation-reason"
              label="Cancellation Reason"
              type="text"
              fullWidth
              variant="outlined"
              onChange={(e) =>
                setActionDialog({
                  ...actionDialog,
                  cancellationReason: e.target.value,
                })
              }
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setActionDialog({
                open: false,
                returnId: null,
                action: null,
                title: "",
                message: "",
              })
            }
            color="inherit"
            disabled={processingAction}
          >
            Cancel
          </Button>
          <Button
            onClick={handleActionConfirm}
            color={actionDialog.action === "cancelled" ? "error" : "primary"}
            variant="contained"
            disabled={processingAction}
            startIcon={
              processingAction ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {processingAction ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={updateDialog.open}
        onClose={handleUpdateDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Return Status</DialogTitle>
        <DialogContent>
          <div className="space-y-4 py-2">
            <FormControl fullWidth>
              <InputLabel id="new-status-label">Status</InputLabel>
              <Select
                labelId="new-status-label"
                value={updateDialog.newStatus}
                onChange={(e) =>
                  setUpdateDialog({
                    ...updateDialog,
                    newStatus: e.target.value,
                  })
                }
                label="Status"
              >
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="pickup_scheduled">Pickup Scheduled</MenuItem>
                <MenuItem value="picked_up">Picked Up</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Tracking ID (optional)"
              fullWidth
              value={updateDialog.trackingId}
              onChange={(e) =>
                setUpdateDialog({ ...updateDialog, trackingId: e.target.value })
              }
            />

            <TextField
              label="Refund ID (optional)"
              fullWidth
              value={updateDialog.refundId}
              onChange={(e) =>
                setUpdateDialog({ ...updateDialog, refundId: e.target.value })
              }
            />

            {updateDialog.newStatus === "cancelled" && (
              <TextField
                label="Cancellation Reason"
                fullWidth
                required
                value={updateDialog.cancellationReason}
                onChange={(e) =>
                  setUpdateDialog({
                    ...updateDialog,
                    cancellationReason: e.target.value,
                  })
                }
              />
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateDialogClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateSubmit}
            color="primary"
            variant="contained"
            disabled={
              processingAction ||
              (updateDialog.newStatus === "cancelled" &&
                !updateDialog.cancellationReason)
            }
          >
            {processingAction ? (
              <>
                <CircularProgress size={20} color="inherit" className="mr-2" />
                Processing...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Backdrop */}
      <Backdrop sx={{ color: "#fff", zIndex: 9999 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default ReturnManagementSection;
