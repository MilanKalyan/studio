import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // Correct import for Geist Sans
import { GeistMono } from 'geist/font/mono'; // Correct import for Geist Mono
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

// Define font variables using Geist
const fontSans = GeistSans;
const fontMono = GeistMono;

export const metadata: Metadata = {
  title: 'NexusPlay',
  description: 'Chat, play games, and connect.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply dark theme by default to the html tag
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable} dark`}>
      <body
        className={cn(
          // Use font-sans defined by the variable above
          'antialiased font-sans transition-colors duration-300' // Add transition
        )}
      >
        {children}
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
