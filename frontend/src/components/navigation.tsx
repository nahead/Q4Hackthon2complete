'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Moon,
  Sun,
  Home,
  MessageSquare,
  CheckSquare,
  LogOut,
  User
} from 'lucide-react';
import { isAuthenticated } from '../lib/auth';

export default function Navigation() {
  const [authStatus, setAuthStatus] = useState<boolean | null>(null); // Use null as initial state to indicate loading
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on mount
    setAuthStatus(isAuthenticated());
  }, []);

  const handleLogout = () => {
    // Remove the token
    localStorage.removeItem('authToken');
    // Update auth status
    setAuthStatus(false);
    // Redirect to login
    router.push('/login');
  };

  // Don't render navigation items until auth status is determined to prevent hydration mismatch
  if (authStatus === null) {
    return (
      <nav className="bg-background/80 backdrop-blur-lg border-b border-border/50 glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-ai-gradient rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <Link href="/">
              <h1 className="text-xl font-bold bg-ai-gradient bg-clip-text text-transparent">
                AI Todo
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-gray-700" />
              )}
            </Button>

            {/* Placeholder for auth buttons while loading */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-background/80 backdrop-blur-lg border-b border-border/50 glass-effect sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-ai-gradient rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <Link href="/">
            <h1 className="text-xl font-bold bg-ai-gradient bg-clip-text text-transparent">
              AI Todo
            </h1>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex space-x-1">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>

            {authStatus && (
              <>
                <Link href="/chat">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Chat</span>
                  </Button>
                </Link>

                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <CheckSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Tasks</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 text-gray-700" />
            )}
          </Button>

          {authStatus ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" size="sm" className="bg-ai-gradient hover:bg-ai-gradient-secondary text-white">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}