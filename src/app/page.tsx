'use client'; // Mark as client component for authentication checks

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chat } from '@/components/chat';
import { GameLobby } from '@/components/game-lobby'; // Import GameLobby
import LoginPage from './auth/login/page'; // Import the Login page
import Loading from './loading'; // Import the Loading component
import { BottomNavigation } from '@/components/bottom-navigation'; // Import BottomNavigation
import { Card } from '@/components/ui/card'; // Import Card

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
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-muted/10"> {/* Use h-screen for full height */}
       {/* Main Content Area - Use flex-1 to take remaining space, ensure padding-bottom for nav */}
       {/* Removed overflow-hidden from main to allow content to potentially scroll behind padding */}
       <main className="flex-1 p-2 md:p-4 pb-20"> {/* pb-20 (5rem) accommodates h-16 (4rem) nav */}
         <Card className="h-full w-full shadow-xl border-primary/10 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-0">
             {/* Chat Area - Takes full height within Card */}
             <div className="lg:col-span-2 h-full overflow-hidden border-r border-border/50">
               <Chat />
             </div>
             {/* Game Lobby Area - Takes full height within Card */}
             <div className="hidden lg:flex lg:col-span-1 h-full overflow-hidden"> {/* Hide on smaller screens */}
               <GameLobby />
             </div>
         </Card>
       </main>

       {/* Bottom Navigation */}
       {/* Pass handleLogout to BottomNavigation -> SettingsContent */}
       <BottomNavigation onLogout={handleLogout} />
    </div>
  );
}
