import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  FaBoxOpen,
  FaChartLine,
  FaCoins,
  FaStar,
  FaShoppingCart,
  FaDownload,
} from "react-icons/fa";
import {
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#a4de6c",
  "#d0ed57",
  "#83a6ed",
  "#8dd1e1",
];

const ProductAnalyticsDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/v1/product/getAllProducts?perPage=1000`,
          { withCredentials: true }
        );

        if (response.data.success) {
          setProducts(response.data.products || []);

          // Extract unique categories
          const uniqueCategories = [
            ...new Set(
              response.data.products
                .filter((p) => p.categoryName)
                .map((p) => p.categoryName)
            ),
          ];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (categoryFilter === "all") return products;
    return products.filter(
      (product) => product.categoryName === categoryFilter
    );
  }, [products, categoryFilter]);

  // Calculate total products, total sales, avg rating, and low stock count
  const metrics = useMemo(() => {
    const totalProducts = filteredProducts.length;
    const totalSales = filteredProducts.reduce(
      (sum, product) => sum + (product.sales || 0),
      0
    );
    const totalRevenue = filteredProducts.reduce(
      (sum, product) => sum + (product.sales || 0) * product.price,
      0
    );

    const ratingsSum = filteredProducts.reduce(
      (sum, product) => sum + (product.rating || 0),
      0
    );
    const avgRating =
      totalProducts > 0 ? (ratingsSum / totalProducts).toFixed(1) : 0;

    const lowStockCount = filteredProducts.filter(
      (product) => product.stock < 10
    ).length;

    return {
      totalProducts,
      totalSales,
      totalRevenue,
      avgRating,
      lowStockCount,
    };
  }, [filteredProducts]);

  // Top selling products data
  const topSellingProducts = useMemo(() => {
    return [...filteredProducts]
      .sort((a, b) => (b.sales || 0) - (a.sales || 0))
      .slice(0, 5)
      .map((product) => ({
        name: product.name?.substring(0, 20) + "...",
        sales: product.sales || 0,
        revenue: (product.sales || 0) * product.price,
        id: product._id,
      }));
  }, [filteredProducts]);

  // Category distribution data
  const categoryDistribution = useMemo(() => {
    const distribution = {};

    filteredProducts.forEach((product) => {
      const category = product.categoryName || "Uncategorized";
      if (!distribution[category]) {
        distribution[category] = 0;
      }
      distribution[category]++;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredProducts]);

  // Stock levels analysis
  const stockLevels = useMemo(() => {
    const levels = [
      { name: "Out of Stock", value: 0 },
      { name: "Critical (1-10)", value: 0 },
      { name: "Low (11-20)", value: 0 },
      { name: "Medium (21-50)", value: 0 },
      { name: "High (50+)", value: 0 },
    ];

    filteredProducts.forEach((product) => {
      const stock = product.stock || 0;
      if (stock === 0) levels[0].value++;
      else if (stock <= 10) levels[1].value++;
      else if (stock <= 20) levels[2].value++;
      else if (stock <= 50) levels[3].value++;
      else levels[4].value++;
    });

    return levels;
  }, [filteredProducts]);

  // Price range distribution
  const priceRanges = useMemo(() => {
    const ranges = [
      { name: "₹0-500", range: [0, 500], count: 0 },
      { name: "₹501-1000", range: [501, 1000], count: 0 },
      { name: "₹1001-2000", range: [1001, 2000], count: 0 },
      { name: "₹2001-5000", range: [2001, 5000], count: 0 },
      { name: "₹5000+", range: [5001, Infinity], count: 0 },
    ];

    filteredProducts.forEach((product) => {
      const price = product.price || 0;
      const matchingRange = ranges.find(
        (r) => price >= r.range[0] && price <= r.range[1]
      );
      if (matchingRange) matchingRange.count++;
    });

    return ranges;
  }, [filteredProducts]);

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = [
      { name: "5★", value: 0 },
      { name: "4★", value: 0 },
      { name: "3★", value: 0 },
      { name: "2★", value: 0 },
      { name: "1★", value: 0 },
      { name: "No Rating", value: 0 },
    ];

    filteredProducts.forEach((product) => {
      const rating = product.rating || 0;
      if (rating === 0) distribution[5].value++;
      else {
        const index = 5 - Math.round(rating);
        if (index >= 0 && index < 5) distribution[index].value++;
      }
    });

    return distribution;
  }, [filteredProducts]);

  // Sales over time (simulated data since we don't have actual time series)
  const salesOverTime = useMemo(() => {
    // This would ideally come from real time series data
    // Creating simulated data based on existing products
    const months = [
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

    return months.map((month, index) => {
      // Simulate seasonal patterns
      const seasonalFactor = 1 + Math.sin((index / 12) * Math.PI * 2) * 0.3;

      // Base value is proportional to total sales
      const baseSales = (metrics.totalSales / 12) * seasonalFactor;
      const baseRevenue = (metrics.totalRevenue / 12) * seasonalFactor;

      // Add some randomness
      const randomFactor = 0.9 + Math.random() * 0.2;

      return {
        name: month,
        sales: Math.round(baseSales * randomFactor),
        revenue: Math.round(baseRevenue * randomFactor),
      };
    });
  }, [metrics.totalSales, metrics.totalRevenue]);

  // Category performance comparison
  const categoryPerformance = useMemo(() => {
    const performance = {};

    products.forEach((product) => {
      const category = product.categoryName || "Uncategorized";
      if (!performance[category]) {
        performance[category] = {
          name: category,
          sales: 0,
          revenue: 0,
          avgRating: 0,
          productCount: 0,
          ratingSum: 0,
        };
      }

      performance[category].sales += product.sales || 0;
      performance[category].revenue += (product.sales || 0) * product.price;
      performance[category].ratingSum += product.rating || 0;
      performance[category].productCount++;
    });

    // Calculate average ratings
    Object.values(performance).forEach((cat) => {
      cat.avgRating =
        cat.productCount > 0 ? cat.ratingSum / cat.productCount : 0;
      delete cat.ratingSum;
    });

    return Object.values(performance);
  }, [products]);

  // Export to CSV function
  const exportToCSV = () => {
    const headers = [
      "Product Name",
      "Category",
      "Brand",
      "Price",
      "Stock",
      "Sales",
      "Rating",
    ];
    const csvRows = [headers.join(",")];

    filteredProducts.forEach((product) => {
      const row = [
        `"${product.name || ""}"`,
        `"${product.categoryName || ""}"`,
        `"${product.brand || ""}"`,
        product.price || 0,
        product.stock || 0,
        product.sales || 0,
        (product.rating || 0).toFixed(2),
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `product_analytics_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <FaChartLine className="text-indigo-600 text-2xl animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-lg font-semibold text-indigo-700 animate-pulse">
          Loading Analytics Dashboard...
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while we fetch your data
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-6 overflow-y-auto">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-xl shadow-lg p-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Product Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive insights into your product performance and inventory
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="mt-4 md:mt-0 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <FaDownload className="text-lg" />
            <span className="font-semibold">Export CSV</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <FormControl className="min-w-[200px] bg-white rounded-lg shadow-md">
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
              variant="outlined"
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className="min-w-[200px] bg-white rounded-lg shadow-md">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
              variant="outlined"
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transition-transform hover:scale-105">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-purple-100 mb-1 font-medium">
                  Total Products
                </p>
                <h3 className="text-3xl font-bold">{metrics.totalProducts}</h3>
              </div>
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <FaBoxOpen className="text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transition-transform hover:scale-105">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-100 mb-1 font-medium">Total Sales</p>
                <h3 className="text-3xl font-bold">
                  {metrics.totalSales.toLocaleString()}
                </h3>
              </div>
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <FaShoppingCart className="text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transition-transform hover:scale-105">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100 mb-1 font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold">
                  ₹{metrics.totalRevenue.toLocaleString()}
                </h3>
              </div>
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <FaCoins className="text-3xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white transition-transform hover:scale-105">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-amber-100 mb-1 font-medium">
                  Average Rating
                </p>
                <h3 className="text-3xl font-bold">
                  {metrics.avgRating} <span>★</span>
                </h3>
              </div>
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <FaStar className="text-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded"></div>
              Sales Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesOverTime}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [`${value}`, ""]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Units Sold"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (₹)"
                  stroke="#82ca9d"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded"></div>
              Top Selling Products
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topSellingProducts}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" stroke="#666" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value, name) => [
                    value,
                    name === "sales" ? "Units Sold" : "Revenue (₹)",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="sales"
                  name="Units Sold"
                  fill="#8884d8"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue (₹)"
                  fill="#82ca9d"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Second Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded"></div>
              Category Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} products`,
                    props.payload.name,
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stock Levels */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded"></div>
              Stock Levels
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stockLevels}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [`${value} products`, "Count"]}
                />
                <Bar
                  dataKey="value"
                  name="Products"
                  fill="#ff8042"
                  radius={[4, 4, 0, 0]}
                >
                  {stockLevels.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0 || index === 1
                          ? "#ff6b6b"
                          : index === 2
                          ? "#ffd166"
                          : "#4ecdc4"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded"></div>
              Rating Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratingDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {ratingDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? "#4CAF50"
                          : index === 1
                          ? "#8BC34A"
                          : index === 2
                          ? "#CDDC39"
                          : index === 3
                          ? "#FFC107"
                          : index === 4
                          ? "#FF5722"
                          : "#9E9E9E"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} products`, ""]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Third Row of Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Price Range Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded"></div>
              Price Range Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={priceRanges}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [`${value} products`, "Count"]}
                />
                <Bar dataKey="count" name="Products" radius={[4, 4, 0, 0]}>
                  {priceRanges.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${index * 30 + 210}, 70%, 60%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded"></div>
              Category Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={categoryPerformance.slice(0, 5)}
              >
                <PolarGrid stroke="#e5e5e5" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: "#666", fontSize: 12 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, "auto"]} />
                <Radar
                  name="Sales"
                  dataKey="sales"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Revenue"
                  dataKey="revenue"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Avg Rating (×20)"
                  dataKey="avgRating"
                  stroke="#ffc658"
                  fill="#ffc658"
                  fillOpacity={0.5}
                />
                <Legend />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alert Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded"></div>
              Low Stock Alert
            </h2>
            <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              {metrics.lowStockCount} items
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar max-h-[400px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Current Stock
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts
                  .filter((product) => product.stock < 10)
                  .slice(0, 5)
                  .map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={
                                product.images?.[0] || "/placeholder-image.jpg"
                              }
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name?.substring(0, 30)}...
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.brand}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.categoryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.stock === 0
                              ? "bg-red-100 text-red-800"
                              : product.stock < 5
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {product.stock === 0
                            ? "Out of Stock"
                            : product.stock < 5
                            ? "Critical"
                            : "Low"}
                        </span>
                      </td>
                    </tr>
                  ))}
                {filteredProducts.filter((product) => product.stock < 10)
                  .length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No low stock items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Last Updated */}
        <div className="text-center text-gray-500 text-sm mb-4">
          Data last updated:{" "}
          {new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductAnalyticsDashboard;
