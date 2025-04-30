import type { Metadata } from 'next';
import { Suspense } from 'react'; // Import Suspense
// Removed Geist font imports
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster
import Loading from './loading'; // Import the loading component

// Removed font variables

export const metadata: Metadata = {
  title: 'Kinect', // Kept App Name
  description: 'Chat, play games, and connect.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply dark theme directly to html tag
    // Removed font variable class
    <html lang="en" className="dark">
      <body
        className={cn(
          // Use default sans-serif font stack
          'antialiased font-sans',
          'transition-colors duration-300 flex flex-col min-h-screen bg-background text-foreground' // Ensure body has background/text colors
        )}
      >
         {/* Wrap children with Suspense for route loading states */}
         <Suspense fallback={<Loading />}>
            {/* Main content area takes remaining space */}
            <main className="flex-1">{children}</main>
         </Suspense>
         {/* BottomNavigation is rendered conditionally within page.tsx */}
        <Toaster />
      </body>
    </html>
  );
}
