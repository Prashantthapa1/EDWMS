"use client";

import { useState, useEffect, useCallback } from 'react';
import * as authService from '@/components/lib/auth';
import { getUser, clearAuthData } from '@/components/lib/utils';

/**
 * Custom hook for authentication
 * Provides user state and auth methods (login, register, logout)
 * @returns {object} - { user, loading, error, login, register, logout, refreshUser }
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = getUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Refresh user data from localStorage
  const refreshUser = useCallback(() => {
    const storedUser = getUser();
    setUser(storedUser);
  }, []);

  // Login handler
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register handler
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError(err.message || 'Logout failed');
      // Clear user anyway
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };
}
