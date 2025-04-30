
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
                     name: "Bob The Builder", // Example Name
                     email: "bob@example.com", // Example Email
                     avatar: "https://picsum.photos/seed/bob/100/100", // Set avatar URL after delay
                     kinectId: `KINECT#${randomIdPart}` // Assign generated ID
                 });
                 // Load saved theme preference
                 const savedTheme = localStorage.getItem('theme') || 'dark';
                 const savedNavPos = localStorage.getItem('navSnapPosition') as NavSnapPosition || 'top-right'; // Load saved nav pos

                 setSettings(prev => ({ ...prev, theme: savedTheme }));
                 // setNavPosition(savedNavPos); // Update nav position based on saved value

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

            }, 800); // Simulate delay
            return () => clearTimeout(timer);
       }
   }, [isClient]); // Removed setNavPosition dependency


  const copyKinectId = () => {
    if (!navigator.clipboard || !isClient || user.kinectId === "KINECT#...") {
        toast({ variant: "destructive", title: "Cannot Copy", description: "Clipboard API not available or ID not loaded." });
        return;
    }
    navigator.clipboard.writeText(user.kinectId).then(() => {
        toast({
            title: "Kinect ID Copied!",
            description: `${user.kinectId} copied to clipboard.`,
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
        await new Promise(resolve => setTimeout(resolve, 800));
        // Call the passed-in onLogout function
        onLogout();
        toast({ title: "Logged Out", description: "See you soon!", duration: 3000 });
        // No need to set isLoggingOut back to false as the component might unmount
    };

    // Handle settings changes
    const handleSwitchChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
        // Here you would typically save the setting to your backend/localStorage
        toast({ title: "Notification Setting Updated", duration: 2000 });
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
        toast({ title: "Navigation Snap Updated", description: `Menu snaps to ${value.replace('-', ' ')}.`, duration: 2500 });
    }


  return (
    // Increased padding bottom
    <div className="space-y-6 p-4 pb-12">
      {/* Account Section - Enhanced Layout */}
      <Card className="animate-fade-in opacity-0 [--fade-in-delay:50ms] shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Account</CardTitle>
          <CardDescription>Manage your profile and Kinect ID.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5"> {/* Increased spacing */}
           <div className="flex items-center gap-4">
             {isClient && user.name !== "Loading..." ? (
                 <Avatar className="h-[72px] w-[72px] border-2 border-primary/60 shadow-sm"> {/* Larger Avatar */}
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                 </Avatar>
             ) : (
                 <Skeleton className="h-[72px] w-[72px] rounded-full" />
             )}
             <div className="flex-1 min-w-0 space-y-1"> {/* Added space-y-1 */}
                 {isClient && user.name !== "Loading..." ? (
                     <>
                        <p className="font-semibold text-lg truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        {/* Kinect ID with Copy Button */}
                        <div className="flex items-center gap-1 pt-1">
                            <Label htmlFor="kinect-id-display" className="text-xs text-muted-foreground">Kinect ID:</Label>
                            <Input
                                id="kinect-id-display"
                                readOnly
                                value={user.kinectId}
                                className="flex-1 h-7 text-xs font-mono bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-ring px-2"
                                aria-label="Your Kinect ID"
                            />
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary flex-shrink-0" onClick={copyKinectId} aria-label="Copy Kinect ID" disabled={user.kinectId === "KINECT#..."}>
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                     </>
                 ) : (
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4 rounded" />
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-5 w-1/2 rounded" />
                    </div>
                 )}
             </div>
             {/* <Button variant="outline" size="sm" className="ml-auto flex-shrink-0 interactive-hover" disabled={!isClient || user.name === "Loading..."}>Edit Profile</Button> */}
           </div>
           <Separator />
           <div className="space-y-2">
            <Label htmlFor="username-settings">Display Name</Label>
            {isClient && user.name !== "Loading..." ? (
                 <Input id="username-settings" defaultValue={user.name} placeholder="Enter your display name" />
            ): (
                <Skeleton className="h-10 w-full rounded-md" />
            )}
          </div>
           <div className="space-y-2">
            <Label htmlFor="email-settings">Email Address</Label>
            {isClient && user.email !== "loading@example.com" ? (
                <Input id="email-settings" type="email" defaultValue={user.email} disabled placeholder="Your email address"/>
            ) : (
                <Skeleton className="h-10 w-full rounded-md" />
            )}
          </div>
           <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full interactive-hover" disabled={!isClient}>Change Password</Button>
                <Button variant="outline" className="w-full interactive-hover" disabled={!isClient}>Edit Profile</Button>
           </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="animate-fade-in opacity-0 [--fade-in-delay:150ms] shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Notifications</CardTitle>
          <CardDescription>Choose how you get notified.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5"> {/* Increased spacing */}
          <div className="flex items-center justify-between hover:bg-muted/30 p-2 -m-2 rounded-md transition-colors duration-150">
            <Label htmlFor="push-notifications" className="flex-1 pr-4 cursor-pointer">Push Notifications</Label>
            <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSwitchChange('pushNotifications', checked)}
                disabled={!isClient}
                aria-label="Toggle Push Notifications"
            />
          </div>
          <div className="flex items-center justify-between hover:bg-muted/30 p-2 -m-2 rounded-md transition-colors duration-150">
            <Label htmlFor="email-notifications" className="flex-1 pr-4 cursor-pointer">Email Notifications</Label>
            <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                disabled={!isClient}
                aria-label="Toggle Email Notifications"
            />
          </div>
          <div className="flex items-center justify-between hover:bg-muted/30 p-2 -m-2 rounded-md transition-colors duration-150">
            <Label htmlFor="sound-notifications" className="flex-1 pr-4 cursor-pointer">Notification Sounds</Label>
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
      <Card className="animate-fade-in opacity-0 [--fade-in-delay:250ms] shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Appearance</CardTitle>
           <CardDescription>Customize the app's look.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6"> {/* Increased spacing */}
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-select">Theme</Label>
            <Select
                value={settings.theme}
                onValueChange={handleThemeChange}
                disabled={!isClient}
            >
                 <SelectTrigger id="theme-select" className="w-[150px]"> {/* Reduced width */}
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
            <Label className="flex items-center gap-2"><Move className="h-4 w-4"/> Navigation Menu Corner</Label>
             {/* Use currentNavPosition for defaultValue and onValueChange to update via prop */}
            <RadioGroup
                value={currentNavPosition} // Controlled component using the prop
                onValueChange={(value) => handleNavPositionChange(value as NavSnapPosition)} // Call the passed setter
                className="grid grid-cols-2 gap-x-4 gap-y-3" // Adjusted gap
                disabled={!isClient}
             >
              {(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as NavSnapPosition[]).map((pos) => (
                <div key={pos} className="flex items-center space-x-2 hover:bg-muted/30 p-1 -m-1 rounded-md transition-colors duration-150">
                  <RadioGroupItem value={pos} id={`nav-pos-${pos}`} />
                  <Label htmlFor={`nav-pos-${pos}`} className="capitalize text-sm font-normal cursor-pointer">
                    {pos.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </RadioGroup>
             <p className="text-xs text-muted-foreground">Sets the corner the draggable menu snaps back to.</p>
          </div>
           {/* Add more appearance settings like font size, chat density etc. */}
        </CardContent>
      </Card>


      {/* Privacy & Security Section */}
      <Card className="animate-fade-in opacity-0 [--fade-in-delay:350ms] shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Privacy & Security</CardTitle>
          <CardDescription>Control your privacy settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start text-left interactive-hover" disabled={!isClient}>Manage Blocked Users</Button>
          <Button variant="outline" className="w-full justify-start text-left interactive-hover" disabled={!isClient}>Activity Status Settings</Button>
          <Button variant="outline" className="w-full justify-start text-left interactive-hover" disabled={!isClient}>Two-Factor Authentication</Button>
        </CardContent>
      </Card>

      {/* Help & Support Section */}
       <Card className="animate-fade-in opacity-0 [--fade-in-delay:450ms] shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary" /> Help & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1"> {/* Reduced spacing */}
           <Button variant="ghost" className="w-full justify-start text-left text-muted-foreground hover:text-primary hover:bg-muted/50" disabled={!isClient}>FAQ</Button>
           <Button variant="ghost" className="w-full justify-start text-left text-muted-foreground hover:text-primary hover:bg-muted/50" disabled={!isClient}>Contact Support</Button>
           <Button variant="ghost" className="w-full justify-start text-left text-muted-foreground hover:text-primary hover:bg-muted/50" disabled={!isClient}>Terms of Service</Button>
           <Button variant="ghost" className="w-full justify-start text-left text-muted-foreground hover:text-primary hover:bg-muted/50" disabled={!isClient}>Privacy Policy</Button>
        </CardContent>
      </Card>


      {/* Logout Button */}
       <Button
           variant="destructive"
           className="w-full flex items-center gap-2 animate-fade-in opacity-0 [--fade-in-delay:550ms] interactive-hover"
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
