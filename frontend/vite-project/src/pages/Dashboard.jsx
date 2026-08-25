import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://e-commerce-website-i3qw.onrender.com";

const DEFAULT_STATS = {
  totalUsers: 0,
  totalProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(DEFAULT_STATS);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // ======================================================
  // GET TOKEN
  // ======================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      null
    );
  };

  // ======================================================
  // SAFE JSON RESPONSE
  // ======================================================

  const getResponseData = async (response) => {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        success: false,
        message: text,
      };
    }
  };

  // ======================================================
  // LOAD PUBLIC DASHBOARD STATS
  // ======================================================

  const fetchPublicStats = async () => {
    const response = await fetch(
      `${API_URL}/api/private-data/public-stats`,
      {
        method: "GET",
      }
    );

    const data = await getResponseData(response);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          "Dashboard statistics load nahi hue."
      );
    }

    return data;
  };

  // ======================================================
  // LOAD ADMIN USERS / ORDERS
  // ======================================================

  const fetchAdminData = async () => {
    const token = getToken();

    if (!token) {
      return {
        users: [],
        orders: [],
      };
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const [usersRes, ordersRes] =
        await Promise.all([
          fetch(`${API_URL}/api/admin/users`, {
            method: "GET",
            headers,
          }),

          fetch(`${API_URL}/api/admin/orders`, {
            method: "GET",
            headers,
          }),
        ]);

      const usersData =
        await getResponseData(usersRes);

      const ordersData =
        await getResponseData(ordersRes);

      return {
        users:
          usersRes.ok &&
          Array.isArray(usersData.users)
            ? usersData.users
            : [],

        orders:
          ordersRes.ok &&
          Array.isArray(ordersData.orders)
            ? ordersData.orders
            : [],
      };
    } catch (error) {
      console.error(
        "ADMIN DATA ERROR:",
        error
      );

      return {
        users: [],
        orders: [],
      };
    }
  };

  // ======================================================
  // LOAD DASHBOARD
  // ======================================================

  const fetchDashboard = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      // Public stats do NOT require login
      const statsData =
        await fetchPublicStats();

      setStats({
        ...DEFAULT_STATS,
        ...(statsData.stats || {}),
      });

      // Optional admin data
      const adminData =
        await fetchAdminData();

      setUsers(adminData.users);
      setOrders(adminData.orders);
    } catch (error) {
      console.error(
        "DASHBOARD ERROR:",
        error
      );

      setError(
        error.message ||
          "Dashboard load nahi ho saka."
      );

      setStats(DEFAULT_STATS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ======================================================
  // LOGOUT
  // ======================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  // ======================================================
  // MONEY
  // ======================================================

  const money = (value) => {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  };

  // ======================================================
  // FILTER ORDERS
  // ======================================================

  const filteredOrders = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return orders.slice(0, 8);
    }

    return orders
      .filter((order) => {
        const name =
          order.user?.name ||
          order.shippingAddress?.fullName ||
          order.name ||
          "";

        const email =
          order.user?.email ||
          order.email ||
          "";

        const product =
          order.items?.[0]?.product?.name ||
          order.items?.[0]?.name ||
          "";

        const orderId =
          order._id || "";

        return (
          name
            .toLowerCase()
            .includes(query) ||
          email
            .toLowerCase()
            .includes(query) ||
          product
            .toLowerCase()
            .includes(query) ||
          orderId
            .toLowerCase()
            .includes(query)
        );
      })
      .slice(0, 8);
  }, [orders, search]);

  // ======================================================
  // PAID ORDERS
  // ======================================================

  const paidOrders = orders.filter(
    (order) =>
      String(
        order.paymentStatus || ""
      ).toLowerCase() === "paid"
  );

  const paidRevenue =
    paidOrders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.totalAmount ??
            order.total ??
            order.amount ??
            0
        ),
      0
    );

  // ======================================================
  // DAILY SALES
  // ======================================================

  const today = new Date();

  const dailySales =
    orders
      .filter((order) => {
        if (!order.createdAt) {
          return false;
        }

        const date = new Date(
          order.createdAt
        );

        return (
          date.getDate() ===
            today.getDate() &&
          date.getMonth() ===
            today.getMonth() &&
          date.getFullYear() ===
            today.getFullYear()
        );
      })
      .reduce(
        (sum, order) =>
          sum +
          Number(
            order.totalAmount ??
              order.total ??
              order.amount ??
              0
          ),
        0
      );

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef2fb] flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl px-10 py-8 text-center">
          <div className="text-5xl mb-4 animate-pulse">
            📊
          </div>

          <h2 className="text-2xl font-extrabold text-[#30385d]">
            Loading Dashboard
          </h2>

          <p className="text-gray-500 mt-2">
            Backend se live data load ho raha hai...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN
  // ======================================================

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-[#151a2e] text-white"
          : "min-h-screen bg-[#eef2fb]"
      }
    >
      <div className="flex min-h-screen">

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside className="hidden lg:flex w-[250px] bg-gradient-to-b from-[#4c5f9f] via-[#40548f] to-[#33457f] text-white flex-col fixed left-0 top-0 bottom-0 z-40">

          <div className="px-7 pt-8 pb-10">
            <div className="flex items-center gap-3">

              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow">
                <span className="text-2xl font-black text-[#ff7358]">
                  E
                </span>
              </div>

              <div>
                <h1 className="text-xl font-extrabold">
                  Eco
                  <span className="text-[#ff7358]">
                    Shop
                  </span>
                </h1>

                <p className="text-[10px] text-blue-100 uppercase tracking-widest">
                  Dashboard
                </p>
              </div>

            </div>
          </div>

          <div className="px-5 flex-1">

            <p className="text-xs font-bold uppercase tracking-wider text-blue-200 px-3 mb-3">
              Menu
            </p>

            <SidebarItem
              icon="▦"
              title="Dashboard"
              active
            />

            <SidebarItem
              icon="◒"
              title="Analytics"
            />

            <SidebarItem
              icon="↗"
              title="Sales"
            />

            <p className="text-xs font-bold uppercase tracking-wider text-blue-200 px-3 mt-8 mb-3">
              Management
            </p>

            <SidebarItem
              icon="🛒"
              title="Products"
              onClick={() =>
                navigate("/shop")
              }
            />

            <SidebarItem
              icon="👥"
              title="Customers"
            />

            <SidebarItem
              icon="▣"
              title="Orders"
            />

            <SidebarItem
              icon="▤"
              title="Reports"
            />

            <p className="text-xs font-bold uppercase tracking-wider text-blue-200 px-3 mt-8 mb-3">
              System
            </p>

            <SidebarItem
              icon="▤"
              title="Transactions"
            />

            <SidebarItem
              icon="✉"
              title="Messages"
            />

          </div>

          <div className="p-5">
            <div className="bg-[#ff7358] rounded-xl p-3 flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                👨
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">
                  EcoShop
                </p>

                <p className="text-[10px] text-white/80">
                  Store Dashboard
                </p>
              </div>

              <button
                onClick={logout}
                className="text-white text-xl hover:scale-110 transition"
                title="Logout"
              >
                ↪
              </button>

            </div>
          </div>

        </aside>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <main className="flex-1 lg:ml-[250px]">

          {/* TOP BAR */}

          <header
            className={
              darkMode
                ? "bg-[#202640] border-b border-white/10 px-5 md:px-8 py-5"
                : "bg-white/90 backdrop-blur border-b border-gray-200 px-5 md:px-8 py-5"
            }
          >

            <div className="flex items-center gap-4">

              <div className="lg:hidden w-10 h-10 rounded-xl bg-[#4c5f9f] text-white flex items-center justify-center font-bold">
                E
              </div>

              <div className="relative flex-1 max-w-[600px]">

                <input
                  type="text"
                  placeholder="Search customers, orders, products..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className={
                    darkMode
                      ? "w-full bg-[#171d31] text-white rounded-2xl px-5 py-3.5 outline-none"
                      : "w-full bg-[#edf2fc] text-[#30385d] rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-[#6678b4]"
                  }
                />

              </div>

              <button
                onClick={() =>
                  setDarkMode(!darkMode)
                }
                className={
                  darkMode
                    ? "w-12 h-12 rounded-2xl bg-[#171d31] text-xl"
                    : "w-12 h-12 rounded-2xl bg-[#edf2fc] text-xl"
                }
              >
                {darkMode ? "☀" : "☾"}
              </button>

              <button
                className={
                  darkMode
                    ? "hidden sm:flex w-12 h-12 rounded-2xl bg-[#171d31] items-center justify-center text-xl"
                    : "hidden sm:flex w-12 h-12 rounded-2xl bg-[#edf2fc] items-center justify-center text-xl"
                }
              >
                🔔
              </button>

              <button
                onClick={logout}
                className="hidden sm:flex items-center gap-2 bg-[#edf2fc] text-[#30385d] px-6 py-3.5 rounded-2xl font-semibold"
              >
                <span className="text-[#ff7358]">
                  ↪
                </span>

                Log Out
              </button>

            </div>

          </header>

          {/* PAGE */}

          <div className="p-5 md:p-8">

            {/* ERROR */}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5">

                <div className="flex items-start gap-3">

                  <span className="text-xl">
                    ⚠️
                  </span>

                  <div className="flex-1">
                    <p className="font-bold">
                      Dashboard Error
                    </p>

                    <p className="text-sm mt-1">
                      {error}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setError("")
                    }
                    className="text-xl"
                  >
                    ×
                  </button>

                </div>

              </div>
            )}

            {/* TITLE */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-7 gap-4">

              <div>

                <p className="text-sm font-semibold text-[#ff7358]">
                  OVERVIEW
                </p>

                <h2
                  className={
                    darkMode
                      ? "text-3xl md:text-4xl font-extrabold text-white mt-1"
                      : "text-3xl md:text-4xl font-extrabold text-[#30385d] mt-1"
                  }
                >
                  EcoShop Dashboard
                </h2>

                <p
                  className={
                    darkMode
                      ? "text-gray-400 mt-1"
                      : "text-gray-500 mt-1"
                  }
                >
                  Live store statistics from your backend.
                </p>

              </div>

              <button
                onClick={() =>
                  fetchDashboard(true)
                }
                disabled={refreshing}
                className="self-start bg-[#4c5f9f] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#40528c] disabled:opacity-50"
              >
                {refreshing
                  ? "Refreshing..."
                  : "↻ Refresh"}
              </button>

            </div>

            {/* ==================================================
                STAT CARDS
            ================================================== */}

            <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">

              <StatCard
                icon="👥"
                iconBg="bg-[#e7faf5]"
                iconColor="text-[#28ad91]"
                title="Total Users"
                subtitle="Registered users"
                value={stats.totalUsers}
              />

              <StatCard
                icon="🛒"
                iconBg="bg-[#edf0ff]"
                iconColor="text-[#4d5f9c]"
                title="Products"
                subtitle="Store products"
                value={stats.totalProducts}
              />

              <StatCard
                icon="▤"
                iconBg="bg-[#fff5e5]"
                iconColor="text-[#f5a83c]"
                title="Total Orders"
                subtitle="All orders"
                value={stats.totalOrders}
              />

              <StatCard
                icon="⏳"
                iconBg="bg-[#fff5e5]"
                iconColor="text-[#f5a83c]"
                title="Pending Orders"
                subtitle="Orders waiting"
                value={stats.pendingOrders}
              />

              <StatCard
                icon="✓"
                iconBg="bg-[#e7faf5]"
                iconColor="text-[#28ad91]"
                title="Completed"
                subtitle="Completed orders"
                value={stats.completedOrders}
              />

            </div>

            {/* ==================================================
                TWO COLUMNS
            ================================================== */}

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 mt-5">

              {/* SALES */}

              <div
                className={
                  darkMode
                    ? "bg-[#202640] rounded-2xl p-6"
                    : "bg-white rounded-2xl p-6 shadow-sm"
                }
              >

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <h3
                      className={
                        darkMode
                          ? "font-bold text-white text-lg"
                          : "font-bold text-[#30385d] text-lg"
                      }
                    >
                      Sales Summary
                    </h3>

                    <p className="text-gray-400 text-sm">
                      Order performance from backend
                    </p>

                  </div>

                  <span className="bg-[#fff0ec] text-[#ff7358] px-3 py-2 rounded-lg text-xs font-bold">
                    LIVE
                  </span>

                </div>

                <SalesChart
                  orders={orders}
                />

              </div>

              {/* RIGHT */}

              <div className="space-y-5">

                {/* BALANCE */}

                <div className="bg-gradient-to-br from-[#ff8068] to-[#ff654c] rounded-2xl p-6 text-white shadow-lg">

                  <p className="text-white/80 text-sm">
                    Store Overview
                  </p>

                  <h3 className="text-3xl font-extrabold mt-1">
                    {stats.totalOrders}
                  </h3>

                  <p className="text-white/80 text-sm mt-1">
                    Total Orders
                  </p>

                  <div className="space-y-3 mt-6 text-sm">

                    <div className="flex justify-between">
                      <span>Users</span>
                      <b>
                        {stats.totalUsers}
                      </b>
                    </div>

                    <div className="flex justify-between">
                      <span>Products</span>
                      <b>
                        {stats.totalProducts}
                      </b>
                    </div>

                    <div className="flex justify-between">
                      <span>Completed</span>
                      <b>
                        {stats.completedOrders}
                      </b>
                    </div>

                  </div>

                  <button
                    onClick={() =>
                      navigate("/shop")
                    }
                    className="w-full bg-white text-[#ff654c] rounded-xl py-3 mt-6 font-bold"
                  >
                    View Products →
                  </button>

                </div>

                {/* ORDER OVERVIEW */}

                <div
                  className={
                    darkMode
                      ? "bg-[#202640] rounded-2xl p-5"
                      : "bg-white rounded-2xl p-5 shadow-sm"
                  }
                >

                  <h3
                    className={
                      darkMode
                        ? "font-bold text-white text-lg"
                        : "font-bold text-[#30385d] text-lg"
                    }
                  >
                    Order Overview
                  </h3>

                  <div className="mt-5 space-y-4">

                    <PaymentRow
                      color="bg-[#29ae96]"
                      name="Completed Orders"
                      amount={
                        stats.completedOrders
                      }
                    />

                    <PaymentRow
                      color="bg-[#ffb24e]"
                      name="Pending Orders"
                      amount={
                        stats.pendingOrders
                      }
                    />

                    <PaymentRow
                      color="bg-[#ff7258]"
                      name="Total Orders"
                      amount={
                        stats.totalOrders
                      }
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* ==================================================
                ORDERS
            ================================================== */}

            <div
              className={
                darkMode
                  ? "bg-[#202640] rounded-2xl p-6 mt-5"
                  : "bg-white rounded-2xl p-6 shadow-sm mt-5"
              }
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

                <div>

                  <h3
                    className={
                      darkMode
                        ? "font-bold text-white text-lg"
                        : "font-bold text-[#30385d] text-lg"
                    }
                  >
                    Recent Orders
                  </h3>

                  <p className="text-gray-400 text-sm">
                    Latest orders from your store
                  </p>

                </div>

                <span className="bg-[#eeeaff] text-[#6b5bc5] px-4 py-2 rounded-xl font-bold text-sm">
                  {stats.totalOrders} Orders
                </span>

              </div>

              {filteredOrders.length === 0 ? (

                <div className="py-12 text-center">

                  <div className="text-5xl">
                    📦
                  </div>

                  <p className="font-semibold mt-3 text-gray-500">
                    {getToken()
                      ? "No recent orders available"
                      : "Login as admin to view recent orders"}
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[750px]">

                    <thead>

                      <tr className="bg-[#465991] text-white text-sm">

                        <th className="text-left px-4 py-3 rounded-l-lg">
                          Customer
                        </th>

                        <th className="text-left px-4 py-3">
                          Date
                        </th>

                        <th className="text-left px-4 py-3">
                          Price
                        </th>

                        <th className="text-left px-4 py-3">
                          Product
                        </th>

                        <th className="text-left px-4 py-3 rounded-r-lg">
                          Status
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredOrders.map(
                        (order) => {

                          const customer =
                            order.user?.name ||
                            order.shippingAddress?.fullName ||
                            order.name ||
                            "Customer";

                          const email =
                            order.user?.email ||
                            order.email ||
                            "";

                          const product =
                            order.items?.[0]?.product?.name ||
                            order.items?.[0]?.name ||
                            "Product";

                          const amount =
                            order.totalAmount ??
                            order.total ??
                            order.amount ??
                            0;

                          return (
                            <tr
                              key={order._id}
                              className="border-b border-gray-100"
                            >

                              <td className="px-4 py-4">

                                <div className="flex items-center gap-3">

                                  <div className="w-10 h-10 rounded-full bg-[#e8edff] flex items-center justify-center">
                                    👤
                                  </div>

                                  <div>

                                    <p className="font-semibold text-[#30385d]">
                                      {customer}
                                    </p>

                                    {email && (
                                      <p className="text-xs text-gray-400">
                                        {email}
                                      </p>
                                    )}

                                  </div>

                                </div>

                              </td>

                              <td className="px-4 py-4 text-sm text-gray-500">
                                {order.createdAt
                                  ? new Date(
                                      order.createdAt
                                    ).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "N/A"}
                              </td>

                              <td className="px-4 py-4 font-bold text-[#ff7358]">
                                {money(amount)}
                              </td>

                              <td className="px-4 py-4">

                                <div className="flex items-center gap-3">

                                  <div className="w-10 h-10 rounded-lg bg-[#f1f3fa] flex items-center justify-center">
                                    🛍️
                                  </div>

                                  <span className="font-medium text-[#30385d]">
                                    {product}
                                  </span>

                                </div>

                              </td>

                              <td className="px-4 py-4">

                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    order.orderStatus ===
                                    "Delivered"
                                      ? "bg-green-100 text-green-700"
                                      : order.orderStatus ===
                                        "Cancelled"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {order.orderStatus ||
                                    "Pending"}
                                </span>

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>
              )}

            </div>

            {/* ==================================================
                CUSTOMERS
            ================================================== */}

            <div
              className={
                darkMode
                  ? "bg-[#202640] rounded-2xl p-6 mt-5"
                  : "bg-white rounded-2xl p-6 shadow-sm mt-5"
              }
            >

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h3
                    className={
                      darkMode
                        ? "font-bold text-white text-lg"
                        : "font-bold text-[#30385d] text-lg"
                    }
                  >
                    Customers
                  </h3>

                  <p className="text-gray-400 text-sm">
                    Registered users from backend
                  </p>

                </div>

                <span className="bg-[#eeeaff] text-[#6b5bc5] px-4 py-2 rounded-xl font-bold text-sm">
                  {stats.totalUsers} Users
                </span>

              </div>

              {users.length === 0 ? (

                <div className="py-10 text-center text-gray-400">
                  Login as admin to view customer details.
                </div>

              ) : (

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  {users
                    .slice(0, 8)
                    .map((user) => (

                      <div
                        key={user._id}
                        className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition"
                      >

                        <div className="flex items-center gap-3">

                          <div className="w-11 h-11 rounded-full bg-[#e9edff] flex items-center justify-center text-xl">
                            👤
                          </div>

                          <div className="min-w-0">

                            <p className="font-bold text-[#30385d] truncate">
                              {user.name ||
                                "Customer"}
                            </p>

                            <p className="text-xs text-gray-400 truncate">
                              {user.email ||
                                "No email"}
                            </p>

                          </div>

                        </div>

                        <div className="mt-4">

                          <span
                            className={
                              user.isAdmin
                                ? "bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold"
                                : "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold"
                            }
                          >
                            {user.isAdmin
                              ? "Admin"
                              : "Customer"}
                          </span>

                        </div>

                      </div>

                    ))}

                </div>
              )}

            </div>

          </div>

        </main>

      </div>
    </div>
  );
};

// ======================================================
// SIDEBAR ITEM
// ======================================================

const SidebarItem = ({
  icon,
  title,
  active = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl mb-1 text-left transition ${
        active
          ? "bg-white/15 text-white shadow-sm"
          : "text-blue-100 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className="w-5 text-center text-lg">
        {icon}
      </span>

      <span className="text-sm font-semibold">
        {title}
      </span>
    </button>
  );
};

// ======================================================
// STAT CARD
// ======================================================

const StatCard = ({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  value,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition">

      <div className="flex items-center gap-4">

        <div
          className={`w-12 h-12 rounded-full ${iconBg} ${iconColor} flex items-center justify-center text-xl font-bold flex-shrink-0`}
        >
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[#30385d] font-bold text-sm truncate">
            {title}
          </p>

          <p className="text-gray-400 text-xs mt-1 truncate">
            {subtitle}
          </p>

        </div>

      </div>

      <h3 className="text-2xl font-extrabold text-[#30385d] mt-5">
        {typeof value === "number"
          ? value.toLocaleString("en-IN")
          : value}
      </h3>

    </div>
  );
};

// ======================================================
// PAYMENT ROW
// ======================================================

const PaymentRow = ({
  color,
  name,
  amount,
}) => {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <span
          className={`w-2.5 h-2.5 rounded-full ${color}`}
        />

        <span className="text-sm text-gray-500">
          {name}
        </span>

      </div>

      <span className="bg-[#fff0ec] text-[#ff7358] px-2.5 py-1 rounded-lg text-xs font-bold">
        {amount}
      </span>

    </div>
  );
};

// ======================================================
// SALES CHART
// ======================================================

const SalesChart = ({ orders }) => {
  const points = useMemo(() => {
    const monthly = Array(12).fill(0);

    orders.forEach((order) => {
      if (!order.createdAt) {
        return;
      }

      const month = new Date(
        order.createdAt
      ).getMonth();

      const amount = Number(
        order.totalAmount ??
          order.total ??
          order.amount ??
          0
      );

      monthly[month] += amount;
    });

    const max = Math.max(
      ...monthly,
      1
    );

    return monthly.map(
      (value, index) => ({
        month: index,
        value,
        height:
          (value / max) * 100,
      })
    );
  }, [orders]);

  const labels = [
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

  const maxValue = Math.max(
    ...points.map(
      (p) => p.value
    ),
    1
  );

  const path = points
    .map((point, index) => {
      const x =
        5 +
        index *
          (90 / 11);

      const y =
        90 -
        (point.value /
          maxValue) *
          65;

      return `${
        index === 0
          ? "M"
          : "L"
      } ${x} ${y}`;
    })
    .join(" ");

  return (
    <div>

      <div className="relative h-[230px]">

        <div className="absolute inset-0 flex flex-col justify-between">

          {[0, 1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="border-t border-dashed border-gray-200"
              />
            )
          )}

        </div>

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full overflow-visible"
        >

          <defs>

            <linearGradient
              id="salesGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >

              <stop
                offset="0%"
                stopColor="#ff7358"
                stopOpacity="0.22"
              />

              <stop
                offset="100%"
                stopColor="#ff7358"
                stopOpacity="0"
              />

            </linearGradient>

          </defs>

          <path
            d={`${path} L 95 95 L 5 95 Z`}
            fill="url(#salesGradient)"
          />

          <path
            d={path}
            fill="none"
            stroke="#ff7358"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />

        </svg>

        {points.map(
          (point, index) => {
            const left =
              5 +
              index *
                (90 / 11);

            const top =
              90 -
              (point.value /
                maxValue) *
                65;

            return (
              <div
                key={index}
                className="absolute w-2.5 h-2.5 bg-[#ff7358] rounded-full border-2 border-white shadow"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  transform:
                    "translate(-50%, -50%)",
                }}
              />
            );
          }
        )}

        <div className="absolute left-0 right-0 bottom-[-25px] flex justify-between text-xs text-gray-400">

          {labels.map(
            (label) => (
              <span key={label}>
                {label}
              </span>
            )
          )}

        </div>

      </div>

      <div className="mt-8 flex justify-between text-xs text-gray-400">

        <span>₹0</span>

        <span>
          ₹
          {Number(
            maxValue
          ).toLocaleString(
            "en-IN"
          )}
        </span>

      </div>

    </div>
  );
};

export default Dashboard;