"use client";

import { useState, useEffect } from "react";
import { getActiveCategories } from "@/components/lib/categories";
import { getDepartments } from "@/components/lib/users";
import { DOCUMENT_PRIORITY } from "@/components/lib/documents";

export default function DocumentUploadModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    category_id: "",
    department_id: "",
  });
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMetadata();
      if (initialData) {
        setFormData({
          title: initialData.title || "",
          description: initialData.description || "",
          priority: initialData.priority || "MEDIUM",
          category_id: initialData.category_id || "",
          department_id: initialData.department_id || "",
        });
      } else {
        setFormData({
          title: "",
          description: "",
          priority: "MEDIUM",
          category_id: "",
          department_id: "",
        });
        setFiles([]);
      }
      setError("");
    }
  }, [isOpen, initialData]);

  const fetchMetadata = async () => {
    try {
      const [catRes, depRes] = await Promise.all([getActiveCategories(), getDepartments()]);
      setCategories(catRes.data?.data || catRes.data || []);
      setDepartments(depRes.data?.data || depRes.data || []);
    } catch (err) {
      console.error("Error fetching metadata:", err);
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    addFiles(newFiles);
  };

  const addFiles = (newFiles) => {
    // Validate files
    const validFiles = newFiles.filter((file) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!initialData && files.length === 0) {
      setError("Please upload at least one file");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, files);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save document");
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (["pdf"].includes(ext)) return "fa-file-pdf text-red-500";
    if (["doc", "docx"].includes(ext)) return "fa-file-word text-blue-500";
    if (["xls", "xlsx"].includes(ext)) return "fa-file-excel text-green-500";
    if (["ppt", "pptx"].includes(ext)) return "fa-file-powerpoint text-orange-500";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "fa-file-image text-purple-500";
    return "fa-file text-gray-500";
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? "Edit Document" : "Upload Document"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <i className="fa-solid fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none"
                placeholder="Document title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none resize-none"
                placeholder="Document description (optional)"
              />
            </div>

            {/* Priority & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none"
                >
                  {Object.keys(DOCUMENT_PRIORITY).map((priority) => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0) + priority.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#366189]/20 focus:border-[#366189] outline-none"
              >
                <option value="">Select department</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            {!initialData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Files <span className="text-red-500">*</span>
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver
                      ? "border-[#366189] bg-[#366189]/5"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <i className="fa-solid fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                  <p className="text-gray-600 mb-2">Drag & drop files here, or</p>
                  <label className="inline-block px-4 py-2 bg-[#366189] text-white rounded-lg hover:bg-[#2a4d6d] transition-colors cursor-pointer">
                    Browse Files
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Max 5 files, 10MB each</p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <i className={`fa-solid ${getFileIcon(file)} text-xl`}></i>
                          <div>
                            <p className="text-sm font-medium text-gray-700 truncate max-w-[200px] md:max-w-[300px]">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#366189] text-white rounded-lg hover:bg-[#2a4d6d] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  {initialData ? "Updating..." : "Uploading..."}
                </>
              ) : initialData ? (
                "Update Document"
              ) : (
                "Upload Document"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
