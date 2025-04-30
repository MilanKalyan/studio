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
  // The div wrapper here isn't strictly necessary as LoginPage now includes a full-screen flex container.
  // Returning children directly might be slightly cleaner, assuming child pages handle their own layout.
  // However, keeping it allows adding shared elements later if needed.
  // For now, let's keep it simple and remove it.
  return <>{children}</>;
}
