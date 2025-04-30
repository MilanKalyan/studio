'use client'; // Mark as client component for authentication checks

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chat } from '@/components/chat';
import LoginPage from './auth/login/page'; // Import the Login page
import Loading from './loading'; // Import the Loading component

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null initially, then boolean
  const router = useRouter();

  // Simulate checking authentication status
  useEffect(() => {
    const checkAuth = async () => {
      // Simulate an async check (e.g., checking local storage, session, or making an API call)
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading time

      // --- Placeholder Authentication Logic ---
      // Replace this with your actual authentication check
      const loggedIn = Math.random() > 0.5; // 50% chance of being "logged in" for demo
      // const loggedIn = false; // Force login page for testing
      // const loggedIn = true; // Force chat page for testing

      console.log("Simulated Authentication Status:", loggedIn);
      setIsAuthenticated(loggedIn);

      // If not authenticated, redirect to login (optional, could also render login component)
      // if (!loggedIn) {
      //   router.push('/auth/login');
      // }
    };

    checkAuth();
  }, [router]); // Dependency array includes router

  // Render loading state while checking auth
  if (isAuthenticated === null) {
    return <Loading />;
  }

  // Render Login page if not authenticated
  if (!isAuthenticated) {
    // Redirecting might be cleaner, but rendering directly works too
    // Consider wrapping LoginPage in a layout if needed, or rely on the AuthLayout
     return <LoginPage />;
    // return null; // Or return null if using router.push in useEffect
  }

  // Render Chat component if authenticated
  return (
    <div className="flex flex-col h-full pb-16"> {/* Adjust padding-bottom to avoid overlap with bottom nav */}
      {/* The main content area will be filled by the Chat component */}
      <Chat />
    </div>
  );
}
