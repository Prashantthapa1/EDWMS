"use client";

import AuthGuard from '@/components/auth/auth-guard';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // AuthGuard will redirect to login
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
            
            {user && (
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Name:</span> {user.name || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span> {user.email || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Role:</span> {user.role || 'User'}
                </p>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">
                🎉 Authentication system is working! You are now logged in.
              </p>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
