import type { Metadata } from 'next';
// Remove incorrect geist font imports
// import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

// Assume fonts are loaded elsewhere, e.g., via CSS import in globals.css or handled by Next.js implicitly
// Define font variables manually if needed, or rely on Tailwind defaults/theme
const fontSansVariable = '--font-sans'; // Example, adjust if using a specific font package differently
const fontMonoVariable = '--font-mono'; // Example, adjust if using a specific font package differently

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
    <html lang="en" className="dark"> {/* Apply dark theme by default */}
      <body
        className={cn(
          fontSansVariable, // Use the defined variable name
          fontMonoVariable, // Use the defined variable name
          'antialiased font-sans transition-colors duration-300' // Add transition, ensure font-sans is defined in Tailwind config
        )}
        // Add style object if variables need to be injected directly and aren't via CSS imports
        // style={{
        //   [fontSansVariable]: 'Your Sans Font Name, sans-serif',
        //   [fontMonoVariable]: 'Your Mono Font Name, monospace',
        // } as React.CSSProperties}
      >
        {children}
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
