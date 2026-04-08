"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  getCategoryStats,
} from "@/components/lib/categories";

export default function CategoriesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", is_active: true });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Sidebar state
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarLinks = [
    { id: "dashboard", label: "Dashboard", icon: "fa-chart-line" },
    { id: "users", label: "User Management", icon: "fa-users" },
    { id: "documents", label: "Documents", icon: "fa-file-alt" },
    { id: "categories", label: "Categories", icon: "fa-folder" },
    { id: "workflows", label: "Workflows", icon: "fa-sitemap" },
    { id: "reports", label: "Reports", icon: "fa-chart-bar" },
    { id: "settings", label: "Settings", icon: "fa-cog", divider: true },
  ];

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        is_active: filterActive === "true" ? true : filterActive === "false" ? false : undefined,
      };

      const response = await getCategories(params);
      const data = response.data?.data || response.data;

      setCategories(data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filterActive]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getCategoryStats();
      setStats(response.data?.data || response.data || { total: 0, active: 0, inactive: 0 });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, [fetchCategories, fetchStats]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedCategory(null);
    setFormData({ name: "", description: "", is_active: true });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      is_active: category.is_active,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      if (modalMode === "create") {
        await createCategory(formData);
      } else {
        await updateCategory(selectedCategory.id, formData);
      }
      setShowModal(false);
      fetchCategories();
      fetchStats();
    } catch (error) {
      setFormError(error.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory(id);
      fetchCategories();
      fetchStats();
    } catch (error) {
      alert(error.message || "Failed to delete category");
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await toggleCategoryActive(id, !currentStatus);
      fetchCategories();
      fetchStats();
    } catch (error) {
      alert(error.message || "Failed to update category status");
    }
  };

  const navigateTo = (link) => {
    setMobileMenuOpen(false);
    if (link === "dashboard") router.push("/admin");
    else if (link === "users") router.push("/admin/users");
    else if (link === "documents") router.push("/documents");
    else if (link === "categories") return;
  };

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

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:relative z-50 h-full bg-[#366189] text-white flex flex-col
            transition-all duration-300 ease-in-out
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            ${sidebarHovered ? "lg:w-64" : "lg:w-16"}
            w-64
          `}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <div className={`p-4 flex items-center gap-3 ${!sidebarHovered && "lg:justify-center"}`}>
            <i className="fa-solid fa-layer-group text-2xl flex-shrink-0"></i>
            <span
              className={`text-xl font-bold tracking-tight whitespace-nowrap transition-opacity duration-200 ${
                !sidebarHovered && "lg:hidden"
              }`}
            >
              Docflow
            </span>
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
                onClick={() => navigateTo(link.id)}
                className={`flex items-center gap-4 px-4 py-3 transition-all hover:bg-white/10 cursor-pointer ${
                  link.id === "categories"
                    ? "bg-white/20 border-l-4 border-white"
                    : "opacity-80 hover:opacity-100"
                } ${link.divider ? "border-t border-white/10 pt-4 mt-2" : ""} ${
                  !sidebarHovered && "lg:justify-center lg:px-0"
                }`}
              >
                <i
                  className={`fa-solid ${link.icon} w-5 flex-shrink-0 ${
                    !sidebarHovered && "lg:w-full lg:text-center"
                  }`}
                ></i>
                <span
                  className={`whitespace-nowrap transition-opacity duration-200 ${
                    !sidebarHovered && "lg:hidden"
                  }`}
                >
                  {link.label}
                </span>
              </a>
            ))}
          </nav>

          <div className={`p-4 border-t border-white/10 ${!sidebarHovered && "lg:p-2"}`}>
            <div className={`flex items-center gap-3 ${!sidebarHovered && "lg:justify-center"}`}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || "Admin"
                )}&background=random`}
                className={`rounded-full border border-white/20 flex-shrink-0 ${
                  sidebarHovered ? "w-10 h-10" : "w-10 h-10 lg:w-8 lg:h-8"
                }`}
                alt="Admin"
              />
              <div
                className={`transition-opacity duration-200 ${!sidebarHovered && "lg:hidden"}`}
              >
                <p className="text-sm font-bold truncate max-w-[140px]">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs opacity-60">Admin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow flex flex-col overflow-y-auto w-full">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden text-gray-600 hover:text-[#366189] transition-colors cursor-pointer"
                onClick={() => setMobileMenuOpen(true)}
              >
                <i className="fa-solid fa-bars text-xl"></i>
              </button>
              <h1 className="text-lg md:text-xl font-bold text-gray-800">
                <span className="hidden sm:inline">Admin Console / </span>
                <span className="text-gray-400 font-medium">Categories</span>
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="text-sm hidden sm:inline">Logout</span>
            </button>
          </header>

          <div className="p-4 md:p-8 space-y-6">
            {/* Stats Cards */}
            <div className="flex gap-3 md:gap-6 overflow-x-auto pb-2 md:pb-0 md:grid md:grid-cols-3 scrollbar-hide">
              <div className="flex-shrink-0 w-40 md:w-auto bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 md:p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-folder text-lg md:text-xl"></i>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm opacity-80">Total</p>
                    <h3 className="text-xl md:text-2xl font-bold">{stats.total}</h3>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 w-40 md:w-auto bg-gradient-to-br from-green-500 to-green-600 text-white p-4 md:p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-check text-lg md:text-xl"></i>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm opacity-80">Active</p>
                    <h3 className="text-xl md:text-2xl font-bold">{stats.active}</h3>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 w-40 md:w-auto bg-gradient-to-br from-gray-500 to-gray-600 text-white p-4 md:p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-pause text-lg md:text-xl"></i>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm opacity-80">Inactive</p>
                    <h3 className="text-xl md:text-2xl font-bold">{stats.inactive}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 flex-grow">
                  <div className="relative flex-grow max-w-md">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none"
                    />
                  </div>
                  <select
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-[#366189] text-white rounded-lg hover:bg-[#2a4d6d] transition-colors flex items-center gap-2 justify-center cursor-pointer"
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <i className="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <i className="fa-solid fa-folder-open text-4xl mb-2"></i>
                  <p>No categories found</p>
                </div>
              ) : (
                <>
                  {/* Mobile View */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {categories.map((category) => (
                      <div key={category.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">{category.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {category.description || "No description"}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              category.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {category.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-400">
                            {category.document_count || 0} documents
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(category)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                            >
                              <i className="fa-solid fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleToggleActive(category.id, category.is_active)}
                              className={`p-2 rounded cursor-pointer ${
                                category.is_active
                                  ? "text-gray-600 hover:bg-gray-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                            >
                              <i
                                className={`fa-solid ${
                                  category.is_active ? "fa-pause" : "fa-play"
                                }`}
                              ></i>
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View */}
                  <table className="w-full hidden md:table">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Documents
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {categories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#366189]/10 rounded-lg flex items-center justify-center">
                                <i className="fa-solid fa-folder text-[#366189]"></i>
                              </div>
                              <span className="font-medium text-gray-800">{category.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {category.description || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {category.document_count || 0}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                category.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {category.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditModal(category)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <i className="fa-solid fa-edit"></i>
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleActive(category.id, category.is_active)
                                }
                                className={`p-2 rounded transition-colors cursor-pointer ${
                                  category.is_active
                                    ? "text-gray-600 hover:bg-gray-50"
                                    : "text-green-600 hover:bg-green-50"
                                }`}
                                title={category.is_active ? "Deactivate" : "Activate"}
                              >
                                <i
                                  className={`fa-solid ${
                                    category.is_active ? "fa-pause" : "fa-play"
                                  }`}
                                ></i>
                              </button>
                              <button
                                onClick={() => handleDelete(category.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} categories
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">
                  {modalMode === "create" ? "Add Category" : "Edit Category"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none"
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none resize-none"
                    placeholder="Category description (optional)"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#366189] rounded border-gray-300 focus:ring-[#366189]"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-[#366189] text-white rounded-lg hover:bg-[#2a4d6d] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? "Saving..." : modalMode === "create" ? "Create" : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
