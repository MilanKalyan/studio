import type { Metadata } from 'next';
import { Suspense } from 'react'; // Import Suspense
import { GeistSans } from 'geist/font/sans';
// Assuming GeistMono is correctly installed or removed if not used
// import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { BottomNavigation } from '@/components/bottom-navigation';
import Loading from './loading'; // Import the loading component

// Define font variables
const fontSansVariable = GeistSans.variable;
// const fontMonoVariable = GeistMono.variable; // Remove if not used

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
    // Apply dark theme directly to html tag
    <html lang="en" className={cn("dark", fontSansVariable /*, fontMonoVariable*/)}>
      <body
        className={cn(
          'antialiased font-sans transition-colors duration-300 flex flex-col min-h-screen bg-background text-foreground' // Ensure body has background/text colors
        )}
      >
         {/* Wrap children with Suspense for route loading states */}
         <Suspense fallback={<Loading />}>
            <main className="flex-1 overflow-y-auto">{children}</main>
         </Suspense>
        {/* Conditionally render BottomNavigation? Or handle auth state within components */}
        {/* For now, assume it shows if logged in, which page.tsx handles */}
        {/* <BottomNavigation /> */}
        <Toaster />
      </body>
    </html>
  );
}
