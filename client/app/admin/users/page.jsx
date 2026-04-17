"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import AuthGuard from "@/components/auth/auth-guard";
import UserTable from "@/components/admin/userTable";
import UserModal from "@/components/admin/userModal";
import {
  getUsers,
  deleteUser,
  toggleUserActive,
  getRoles,
  getDepartments,
  getUserStats,
} from "@/components/lib/users";

export default function UsersPage() {
  const router = useRouter();
  const { user: authUser, logout, loading: authLoading } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [filters, setFilters] = useState({
    search: "",
    role_id: "",
    dep_id: "",
    is_active: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Sidebar state
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sidebar links
  const sidebarLinks = [
    { id: "dashboard", icon: "fa-chart-pie", label: "Dashboard", href: "/admin" },
    { id: "users", icon: "fa-users", label: "User Management", href: "/admin/users" },
    { id: "documents", icon: "fa-folder-open", label: "Document Repository", href: "/documents" },
    { id: "categories", icon: "fa-folder", label: "Categories", href: "/admin/categories" },
    { id: "workflows", icon: "fa-route", label: "Workflow Automation", href: "#" },
    { id: "audit", icon: "fa-clipboard-list", label: "Audit Logs", href: "#" },
    { id: "settings", icon: "fa-gear", label: "System Settings", href: "#", divider: true },
  ];

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      };
      const response = await getUsers(params);
      const result = response.data || response;
      setUsers(result.data || []);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 0,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortOrder, filters]);

  // Fetch roles, departments, stats
  const fetchMetadata = useCallback(async () => {
    try {
      const [rolesRes, depsRes, statsRes] = await Promise.all([
        getRoles(),
        getDepartments(),
        getUserStats(),
      ]);
      setRoles(rolesRes.data || rolesRes || []);
      setDepartments(depsRes.data || depsRes || []);
      setStats(statsRes.data || statsRes || null);
    } catch (err) {
      console.error("Failed to fetch metadata:", err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && authUser?.role === "admin") {
      fetchUsers();
      fetchMetadata();
    }
  }, [authLoading, authUser, fetchUsers, fetchMetadata]);

  useEffect(() => {
    if (!authLoading && (!authUser || authUser.role !== "admin")) {
      router.push("/");
    }
  }, [authLoading, authUser, router]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (userData) => {
    setEditingUser(userData);
    setModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      fetchUsers();
      fetchMetadata();
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await toggleUserActive(userId);
      fetchUsers();
      fetchMetadata();
    } catch (err) {
      alert("Failed to toggle user status: " + err.message);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    setEditingUser(null);
    fetchUsers();
    fetchMetadata();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#366189]"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Desktop: hover expand, Mobile: hamburger */}
        <aside 
          className={`
            fixed lg:relative z-50 h-full bg-[#366189] text-white flex flex-col
            transition-all duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${sidebarHovered ? 'lg:w-64' : 'lg:w-16'}
            w-64
          `}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <div className={`p-4 flex items-center gap-3 ${!sidebarHovered && 'lg:justify-center'}`}>
            <i className="fa-solid fa-layer-group text-2xl flex-shrink-0"></i>
            <span className={`text-xl font-bold tracking-tight whitespace-nowrap transition-opacity duration-200 ${!sidebarHovered && 'lg:hidden'}`}>
              Docflow
            </span>
            {/* Mobile close button */}
            <button 
              className="ml-auto lg:hidden text-white/80 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>

          <nav className="flex-grow mt-4 space-y-1 overflow-hidden">
            {sidebarLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 transition-all hover:bg-white/10 cursor-pointer ${
                  link.id === "users"
                    ? "bg-white/20 border-l-4 border-white"
                    : "opacity-80 hover:opacity-100"
                } ${link.divider ? "border-t border-white/10 pt-4 mt-2" : ""} ${!sidebarHovered && 'lg:justify-center lg:px-0'}`}
              >
                <i className={`fa-solid ${link.icon} w-5 flex-shrink-0 ${!sidebarHovered && 'lg:w-full lg:text-center'}`}></i>
                <span className={`whitespace-nowrap transition-opacity duration-200 ${!sidebarHovered && 'lg:hidden'}`}>
                  {link.label}
                </span>
              </a>
            ))}
          </nav>

          <div className={`p-4 border-t border-white/10 ${!sidebarHovered && 'lg:p-2'}`}>
            <div className={`flex items-center gap-3 ${!sidebarHovered && 'lg:justify-center'}`}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.name || "Admin User")}&background=random`}
                className={`rounded-full border border-white/20 flex-shrink-0 ${sidebarHovered ? 'w-10 h-10' : 'w-10 h-10 lg:w-8 lg:h-8'}`}
                alt="Admin"
              />
              <div className={`transition-opacity duration-200 ${!sidebarHovered && 'lg:hidden'}`}>
                <p className="text-sm font-bold truncate max-w-[140px]">{authUser?.name || "Admin User"}</p>
                <p className="text-xs opacity-60">Super Admin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow flex flex-col overflow-y-auto w-full">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-4">
              {/* Mobile hamburger */}
              <button 
                className="lg:hidden text-gray-600 hover:text-[#366189] transition-colors cursor-pointer"
                onClick={() => setMobileMenuOpen(true)}
              >
                <i className="fa-solid fa-bars text-xl"></i>
              </button>
              <h1 className="text-lg md:text-xl font-bold text-gray-800">
                <span className="hidden sm:inline">Admin Console / </span>
                <span className="text-gray-400 font-medium">User Management</span>
              </h1>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <button className="relative cursor-pointer text-gray-500 hover:text-[#366189] transition-colors">
                <i className="fa-solid fa-bell text-lg"></i>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">3</span>
              </button>
              <button 
                onClick={logout}
                className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-600 transition-colors"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 md:p-8">
            {/* Stats Cards - Horizontal scroll on mobile */}
            <div className="mb-6 md:mb-8">
              <div className="flex gap-3 md:gap-6 overflow-x-auto pb-2 md:pb-0 md:grid md:grid-cols-4 scrollbar-hide">
                {/* Total Users */}
                <div className="flex-shrink-0 w-40 md:w-auto bg-gradient-to-br from-[#366189] to-[#4a7a9e] rounded-xl p-4 md:p-5 shadow-lg text-white">
                  <div className="flex items-center justify-between mb-2">
                    <i className="fa-solid fa-users text-white/80 text-lg"></i>
                    <span className="text-2xl md:text-3xl font-bold">{stats?.total || 0}</span>
                  </div>
                  <p className="text-white/80 text-xs md:text-sm">Total Users</p>
                </div>
                {/* Active Users */}
                <div className="flex-shrink-0 w-40 md:w-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 md:p-5 shadow-lg text-white">
                  <div className="flex items-center justify-between mb-2">
                    <i className="fa-solid fa-user-check text-white/80 text-lg"></i>
                    <span className="text-2xl md:text-3xl font-bold">{stats?.active || 0}</span>
                  </div>
                  <p className="text-white/80 text-xs md:text-sm">Active</p>
                </div>
                {/* Inactive Users */}
                <div className="flex-shrink-0 w-40 md:w-auto bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 md:p-5 shadow-lg text-white">
                  <div className="flex items-center justify-between mb-2">
                    <i className="fa-solid fa-user-times text-white/80 text-lg"></i>
                    <span className="text-2xl md:text-3xl font-bold">{stats?.inactive || 0}</span>
                  </div>
                  <p className="text-white/80 text-xs md:text-sm">Inactive</p>
                </div>
                {/* Admins */}
                <div className="flex-shrink-0 w-40 md:w-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 md:p-5 shadow-lg text-white">
                  <div className="flex items-center justify-between mb-2">
                    <i className="fa-solid fa-user-shield text-white/80 text-lg"></i>
                    <span className="text-2xl md:text-3xl font-bold">
                      {stats?.byRole?.find((r) => r.role_name?.toLowerCase() === "admin")?.count || 0}
                    </span>
                  </div>
                  <p className="text-white/80 text-xs md:text-sm">Admins</p>
                </div>
              </div>
            </div>

            {/* Filters & Add Button */}
            <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-col gap-4">
                {/* Search and Add - always visible */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189]"
                    />
                  </div>
                  <button
                    onClick={handleCreateUser}
                    className="bg-[#366189] hover:bg-[#2a4d6d] text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer font-medium whitespace-nowrap"
                  >
                    <i className="fa-solid fa-plus"></i>
                    <span className="hidden sm:inline">Add User</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
                {/* Filter dropdowns */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <select
                    value={filters.role_id}
                    onChange={(e) => handleFilterChange("role_id", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] cursor-pointer text-sm"
                  >
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.dep_id}
                    onChange={(e) => handleFilterChange("dep_id", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] cursor-pointer text-sm"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dep) => (
                      <option key={dep.id} value={dep.id}>
                        {dep.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.is_active}
                    onChange={(e) => handleFilterChange("is_active", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] cursor-pointer text-sm col-span-2 md:col-span-1"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {error}
              </div>
            )}

            {/* Table */}
            <UserTable
              users={users}
              loading={loading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onToggleActive={handleToggleActive}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <p className="text-gray-500 text-sm order-2 sm:order-1">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} users
                </p>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <span className="px-3 py-2 bg-[#366189] text-white rounded-lg font-medium">
                    {pagination.page}
                  </span>
                  <span className="text-gray-400">of</span>
                  <span className="text-gray-600 font-medium">{pagination.totalPages}</span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Modal */}
        {modalOpen && (
          <UserModal
            user={editingUser}
            roles={roles}
            departments={departments}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    </AuthGuard>
  );
}
