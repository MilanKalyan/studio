import type { Metadata } from 'next';
import { Suspense } from 'react'; // Import Suspense
import { GeistSans } from 'geist/font/sans'; // Correct import for Geist Sans
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster
// Removed BottomNavigation import, it's handled conditionally in page.tsx
import Loading from './loading'; // Import the loading component

// Define font variables
const fontSansVariable = GeistSans.variable;

export const metadata: Metadata = {
  title: 'Kinect',
  description: 'Chat, play games, and connect.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply dark theme and font variables directly to html tag
    <html lang="en" className={cn("dark", fontSansVariable)}>
      <body
        className={cn(
          'antialiased font-sans transition-colors duration-300 flex flex-col min-h-screen bg-background text-foreground' // Ensure body has background/text colors
        )}
      >
         {/* Wrap children with Suspense for route loading states */}
         <Suspense fallback={<Loading />}>
            {/* Main content area takes remaining space */}
            <main className="flex-1 overflow-y-auto">{children}</main>
         </Suspense>
         {/* BottomNavigation is now rendered conditionally within page.tsx when authenticated */}
        <Toaster />
      </body>
    </html>
  );
}
