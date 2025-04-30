
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Bell, Palette, Shield, LogOut, HelpCircle, Copy, Loader2, Move } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components


// Define snap position type, must match the one in bottom-navigation.tsx
type NavSnapPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

interface SettingsContentProps {
    onLogout: () => void;
    setNavPosition: (position: NavSnapPosition) => void; // Callback to change nav snap position
    currentNavPosition: NavSnapPosition; // Current snap position
}


export function SettingsContent({ onLogout, setNavPosition, currentNavPosition }: SettingsContentProps) {
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Component has mounted on the client
  }, []);


  // Placeholder state - replace with actual state management/data fetching
  const [user, setUser] = useState({
      name: "Loading...",
      email: "loading@example.com",
      avatar: undefined as string | undefined, // Use undefined initially
      kinectId: "KINECT#..."
  });
   const [settings, setSettings] = useState({
        pushNotifications: true,
        emailNotifications: false,
        soundNotifications: true,
        theme: "dark", // Default theme
   });


   // Simulate fetching user data
   useEffect(() => {
       if (isClient) { // Only run fetch simulation on client
            const timer = setTimeout(() => {
                 // Generate a unique Kinect ID on client mount for demo purposes
                 const randomIdPart = Math.floor(1000 + Math.random() * 9000);
                 setUser({
                     name: "Bob The Builder",
                     email: "bob@example.com",
                     avatar: "https://picsum.photos/seed/bob/100/100", // Set avatar URL after delay
                     kinectId: `KINECT#${randomIdPart}` // Assign generated ID
                 });
                 // Load saved theme preference
                 const savedTheme = localStorage.getItem('theme') || 'dark';
                 setSettings(prev => ({ ...prev, theme: savedTheme }));
                 // Apply initial theme based on saved preference or system
                 if (typeof window !== 'undefined') {
                     document.documentElement.classList.remove('light', 'dark');
                     if (savedTheme === 'system') {
                         const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                         document.documentElement.classList.add(systemPrefersDark ? 'dark' : 'light');
                     } else {
                         document.documentElement.classList.add(savedTheme);
                     }
                 }

            }, 1000); // Simulate 1 second delay
            return () => clearTimeout(timer);
       }
   }, [isClient]);


  const copyKinectId = () => {
    if (!navigator.clipboard || !isClient || user.kinectId === "KINECT#...") {
        toast({ variant: "destructive", title: "Cannot Copy", description: "Clipboard API not available or ID not loaded." });
        return;
    }
    navigator.clipboard.writeText(user.kinectId).then(() => {
        toast({
            title: "Kinect ID Copied!",
            description: `${user.kinectId} has been copied to your clipboard.`,
            duration: 3000,
        });
    }).catch(err => {
        console.error('Failed to copy Kinect ID: ', err);
        toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy ID." });
    });
  }

   const handleLogoutClick = async () => {
        setIsLoggingOut(true);
        // Simulate logout delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Call the passed-in onLogout function
        onLogout();
        toast({ title: "Logged Out", description: "You have been logged out successfully.", duration: 3000 });
        // No need to set isLoggingOut back to false as the component might unmount
    };

    // Handle settings changes
    const handleSwitchChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
        // Here you would typically save the setting to your backend/localStorage
        toast({ title: "Settings Updated", description: `Setting ${id} updated.`, duration: 2000 });
    };

    const handleThemeChange = (value: string) => {
        setSettings(prev => ({ ...prev, theme: value }));
        // Apply theme change logic (e.g., update class on body/html)
         if (typeof window !== 'undefined') {
             document.documentElement.classList.remove('light', 'dark');
             if (value === 'system') {
                 const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                 document.documentElement.classList.add(systemPrefersDark ? 'dark' : 'light');
             } else {
                 document.documentElement.classList.add(value);
             }
             localStorage.setItem('theme', value); // Save theme preference
         }
        toast({ title: "Theme Updated", description: `Theme set to ${value}.`, duration: 2000 });
    };

    // Handle navigation position change using the passed function
    const handleNavPositionChange = (value: NavSnapPosition) => {
        setNavPosition(value); // Call the callback passed from props
        // localStorage saving is handled in bottom-navigation.tsx now
        toast({ title: "Navigation Snap Updated", description: `Menu will now snap to ${value.replace('-', ' ')}. Drag to move.`, duration: 2500 });
    }


  return (
    <div className="space-y-6 p-4 pb-10"> {/* Add padding bottom */}
      {/* Account Section */}
      <Card className="animate-fade-in opacity-0 [--fade-in-delay:50ms]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Account</CardTitle>
          <CardDescription>Manage your profile and account settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center gap-4">
             {isClient && user.name !== "Loading..." ? (
                 <Avatar className="h-[60px] w-[60px] border-2 border-primary/50">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                 </Avatar>
             ) : (
                 <Skeleton className="h-[60px] w-[60px] rounded-full" />
             )}
             <div className="flex-1 min-w-0"> {/* Ensure div takes space and allows wrap */}
                 {isClient && user.name !== "Loading..." ? (
                     <>
                        <p className="font-semibold truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                            <p className="text-xs font-mono text-secondary truncate">{user.kinectId}</p>
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-secondary flex-shrink-0" onClick={copyKinectId} aria-label="Copy Kinect ID" disabled={user.kinectId === "KINECT#..."}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                     </>
                 ) : (
                    <div className="space-y-1.5">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                 )}
             </div>
             <Button variant="outline" size="sm" className="ml-auto flex-shrink-0" disabled={!isClient || user.name === "Loading..."}>Edit Profile</Button>
           </div>
           <Separator />
           <div className="space-y-2">
            <Label htmlFor="username-settings">Username</Label>
            {isClient && user.name !== "Loading..." ? (
                 <Input id="username-settings" defaultValue={user.name} />
            ): (
                <Skeleton className="h-10 w-full" />
            )}
          </div>
           <div className="space-y-2">
            <Label htmlFor="email-settings">Email</Label>
            {isClient && user.email !== "loading@example.com" ? (
                <Input id="email-settings" type="email" defaultValue={user.email} disabled />
            ) : (
                <Skeleton className="h-10 w-full" />
            )}
          </div>
          <Button variant="outline" className="w-full" disabled={!isClient}>Change Password</Button>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="animate-fade-in opacity-0 [--fade-in-delay:150ms]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Notifications</CardTitle>
          <CardDescription>Configure how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="flex-1 pr-4">Push Notifications</Label>
            <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSwitchChange('pushNotifications', checked)}
                disabled={!isClient}
                aria-label="Toggle Push Notifications"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="flex-1 pr-4">Email Notifications</Label>
            <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                disabled={!isClient}
                aria-label="Toggle Email Notifications"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-notifications" className="flex-1 pr-4">Notification Sounds</Label>
            <Switch
                id="sound-notifications"
                checked={settings.soundNotifications}
                onCheckedChange={(checked) => handleSwitchChange('soundNotifications', checked)}
                disabled={!isClient}
                aria-label="Toggle Notification Sounds"
            />
          </div>
        </CardContent>
      </Card>

       {/* Appearance Section */}
      <Card className="animate-fade-in opacity-0 [--fade-in-delay:250ms]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Appearance</CardTitle>
           <CardDescription>Customize the look and feel of the app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6"> {/* Increased spacing */}
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-select">Theme</Label>
            <Select
                value={settings.theme}
                onValueChange={handleThemeChange}
                disabled={!isClient}
            >
                 <SelectTrigger id="theme-select" className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                 </SelectContent>
            </Select>
          </div>

          {/* Navigation Position Control */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2"><Move className="h-4 w-4"/> Navigation Snap Corner</Label>
             {/* Use currentNavPosition for defaultValue and onValueChange to update via prop */}
            <RadioGroup
                value={currentNavPosition} // Controlled component using the prop
                onValueChange={(value) => handleNavPositionChange(value as NavSnapPosition)} // Call the passed setter
                className="grid grid-cols-2 gap-x-4 gap-y-2" // Adjusted gap
                disabled={!isClient}
             >
              {(['bottom-right', 'bottom-left', 'top-right', 'top-left'] as NavSnapPosition[]).map((pos) => (
                <div key={pos} className="flex items-center space-x-2">
                  <RadioGroupItem value={pos} id={`nav-pos-${pos}`} />
                  <Label htmlFor={`nav-pos-${pos}`} className="capitalize text-sm font-normal cursor-pointer">
                    {pos.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </RadioGroup>
             <p className="text-xs text-muted-foreground">This sets the corner the navigation menu snaps back to after dragging.</p>
          </div>
           {/* Add more appearance settings like font size, chat density etc. */}
        </CardContent>
      </Card>


      {/* Privacy & Security Section */}
      <Card className="animate-fade-in opacity-0 [--fade-in-delay:350ms]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Privacy & Security</CardTitle>
          <CardDescription>Manage who can see your activity and secure your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start text-left" disabled={!isClient}>Manage Blocked Users</Button>
          <Button variant="outline" className="w-full justify-start text-left" disabled={!isClient}>Activity Status Settings</Button>
          <Button variant="outline" className="w-full justify-start text-left" disabled={!isClient}>Two-Factor Authentication</Button>
        </CardContent>
      </Card>

      {/* Help & Support Section */}
       <Card className="animate-fade-in opacity-0 [--fade-in-delay:450ms]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary" /> Help & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
           <Button variant="ghost" className="w-full justify-start text-left" disabled={!isClient}>FAQ</Button>
           <Button variant="ghost" className="w-full justify-start text-left" disabled={!isClient}>Contact Support</Button>
           <Button variant="ghost" className="w-full justify-start text-left" disabled={!isClient}>Terms of Service</Button>
           <Button variant="ghost" className="w-full justify-start text-left" disabled={!isClient}>Privacy Policy</Button>
        </CardContent>
      </Card>


      {/* Logout Button */}
       <Button
           variant="destructive"
           className="w-full flex items-center gap-2 animate-fade-in opacity-0 [--fade-in-delay:550ms]"
           onClick={handleLogoutClick} // Use the handler
           disabled={isLoggingOut || !isClient} // Disable while logging out or if not client
        >
           {isLoggingOut ? (
               <Loader2 className="h-4 w-4 animate-spin" />
           ) : (
               <LogOut className="h-4 w-4" />
           )}
           {isLoggingOut ? 'Logging Out...' : 'Logout'}
        </Button>
    </div>
  );
}
