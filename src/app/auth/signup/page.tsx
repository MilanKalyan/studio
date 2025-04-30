'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Use next/navigation
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
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Import cn

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'Passwords do not match.',
      });
      return;
    }
    setIsLoading(true);

    // Simulate API call for signup
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Placeholder signup logic
    console.log('Signup attempt:', { email, username, password });
    // In a real app, you would handle user creation here

    toast({
      title: 'Signup Successful',
      description: 'Account created! Redirecting to profile setup...',
    });

    // Redirect to profile setup page after successful signup
    router.push('/auth/setup-profile');

    // setIsLoading(false); // Keep loading state until redirect happens
  };

  return (
    // Center the card vertically and horizontally
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <Card className="w-full max-w-md mx-auto animate-fade-in opacity-0 shadow-2xl border-primary/20 bg-card/90 backdrop-blur-sm [--fade-in-delay:100ms] transition-shadow hover:shadow-primary/10">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight text-primary retro-glow">
            Create Account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Join Kinect and start connecting!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/30 focus:bg-background transition-all duration-200 focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-muted/30 focus:bg-background transition-all duration-200 focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6} // Basic password requirement example
                className="bg-muted/30 focus:bg-background transition-all duration-200 focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={cn(
                    `bg-muted/30 focus:bg-background transition-all duration-200 focus:ring-2 focus:ring-ring`,
                    password !== confirmPassword && confirmPassword ? 'border-destructive ring-destructive focus-visible:ring-destructive' : ''
                )}
                disabled={isLoading}
              />
              {password !== confirmPassword && confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match.</p>
              )}
            </div>
            <Button type="submit" className="w-full retro-glow transition-all duration-300 transform hover:scale-105 active:scale-100" disabled={isLoading || password !== confirmPassword}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-muted-foreground w-full">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-ring rounded" tabIndex={isLoading ? -1 : 0}>
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
