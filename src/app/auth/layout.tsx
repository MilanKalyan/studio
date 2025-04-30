import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NexusPlay - Authentication', // Updated App Name
  description: 'Login, Sign up, or set up your profile on NexusPlay', // Updated App Name
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Add a wrapper div to center the content (like LoginPage)
  // and apply the consistent background gradient.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      {children}
    </div>
  );
}
