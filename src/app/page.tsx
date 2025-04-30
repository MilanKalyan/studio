
'use client'; // Mark as client component for authentication checks

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from './auth/login/page'; // Import the Login page
import Loading from './loading'; // Import the Loading component
import { BottomNavigation } from '@/components/bottom-navigation'; // Import BottomNavigation
import { AppLayout } from '@/components/app-layout'; // Import the main App Layout
import SetupProfilePage from './auth/setup-profile/page'; // Import Setup Profile page

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null initially, then boolean
  const [needsProfileSetup, setNeedsProfileSetup] = useState<boolean>(false); // Check if profile setup is needed
  const router = useRouter();

  // Simulate checking authentication status and profile status
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      // Simulate an async check
      await new Promise(resolve => setTimeout(resolve, 500));

      // --- Placeholder Authentication Logic ---
      const loggedIn = sessionStorage.getItem('isAuthenticated') === 'true';
      // --- Placeholder Profile Check ---
      const profileComplete = sessionStorage.getItem('isProfileComplete') === 'true'; // Example check

      if (isMounted) {
        console.log("Simulated Authentication Status:", loggedIn);
        console.log("Simulated Profile Status:", profileComplete);
        setIsAuthenticated(loggedIn);
        setNeedsProfileSetup(loggedIn && !profileComplete); // Needs setup if logged in but profile incomplete
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
       // Assume profile is not complete immediately after login, trigger setup
       sessionStorage.removeItem('isProfileComplete');
       setIsAuthenticated(true);
       setNeedsProfileSetup(true);
       // No immediate redirect, component will render SetupProfilePage
       // Optionally: router.replace('/'); // Refresh state if needed, but component state change should suffice
   };

   // Simulate profile setup completion (called from SetupProfilePage)
    const handleProfileSetupComplete = () => {
        sessionStorage.setItem('isProfileComplete', 'true');
        setNeedsProfileSetup(false);
        router.replace('/'); // Navigate to the main app view after setup
    };


   // Simulate logout (can be called from Settings)
   const handleLogout = () => {
       sessionStorage.removeItem('isAuthenticated');
       sessionStorage.removeItem('isProfileComplete');
       setIsAuthenticated(false);
       setNeedsProfileSetup(false); // Reset profile state on logout
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

  // Render Profile Setup page if authenticated but profile needs setup
    if (needsProfileSetup) {
        // Center the profile setup card
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
                <SetupProfilePage onSetupComplete={handleProfileSetupComplete} />
            </div>
        );
    }


  // Render main app layout if authenticated and profile is complete
  return (
    // Use min-h-screen and flex-col for full height layout
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/10">
       {/* Main Content Area - flex-1 allows it to grow. */}
       {/* overflow-hidden ensures content doesn't spill out */}
       {/* Added relative positioning context for the FAB */}
       <main className="flex-1 p-2 md:p-4 overflow-hidden relative">
         {/* AppLayout handles the main structure */}
         <AppLayout />
       </main>

       {/* Bottom Navigation - Now a floating component */}
       <BottomNavigation onLogout={handleLogout} />
    </div>
  );
}
