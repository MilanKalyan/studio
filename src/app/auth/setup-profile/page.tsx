'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation
import Image from 'next/image';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Check, UserCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Import cn

// Placeholder avatars
const placeholderAvatars = [
  'https://picsum.photos/seed/avatar1/100/100',
  'https://picsum.photos/seed/avatar2/100/100',
  'https://picsum.photos/seed/avatar3/100/100',
  'https://picsum.photos/seed/avatar4/100/100',
  'https://picsum.photos/seed/avatar5/100/100',
];

export default function SetupProfilePage() {
  const [username, setUsername] = useState(''); // Assume username might be pre-filled or editable
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setCustomAvatarPreview(null); // Clear custom preview if selecting a placeholder
  };

 const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomAvatarPreview(result);
        setSelectedAvatar(null); // Clear placeholder selection
      };
      reader.readAsDataURL(file);
    } else if (file) {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please select an image file.',
        });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  const handleSetupComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({
        variant: 'destructive',
        title: 'Username Required',
        description: 'Please enter a username.',
      });
      return;
    }
    if (!selectedAvatar && !customAvatarPreview) {
       toast({
        variant: 'destructive',
        title: 'Avatar Required',
        description: 'Please select or upload an avatar.',
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call to save profile
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log('Profile Setup:', { username, avatar: selectedAvatar || 'custom_upload' });
    // In a real app, save the profile data here

    toast({
      title: 'Profile Setup Complete',
      description: 'Welcome to Kinect!',
    });

    // Redirect to the main application page
    router.push('/');

    // setIsLoading(false); // Keep loading state until redirect
  };

  const finalAvatarSrc = customAvatarPreview || selectedAvatar || '';
  const avatarFallback = username ? username.charAt(0).toUpperCase() : <UserCircle />;

  return (
    <Card className="w-full max-w-lg mx-auto animate-fade-in opacity-0 shadow-2xl border-primary/20 bg-card/90 backdrop-blur-sm">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-3xl font-bold tracking-tight text-primary retro-glow">
          Set Up Your Profile
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Choose your username and avatar to get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSetupComplete} className="space-y-6">
          {/* Avatar Selection */}
           <div className="flex flex-col items-center space-y-4">
             <Label>Choose Your Avatar</Label>
             <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-primary/50 shadow-lg cursor-pointer transition-transform group-hover:scale-105" onClick={triggerFileInput}>
                    <AvatarImage src={finalAvatarSrc} alt={username || 'User Avatar'} />
                    <AvatarFallback className="text-4xl bg-muted">
                    {avatarFallback}
                    </AvatarFallback>
                </Avatar>
                 <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-border shadow-md group-hover:opacity-100 opacity-70 transition-opacity"
                    onClick={triggerFileInput}
                    type="button"
                    aria-label="Upload Custom Avatar"
                 >
                    <Upload className="h-4 w-4"/>
                 </Button>
             </div>
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={isLoading}
              />
             <p className="text-xs text-muted-foreground">Click avatar to upload or select below</p>
             <div className="flex flex-wrap justify-center gap-3 pt-2">
                {placeholderAvatars.map((avatarUrl, index) => (
                  <Avatar
                    key={index}
                    className={cn(
                        "h-12 w-12 cursor-pointer border-2 transition-all duration-200 hover:scale-110 hover:border-primary",
                        selectedAvatar === avatarUrl ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-transparent'
                    )}
                    onClick={() => handleAvatarSelect(avatarUrl)}
                    role="button"
                    aria-label={`Select placeholder avatar ${index + 1}`}
                    tabIndex={isLoading ? -1 : 0}
                  >
                    <AvatarImage src={avatarUrl} alt={`Placeholder Avatar ${index + 1}`} />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                ))}
              </div>
           </div>


          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your desired username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-muted/30 focus:bg-background text-center text-lg"
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full retro-glow" disabled={isLoading || !username.trim() || (!selectedAvatar && !customAvatarPreview)}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Complete Setup
          </Button>
        </form>
      </CardContent>
       <CardFooter className="text-center text-sm">
         <p className="text-muted-foreground w-full">
            You can change these later in Settings.
         </p>
       </CardFooter>
    </Card>
  );
}
