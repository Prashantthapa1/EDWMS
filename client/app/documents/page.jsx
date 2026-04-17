"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import AuthGuard from "@/components/auth/auth-guard";
import DocumentUploadModal from "@/components/documents/DocumentUploadModal";
import {
  getDocuments,
  getMyDocuments,
  createDocument,
  deleteDocument,
  getDocumentStats,
  DOCUMENT_STATUS,
  DOCUMENT_PRIORITY,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from "@/components/lib/documents";
import { getActiveCategories } from "@/components/lib/categories";
import { getDepartments } from "@/components/lib/users";

export default function DocumentsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({ total: 0, draft: 0, submitted: 0, under_review: 0, approved: 0, rejected: 0 });
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [viewMode, setViewMode] = useState("all"); // "all" or "my"
  
  // Metadata
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Sidebar
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarLinks = [
    { id: "dashboard", icon: "fa-chart-pie", label: "Dashboard", href: "/admin" },
    { id: "users", icon: "fa-users", label: "User Management", href: "/admin/users" },
    { id: "documents", icon: "fa-folder-open", label: "Document Repository", href: "/documents" },
    { id: "categories", icon: "fa-folder", label: "Categories", href: "/admin/categories" },
    { id: "workflows", icon: "fa-route", label: "Workflow Automation", href: "#" },
    { id: "audit", icon: "fa-clipboard-list", label: "Audit Logs", href: "#" },
    { id: "settings", icon: "fa-gear", label: "System Settings", href: "#", divider: true },
  ];

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        category_id: filterCategory || undefined,
        status: filterStatus || undefined,
        priority: filterPriority || undefined,
      };

      const response = viewMode === "my"
        ? await getMyDocuments(params)
        : await getDocuments(params);

      const data = response.data || {};

      setDocuments(data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filterCategory, filterStatus, filterPriority, viewMode]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getDocumentStats(viewMode === "my");
      setStats(response.data || {});
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [viewMode]);

  const fetchMetadata = useCallback(async () => {
    try {
      const [catRes, depRes] = await Promise.all([getActiveCategories(), getDepartments()]);
      const catData = catRes.data || {};
      const depData = depRes.data || {};
      setCategories(catData.data || []);
      setDepartments(depData.data || []);
      console.error("Error fetching metadata:", error);
    } catch(err) {

    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [fetchDocuments, fetchStats]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleCreateDocument = async (formData, files) => {
    await createDocument(formData, files);
    fetchDocuments();
    fetchStats();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    try {
      await deleteDocument(id);
      fetchDocuments();
      fetchStats();
    } catch (error) {
      alert(error.message || "Failed to delete document");
    }
  };

  const navigateTo = (link) => {
    setMobileMenuOpen(false);
    if (link === "dashboard") router.push("/admin");
    else if (link === "users") router.push("/admin/users");
    else if (link === "documents") return;
    else if (link === "categories") router.push("/admin/categories");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
    return `${colors.bg} ${colors.text}`;
  };

  const getPriorityBadge = (priority) => {
    const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
    return `${colors.bg} ${colors.text}`;
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
            <i className="fa-solid fa-layer-group text-2xl shrink-0"></i>
            <span className={`text-xl font-bold tracking-tight whitespace-nowrap transition-opacity duration-200 ${!sidebarHovered && "lg:hidden"}`}>
              Docflow
            </span>
            <button
              className="ml-auto lg:hidden text-white/80 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>

          <nav className="grow mt-4 space-y-1 overflow-hidden">
            {sidebarLinks.map((link) => (
              <a
                key={link.id}
                onClick={() => navigateTo(link.id)}
                className={`flex items-center gap-4 px-4 py-3 transition-all hover:bg-white/10 cursor-pointer ${
                  link.id === "documents" ? "bg-white/20 border-l-4 border-white" : "opacity-80 hover:opacity-100"
                } ${link.divider ? "border-t border-white/10 pt-4 mt-2" : ""} ${!sidebarHovered && "lg:justify-center lg:px-0"}`}
              >
                <i className={`fa-solid ${link.icon} w-5 shrink-0 ${!sidebarHovered && "lg:w-full lg:text-center"}`}></i>
                <span className={`whitespace-nowrap transition-opacity duration-200 ${!sidebarHovered && "lg:hidden"}`}>
                  {link.label}
                </span>
              </a>
            ))}
          </nav>

          <div className={`p-4 border-t border-white/10 ${!sidebarHovered && "lg:p-2"}`}>
            <div className={`flex items-center gap-3 ${!sidebarHovered && "lg:justify-center"}`}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`}
                className={`rounded-full border border-white/20 shrink-0 ${sidebarHovered ? "w-10 h-10" : "w-10 h-10 lg:w-8 lg:h-8"}`}
                alt="User"
              />
              <div className={`transition-opacity duration-200 ${!sidebarHovered && "lg:hidden"}`}>
                <p className="text-sm font-bold truncate max-w-35">{user?.name || "User"}</p>
                <p className="text-xs opacity-60">{user?.role || "User"}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="grow flex flex-col overflow-y-auto w-full">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden text-gray-600 hover:text-[#366189] transition-colors cursor-pointer"
                onClick={() => setMobileMenuOpen(true)}
              >
                <i className="fa-solid fa-bars text-xl"></i>
              </button>
              <h1 className="text-lg md:text-xl font-bold text-gray-800">Documents</h1>
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
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <div className="shrink-0 w-32 md:w-auto bg-linear-to-br from-blue-500 to-blue-600 text-white p-3 md:p-4 rounded-xl shadow-sm">
                <p className="text-xs opacity-80">Total</p>
                <h3 className="text-xl md:text-2xl font-bold">{stats.total}</h3>
              </div>
              <div className="shrink-0 w-32 md:w-auto bg-linear-to-br from-gray-400 to-gray-500 text-white p-3 md:p-4 rounded-xl shadow-sm">
                <p className="text-xs opacity-80">Draft</p>
                <h3 className="text-xl md:text-2xl font-bold">{stats.draft}</h3>
              </div>
              <div className="shrink-0 w-32 md:w-auto bg-linear-to-br from-indigo-500 to-indigo-600 text-white p-3 md:p-4 rounded-xl shadow-sm">
                <p className="text-xs opacity-80">Submitted</p>
                <h3 className="text-xl md:text-2xl font-bold">{stats.submitted}</h3>
              </div>
              <div className="shrink-0 w-32 md:w-auto bg-linear-to-br from-yellow-500 to-yellow-600 text-white p-3 md:p-4 rounded-xl shadow-sm">
                <p className="text-xs opacity-80">Under Review</p>
                <h3 className="text-xl md:text-2xl font-bold">{stats.under_review}</h3>
              </div>
              <div className="shrink-0 w-32 md:w-auto bg-linear-to-br from-green-500 to-green-600 text-white p-3 md:p-4 rounded-xl shadow-sm">
                <p className="text-xs opacity-80">Approved</p>
                <h3 className="text-xl md:text-2xl font-bold">{stats.approved}</h3>
              </div>
              <div className="shrink-0 w-32 md:w-auto bg-linear-to-br from-red-500 to-red-600 text-white p-3 md:p-4 rounded-xl shadow-sm">
                <p className="text-xs opacity-80">Rejected</p>
                <h3 className="text-xl md:text-2xl font-bold">{stats.rejected}</h3>
              </div>
            </div>

            {/* View Toggle & Upload Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    viewMode === "all" ? "bg-white text-[#366189] shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
                >
                  All Documents
                </button>
                <button
                  onClick={() => setViewMode("my")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    viewMode === "my" ? "bg-white text-[#366189] shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
                >
                  My Documents
                </button>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-[#366189] text-white rounded-lg hover:bg-[#2a4d6d] transition-colors flex items-center gap-2 justify-center cursor-pointer"
              >
                <i className="fa-solid fa-plus"></i>
                <span>Upload Document</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative grow">
                  <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none"
                >
                  <option value="">All Status</option>
                  {Object.keys(DOCUMENT_STATUS).map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none"
                >
                  <option value="">All Priority</option>
                  {Object.keys(DOCUMENT_PRIORITY).map((priority) => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0) + priority.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Documents Grid */}
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
                <i className="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
                <i className="fa-solid fa-file-circle-question text-4xl mb-2"></i>
                <p>No documents found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#366189]/10 rounded-lg flex items-center justify-center">
                            <i className="fa-solid fa-file-alt text-[#366189]"></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 line-clamp-1">{doc.title}</h3>
                            <p className="text-xs text-gray-400">{doc.category_name || "Uncategorized"}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(doc.priority)}`}>
                          {doc.priority}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {doc.description || "No description provided"}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                        <span><i className="fa-solid fa-user mr-1"></i> {doc.creator_name}</span>
                        <span><i className="fa-solid fa-calendar mr-1"></i> {formatDate(doc.created_at)}</span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(doc.status)}`}>
                          {doc.status.replace("_", " ")}
                        </span>
                        <span className="text-xs text-gray-400">v{doc.current_version}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                      <button
                        onClick={() => router.push(`/documents/${doc.id}`)}
                        className="px-3 py-1.5 text-sm text-[#366189] hover:bg-[#366189]/10 rounded transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-eye mr-1"></i> View
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-trash mr-1"></i> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4">
                <p className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} documents
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
        </main>

        {/* Upload Modal */}
        <DocumentUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleCreateDocument}
        />
      </div>
    </AuthGuard>
  );
}
