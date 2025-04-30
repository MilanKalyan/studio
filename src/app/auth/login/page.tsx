'use client';

import { useState } from 'react';
import Link from 'next/link';
// Removed useRouter import as we use onLoginSuccess callback
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simple SVG icons for Apple and Google
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0"></path>
    <path d="M12 3.5c2.4 0 4.6.9 6.2 2.4l-1.5 1.5c-1-.9-2.3-1.4-3.7-1.4c-3.3 0-6 2.7-6 6s2.7 6 6 6c1.9 0 3.6-.9 4.8-2.3l1.5 1.5c-1.6 1.8-3.9 2.8-6.3 2.8c-4.4 0-8-3.6-8-8s3.6-8 8-8z"></path>
    <path d="M12 12l-4 4"></path>
    <path d="M12 12l4 4"></path>
    <path d="M12 12l-4-4"></path>
    <path d="M12 12l4-4"></path>
  </svg>
);

const AppleIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 13.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5z"></path>
    <path d="M19.5 13.5c0 3.6-2.9 6.5-6.5 6.5s-6.5-2.9-6.5-6.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5z"></path>
    <path d="M12 3.5v-1"></path>
 </svg>
);

interface LoginPageProps {
  onLoginSuccess: () => void; // Callback function for successful login
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Removed router instance
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Placeholder login logic
    if (username === 'user' && password === 'pass') {
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
        duration: 3000,
      });
      // Call the success callback instead of router.push
      onLoginSuccess();
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid username or password.',
        duration: 5000,
      });
      setIsLoading(false); // Only stop loading on failure here
    }
    // No setIsLoading(false) here on success, page will transition
  };

  const handleSocialLogin = (provider: string) => {
     setIsLoading(true);
     console.log(`Attempting ${provider} login...`);
     // Simulate API call
     setTimeout(() => {
       toast({
         title: `${provider} Login Successful`,
         description: `Simulating ${provider} authentication flow.`,
         duration: 3000,
       });
       // Call the success callback
       onLoginSuccess();
     }, 1500);
   };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
        <Card className="w-full max-w-md mx-auto animate-fade-in opacity-0 shadow-2xl border-primary/20 bg-card/90 backdrop-blur-sm [--fade-in-delay:100ms] transition-shadow hover:shadow-primary/10">
            <CardHeader className="text-center space-y-1">
                <CardTitle className="text-3xl font-bold tracking-tight text-primary retro-glow">
                  Kinect
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                Stay Kinected. Log in to continue.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-muted/30 focus:bg-background transition-all duration-200 focus:ring-2 focus:ring-ring"
                    disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                        href="#"
                        className="text-sm text-primary hover:underline transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-ring rounded"
                        tabIndex={isLoading ? -1 : 0}
                    >
                        Forgot password?
                    </Link>
                    </div>
                    <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-muted/30 focus:bg-background transition-all duration-200 focus:ring-2 focus:ring-ring"
                    disabled={isLoading}
                    />
                </div>
                <Button type="submit" className="w-full retro-glow transition-all duration-300 transform hover:scale-105 active:scale-100" disabled={isLoading}>
                    {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <LogIn className="mr-2 h-4 w-4" />
                    )}
                    Log In
                </Button>
                </form>
                <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full transition-all duration-200 flex items-center justify-center gap-2 hover:bg-accent hover:shadow-sm active:scale-95" onClick={() => handleSocialLogin('Google')} disabled={isLoading}>
                    <GoogleIcon /> Google
                    </Button>
                    <Button variant="outline" className="w-full transition-all duration-200 flex items-center justify-center gap-2 hover:bg-accent hover:shadow-sm active:scale-95" onClick={() => handleSocialLogin('Apple')} disabled={isLoading}>
                    <AppleIcon /> Apple
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="text-center text-sm">
                <p className="text-muted-foreground w-full">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-primary hover:underline transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-ring rounded" tabIndex={isLoading ? -1 : 0}>
                    Sign Up
                </Link>
                </p>
            </CardFooter>
        </Card>
    </div>
  );
}
