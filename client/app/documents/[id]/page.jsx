"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import AuthGuard from "@/components/auth/auth-guard";
import {
  getDocumentById,
  updateDocument,
  deleteDocument,
  uploadDocumentFile,
  deleteDocumentFile,
  getDocumentVersions,
  getFileDownloadUrl,
  getVersionDownloadUrl,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from "@/components/lib/documents";

export default function DocumentDetailPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const documentId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [document, setDocument] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("files");

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

  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      if (!documentId) return;
      const response = await getDocumentById(documentId);
      setDocument(response.data || response || null);
    } catch (error) {
      console.error("Error fetching document:", error);
      router.push("/documents");
    } finally {
      setLoading(false);
    }
  }, [documentId, router]);

  const fetchVersions = useCallback(async () => {
    try {
      if (!documentId) return;
      const response = await getDocumentVersions(documentId);
      setVersions(response.data || response || []);
    } catch (error) {
      console.error("Error fetching versions:", error);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      fetchDocument();
      fetchVersions();
    }
  }, [documentId, fetchDocument, fetchVersions]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadDocumentFile(documentId, file);
      fetchDocument();
    } catch (error) {
      alert(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await deleteDocumentFile(documentId, fileId);
      fetchDocument();
    } catch (error) {
      alert(error.message || "Failed to delete file");
    }
  };

  const handleDeleteDocument = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await deleteDocument(documentId);
      router.push("/documents");
    } catch (error) {
      alert(error.message || "Failed to delete document");
    }
  };

  const navigateTo = (link) => {
    setMobileMenuOpen(false);
    if (link === "dashboard") router.push("/admin");
    else if (link === "users") router.push("/admin/users");
    else if (link === "documents") router.push("/documents");
    else if (link === "categories") router.push("/admin/categories");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes("pdf")) return "fa-file-pdf text-red-500";
    if (fileType?.includes("word")) return "fa-file-word text-blue-500";
    if (fileType?.includes("excel") || fileType?.includes("spreadsheet")) return "fa-file-excel text-green-500";
    if (fileType?.includes("powerpoint") || fileType?.includes("presentation")) return "fa-file-powerpoint text-orange-500";
    if (fileType?.includes("image")) return "fa-file-image text-purple-500";
    return "fa-file text-gray-500";
  };

  const getStatusBadge = (status) => {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
    return `${colors.bg} ${colors.text}`;
  };

  const getPriorityBadge = (priority) => {
    const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
    return `${colors.bg} ${colors.text}`;
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-[#366189] mb-4"></i>
            <p className="text-gray-500">Loading document...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!document) {
    return (
      <AuthGuard>
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <i className="fa-solid fa-file-circle-xmark text-4xl text-red-500 mb-4"></i>
            <p className="text-gray-500">Document not found</p>
            <button
              onClick={() => router.push("/documents")}
              className="mt-4 px-4 py-2 bg-[#366189] text-white rounded-lg hover:bg-[#2a4d6d] cursor-pointer"
            >
              Back to Documents
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
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
            <span className={`text-xl font-bold tracking-tight whitespace-nowrap transition-opacity duration-200 ${!sidebarHovered && "lg:hidden"}`}>
              Docflow
            </span>
            <button className="ml-auto lg:hidden text-white/80 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </div>

          <nav className="flex-grow mt-4 space-y-1 overflow-hidden">
            {sidebarLinks.map((link) => (
              <a
                key={link.id}
                onClick={() => navigateTo(link.id)}
                className={`flex items-center gap-4 px-4 py-3 transition-all hover:bg-white/10 cursor-pointer ${
                  link.id === "documents" ? "bg-white/20 border-l-4 border-white" : "opacity-80 hover:opacity-100"
                } ${!sidebarHovered && "lg:justify-center lg:px-0"}`}
              >
                <i className={`fa-solid ${link.icon} w-5 flex-shrink-0 ${!sidebarHovered && "lg:w-full lg:text-center"}`}></i>
                <span className={`whitespace-nowrap transition-opacity duration-200 ${!sidebarHovered && "lg:hidden"}`}>{link.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow flex flex-col overflow-y-auto w-full">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button className="lg:hidden text-gray-600 hover:text-[#366189] transition-colors cursor-pointer" onClick={() => setMobileMenuOpen(true)}>
                <i className="fa-solid fa-bars text-xl"></i>
              </button>
              <button onClick={() => router.push("/documents")} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate max-w-[200px] md:max-w-none">{document.title}</h1>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors cursor-pointer">
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="text-sm hidden sm:inline">Logout</span>
            </button>
          </header>

          <div className="p-4 md:p-8 space-y-6">
            {/* Document Info Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#366189]/10 rounded-lg flex items-center justify-center">
                      <i className="fa-solid fa-file-alt text-[#366189] text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{document.title}</h2>
                      <p className="text-sm text-gray-400">{document.category_name || "Uncategorized"}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{document.description || "No description provided"}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span><i className="fa-solid fa-user mr-1"></i> {document.creator_name}</span>
                    <span><i className="fa-solid fa-building mr-1"></i> {document.department_name || "No department"}</span>
                    <span><i className="fa-solid fa-calendar mr-1"></i> {formatDate(document.created_at)}</span>
                    <span><i className="fa-solid fa-code-branch mr-1"></i> Version {document.current_version}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(document.status)}`}>
                      {document.status.replace("_", " ")}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadge(document.priority)}`}>
                      {document.priority}
                    </span>
                  </div>
                  <button
                    onClick={handleDeleteDocument}
                    className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-trash mr-2"></i>
                    Delete Document
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("files")}
                className={`pb-3 px-2 font-medium transition-colors cursor-pointer ${
                  activeTab === "files"
                    ? "text-[#366189] border-b-2 border-[#366189]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <i className="fa-solid fa-paperclip mr-2"></i>
                Files ({document.files?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("versions")}
                className={`pb-3 px-2 font-medium transition-colors cursor-pointer ${
                  activeTab === "versions"
                    ? "text-[#366189] border-b-2 border-[#366189]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <i className="fa-solid fa-history mr-2"></i>
                Version History ({versions.length})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "files" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Upload Section */}
                <div className="p-4 border-b border-gray-100">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#366189] text-white rounded-lg hover:bg-[#2a4d6d] transition-colors cursor-pointer">
                    {uploading ? (
                      <><i className="fa-solid fa-spinner fa-spin"></i> Uploading...</>
                    ) : (
                      <><i className="fa-solid fa-upload"></i> Upload File</>
                    )}
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar"
                    />
                  </label>
                </div>

                {/* Files List */}
                {!document.files || document.files.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <i className="fa-solid fa-folder-open text-4xl mb-2"></i>
                    <p>No files uploaded</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {document.files.map((file) => (
                      <div key={file.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <i className={`fa-solid ${getFileIcon(file.file_type)} text-2xl`}></i>
                          <div>
                            <p className="font-medium text-gray-800">{file.file_name}</p>
                            <p className="text-xs text-gray-400">
                              {formatFileSize(file.file_size)} • {file.file_extension.toUpperCase()} • {formatDate(file.created_at)}
                            </p>
                          </div>
                          {file.is_primary && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Primary</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={getFileDownloadUrl(documentId, file.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[#366189] hover:bg-[#366189]/10 rounded transition-colors cursor-pointer"
                            title="Download"
                          >
                            <i className="fa-solid fa-download"></i>
                          </a>
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "versions" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {versions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <i className="fa-solid fa-code-branch text-4xl mb-2"></i>
                    <p>No version history</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {versions.map((version) => (
                      <div key={version.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            version.is_current ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}>
                            v{version.version_number}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{version.change_summary}</p>
                            <p className="text-xs text-gray-400">
                              {formatFileSize(version.file_size)} • {formatDate(version.created_at)}
                            </p>
                          </div>
                          {version.is_current && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Current</span>
                          )}
                        </div>
                        <a
                          href={getVersionDownloadUrl(documentId, version.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-[#366189] hover:bg-[#366189]/10 rounded transition-colors cursor-pointer"
                          title="Download this version"
                        >
                          <i className="fa-solid fa-download"></i>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
