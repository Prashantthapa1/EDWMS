"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Spinner from '@/components/ui/spinner';

/**
 * AuthGuard component to protect routes
 * Redirects to landing page (/) if user is not authenticated
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactNode}
 */
export default function AuthGuard({ children }) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to landing page if not authenticated
      router.push('/');
    }
  }, [loading, isAuthenticated, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}
