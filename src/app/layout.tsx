import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // Correct import for Geist Sans
import { GeistMono } from 'geist/font/mono'; // Correct import for Geist Mono
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster
import { BottomNavigation } from '@/components/bottom-navigation'; // Import BottomNavigation

// Define font variables
const fontSansVariable = GeistSans.variable;
const fontMonoVariable = GeistMono.variable;

export const metadata: Metadata = {
  title: 'Kinect', // Updated title
  description: 'Chat, play games, and connect.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", fontSansVariable, fontMonoVariable)}>
      <body
        className={cn(
          'antialiased font-sans transition-colors duration-300 flex flex-col min-h-screen' // Ensure body takes full height and uses flex column
        )}
      >
        <main className="flex-1 overflow-y-auto">{children}</main> {/* Main content area */}
        <BottomNavigation /> {/* Add BottomNavigation */}
        <Toaster />
      </body>
    </html>
  );
}
