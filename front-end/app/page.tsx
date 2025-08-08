'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardPage from './dashboard/page';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = () => {
      // Check for authentication token
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('token');
      
      if (!token) {
        // No token found, redirect to login
        router.replace('/login');
        return;
      }

      // Check if token is expired (basic check)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          // Token expired, clear storage and redirect to login
          localStorage.clear();
          sessionStorage.clear();
          router.replace('/login');
          return;
        }
        // Token is valid
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid token, clear storage and redirect to login
        localStorage.clear();
        sessionStorage.clear();
        router.replace('/login');
        return;
      }

      setIsLoading(false);
    };

    // Add a small delay to ensure proper initialization
    const timer = setTimeout(checkAuthentication, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <DashboardPage />;
}