'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated } from '../lib/auth';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null); // null means loading

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated()) {
      // Don't redirect if already on login/register pages
      if (pathname !== '/login' && pathname !== '/register') {
        router.push('/login');
      }
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  }, [router, pathname]);

  // Show nothing while checking auth status
  if (authorized === null || !isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Checking authentication...</div>
      </div>
    );
  }

  return (
    <>
      {/* Navigation bar for authenticated users */}
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">Todo App</div>
          <div className="flex space-x-4">
            <a href="/" className="hover:text-gray-300">Home</a>
            <a href="/tasks" className="hover:text-gray-300">Tasks</a>
            <a href="#"
               onClick={(e) => {
                 e.preventDefault();
                 // Handle logout
                 localStorage.removeItem('authToken');
                 router.push('/login');
               }}
               className="hover:text-gray-300">Logout</a>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto p-4">
        {children}
      </main>
    </>
  );
}