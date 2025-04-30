
import type { Metadata } from 'next';
import { Suspense } from 'react'; // Import Suspense
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster
import Loading from './loading'; // Import the loading component

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
    <html lang="en" className="dark">
      <body
        className={cn(
          // Use default sans-serif font stack
          'antialiased font-sans',
          // Smoother gradient, ensure min-h-screen is on body for full height layout
          'transition-colors duration-300 flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20 text-foreground'
        )}
      >
         {/* Wrap children with Suspense for route loading states */}
         <Suspense fallback={<Loading />}>
            {/* Main content area takes remaining space */}
            <main className="flex-1 flex flex-col overflow-hidden">{children}</main> {/* Ensure flex and overflow handling */}
         </Suspense>
         {/* BottomNavigation is rendered conditionally within page.tsx */}
        <Toaster />
      </body>
    </html>
  );
}
