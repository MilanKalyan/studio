import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kinect - Authentication',
  description: 'Login or Sign up to Kinect',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      {/* You can add shared UI elements for auth pages here if needed */}
      {children}
    </div>
  );
}
