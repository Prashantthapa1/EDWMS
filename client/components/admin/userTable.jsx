"use client";

export default function UserTable({
  users,
  loading,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "role_name", label: "Role", sortable: false },
    { key: "dep_name", label: "Department", sortable: false },
    { key: "is_active", label: "Status", sortable: true },
    { key: "created_at", label: "Created", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role) => {
    const roleColors = {
      admin: "bg-purple-100 text-purple-700",
      manager: "bg-blue-100 text-blue-700",
      reviewer: "bg-yellow-100 text-yellow-700",
      employee: "bg-gray-100 text-gray-700",
    };
    return roleColors[role?.toLowerCase()] || roleColors.employee;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#366189]"></div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <i className="fa-solid fa-users text-gray-300 text-4xl mb-3"></i>
          <p className="text-gray-500">No users found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort(col.key)}
                  className={`px-5 py-4 text-left text-sm font-semibold text-gray-600 ${
                    col.sortable ? "cursor-pointer hover:text-[#366189]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && sortBy === col.key && (
                      <i
                        className={`fa-solid fa-sort-${
                          sortOrder === "asc" ? "up" : "down"
                        } text-[#366189]`}
                      ></i>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr
                key={user.id}
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-linear-to-br from-[#366189] to-[#4a7a9e] rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <span className="text-gray-800 font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{user.email}</td>
                <td className="px-5 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      user.role_name
                    )}`}
                  >
                    {user.role_name || "N/A"}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {user.dep_name || "-"}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500 text-sm">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 text-[#366189] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit user"
                    >
                      <i className="fa-solid fa-edit"></i>
                    </button>
                    <button
                      onClick={() => onToggleActive(user.id)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        user.is_active
                          ? "text-yellow-600 hover:bg-yellow-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={user.is_active ? "Deactivate user" : "Activate user"}
                    >
                      <i
                        className={`fa-solid ${
                          user.is_active ? "fa-user-slash" : "fa-user-check"
                        }`}
                      ></i>
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete user"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
