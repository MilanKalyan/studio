
'use client'; // Mark as client component for authentication checks

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from './auth/login/page'; // Import the Login page
import Loading from './loading'; // Import the Loading component
import { BottomNavigation } from '@/components/bottom-navigation'; // Import BottomNavigation
import { AppLayout } from '@/components/app-layout'; // Import the main App Layout

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null initially, then boolean
  const router = useRouter();

  // Simulate checking authentication status
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      // Simulate an async check
      await new Promise(resolve => setTimeout(resolve, 500));

      // --- Placeholder Authentication Logic ---
      // Replace this with your actual authentication check (e.g., using Firebase Auth)
      const loggedIn = sessionStorage.getItem('isAuthenticated') === 'true'; // Example using sessionStorage

      if (isMounted) {
        console.log("Simulated Authentication Status:", loggedIn);
        setIsAuthenticated(loggedIn);
      }
    };

    checkAuth();

    return () => {
      isMounted = false; // Prevent state updates after unmount
    };
  }, []); // Run only once on mount

   // Simulate login success (can be called from LoginPage)
   const handleLoginSuccess = () => {
       sessionStorage.setItem('isAuthenticated', 'true');
       setIsAuthenticated(true);
       router.replace('/'); // Use replace to avoid back button going to login
   };

   // Simulate logout (can be called from Settings)
   const handleLogout = () => {
       sessionStorage.removeItem('isAuthenticated');
       setIsAuthenticated(false);
       // No need to push, the component will re-render the LoginPage
   };


  // Render loading state while checking auth
  if (isAuthenticated === null) {
    return <Loading />;
  }

  // Render Login page if not authenticated
  if (!isAuthenticated) {
    // Pass login success handler to LoginPage
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Render main app layout if authenticated
  return (
    // Use h-screen and flex-col for full height layout that includes the bottom nav
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-muted/10">
       {/* Main Content Area - flex-1 allows it to grow. REMOVED pb-16 */}
       {/* overflow-hidden ensures content doesn't spill out */}
       <main className="flex-1 p-2 md:p-4 overflow-hidden">
         {/* AppLayout handles the main structure */}
         <AppLayout />
       </main>

       {/* Bottom Navigation - Now a floating component */}
       <BottomNavigation onLogout={handleLogout} />
    </div>
  );
}
