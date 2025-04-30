'use client'; // Mark as client component for authentication checks

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chat } from '@/components/chat';
import { GameLobby } from '@/components/game-lobby'; // Import GameLobby
import LoginPage from './auth/login/page'; // Import the Login page
import Loading from './loading'; // Import the Loading component
import { BottomNavigation } from '@/components/bottom-navigation'; // Import BottomNavigation

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
    <div className="flex flex-col h-screen"> {/* Use h-screen for full height */}
       {/* Main Content Area - Use flex-1 to take remaining space */}
       <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
         {/* Chat Area - Takes 2 columns on large screens */}
         <div className="lg:col-span-2 h-full overflow-y-auto border-r border-border">
           <Chat />
         </div>
         {/* Game Lobby Area - Takes 1 column on large screens */}
         <div className="hidden lg:flex lg:col-span-1 h-full overflow-y-auto"> {/* Hide on smaller screens, flex on large */}
           <GameLobby />
         </div>
       </div>

       {/* Bottom Navigation */}
       {/* Pass handleLogout to BottomNavigation -> SettingsContent */}
       <BottomNavigation onLogout={handleLogout} />
    </div>
  );
}
