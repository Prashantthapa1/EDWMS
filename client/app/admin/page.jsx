"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import Script from "next/script";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeLink, setActiveLink] = useState("dashboard");
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Redirect non-admin users
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (chartsLoaded && typeof window !== "undefined" && window.Chart) {
      initCharts();
    }
  }, [chartsLoaded]);

  const initCharts = () => {
    // Growth Bar Chart
    const growthCanvas = document.getElementById("growthChart");
    if (growthCanvas) {
      const ctxGrowth = growthCanvas.getContext("2d");
      new window.Chart(ctxGrowth, {
        type: "bar",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "New Documents",
              data: [1200, 1900, 3000, 5000, 4200, 6300],
              backgroundColor: "#366189",
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } },
          },
        },
      });
    }

    // Status Doughnut Chart
    const statusCanvas = document.getElementById("statusChart");
    if (statusCanvas) {
      const ctxStatus = statusCanvas.getContext("2d");
      new window.Chart(ctxStatus, {
        type: "doughnut",
        data: {
          labels: ["Completed", "In Progress", "Pending Approval"],
          datasets: [
            {
              data: [65, 25, 10],
              backgroundColor: ["#366189", "#4ade80", "#fbbf24"],
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { usePointStyle: true, boxWidth: 6, font: { size: 11 } },
            },
          },
        },
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const sidebarLinks = [
    { id: "dashboard", icon: "fa-chart-pie", label: "Dashboard" },
    { id: "users", icon: "fa-users", label: "User Management" },
    { id: "documents", icon: "fa-folder-open", label: "Document Repository" },
    { id: "workflows", icon: "fa-route", label: "Workflow Automation" },
    { id: "audit", icon: "fa-clipboard-list", label: "Audit Logs" },
    { id: "settings", icon: "fa-gear", label: "System Settings", divider: true },
  ];

  const stats = [
    { label: "Total Users", value: "345", icon: "fa-users", bgColor: "bg-blue-50", textColor: "text-[#366189]" },
    { label: "Total Documents", value: "12,500", icon: "fa-file-invoice", bgColor: "bg-green-50", textColor: "text-green-600" },
    { label: "Active Workflows", value: "45", icon: "fa-shuffle", bgColor: "bg-purple-50", textColor: "text-purple-600" },
    { label: "System Alerts", value: "12", icon: "fa-triangle-exclamation", bgColor: "bg-red-50", textColor: "text-red-600" },
  ];

  const users = [
    { initials: "NK", name: "Nama Kamin", email: "nama@edwms.com", role: "Admin", status: "ACTIVE", statusColor: "bg-green-100 text-green-700", bgColor: "bg-blue-100 text-[#366189]" },
    { initials: "JS", name: "Jasna Sanith", email: "jasna@edwms.com", role: "Editor", status: "PENDING", statusColor: "bg-yellow-100 text-yellow-700", bgColor: "bg-purple-100 text-purple-600" },
    { initials: "BV", name: "Borka Vahm", email: "borka@edwms.com", role: "Viewer", status: "LOCKED", statusColor: "bg-gray-100 text-gray-500", bgColor: "bg-gray-100 text-gray-600" },
  ];

  const auditLogs = [
    { event: "User Creation", time: "2026-03-23 12:30 PM", color: "bg-blue-500" },
    { event: "Document Upload", time: "2026-03-23 11:15 AM", color: "bg-green-500" },
    { event: "Workflow Rule Modified", time: "2026-03-23 09:45 AM", color: "bg-yellow-500" },
  ];

  return (
    <AuthGuard>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        onLoad={() => setChartsLoaded(true)}
      />
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
                href={link.id === "users" ? "/admin/users" : "#"}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (link.id === "users") {
                    return;
                  }
                  e.preventDefault();
                  setActiveLink(link.id);
                }}
                className={`flex items-center gap-4 px-4 py-3 transition-all hover:bg-white/10 cursor-pointer ${
                  activeLink === link.id
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
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Admin User")}&background=random`}
                className={`rounded-full border border-white/20 flex-shrink-0 ${sidebarHovered ? 'w-10 h-10' : 'w-10 h-10 lg:w-8 lg:h-8'}`}
                alt="Admin"
              />
              <div className={`transition-opacity duration-200 ${!sidebarHovered && 'lg:hidden'}`}>
                <p className="text-sm font-bold truncate max-w-[140px]">{user?.name || "Admin User"}</p>
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
              <button 
                className="lg:hidden text-gray-600 hover:text-[#366189] transition-colors cursor-pointer"
                onClick={() => setMobileMenuOpen(true)}
              >
                <i className="fa-solid fa-bars text-xl"></i>
              </button>
              <h1 className="text-lg md:text-xl font-bold text-gray-800">
                <span className="hidden sm:inline">Admin Console / </span>
                <span className="text-gray-400 font-medium">Dashboard</span>
              </h1>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <button className="relative hover:text-[#366189] text-gray-500 cursor-pointer">
                <i className="fa-solid fa-bell text-lg"></i>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="hover:text-[#366189] text-gray-500 cursor-pointer hidden sm:block">
                <i className="fa-solid fa-magnifying-glass text-lg"></i>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Stats Grid - Horizontal scroll on mobile */}
            <div className="flex gap-3 md:gap-6 overflow-x-auto pb-2 md:pb-0 md:grid md:grid-cols-4 scrollbar-hide">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-40 md:w-auto bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 md:gap-5"
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center ${stat.textColor}`}>
                    <i className={`fa-solid ${stat.icon} text-lg md:text-xl`}></i>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">{stat.label}</p>
                    <h3 className="text-xl md:text-2xl font-bold">{stat.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-800 text-sm md:text-base">Document Upload Growth</h3>
                <div className="h-48 md:h-64">
                  <canvas id="growthChart"></canvas>
                </div>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-800 text-sm md:text-base">Workflow Status Distribution</h3>
                <div className="h-48 md:h-64 flex justify-center">
                  <canvas id="statusChart"></canvas>
                </div>
              </div>
            </div>

            {/* User Table & Audit Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* User Management Table */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 text-sm md:text-base">User Management</h3>
                  <button className="text-[#366189] text-xs md:text-sm font-semibold hover:underline cursor-pointer">
                    View All
                  </button>
                </div>
                {/* Mobile: Card view */}
                <div className="md:hidden divide-y divide-gray-100">
                  {users.map((u, index) => (
                    <div key={index} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${u.bgColor} flex items-center justify-center text-xs font-bold`}>
                          {u.initials}
                        </div>
                        <div className="text-sm">
                          <p className="font-bold">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.role}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 ${u.statusColor} rounded-full text-[10px] font-bold`}>
                        {u.status}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Desktop: Table view */}
                <table className="w-full text-left hidden md:table">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${u.bgColor} flex items-center justify-center text-xs font-bold`}>
                            {u.initials}
                          </div>
                          <div className="text-sm">
                            <p className="font-bold">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">{u.role}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 ${u.statusColor} rounded-full text-[10px] font-bold`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <i className="fa-solid fa-ellipsis-vertical text-gray-300 cursor-pointer hover:text-gray-600"></i>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Audit Logs */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="px-4 md:px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm md:text-base">Recent Audit Logs</h3>
                </div>
                <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-hidden">
                  {auditLogs.map((log, index) => (
                    <div key={index} className="flex gap-3 md:gap-4 relative">
                      <div className={`w-2 h-2 mt-2 ${log.color} rounded-full flex-shrink-0 z-10`}></div>
                      {index < auditLogs.length - 1 && (
                        <div className="absolute left-[3.5px] top-4 w-0.5 h-10 md:h-12 bg-gray-100"></div>
                      )}
                      <div>
                        <p className="text-xs md:text-sm font-bold">{log.event}</p>
                        <p className="text-[10px] md:text-xs text-gray-400">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
