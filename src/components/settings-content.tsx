"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Bell, Palette, Shield, LogOut, HelpCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';

export function SettingsContent() {
  // Placeholder state - replace with actual state management
  const user = {
      name: "Bob The Builder",
      email: "bob@example.com",
      avatar: "https://picsum.photos/seed/bob/100/100"
  }

  return (
    <div className="space-y-6 p-4">
      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Account</CardTitle>
          <CardDescription>Manage your profile and account settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center gap-4">
             <Image src={user.avatar} alt={user.name} width={60} height={60} className="rounded-full" />
             <div>
                 <p className="font-semibold">{user.name}</p>
                 <p className="text-sm text-muted-foreground">{user.email}</p>
             </div>
             <Button variant="outline" size="sm" className="ml-auto">Edit Profile</Button>
           </div>
           <Separator />
           <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" defaultValue={user.name} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user.email} disabled />
          </div>
          <Button variant="outline" className="w-full">Change Password</Button>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
          <CardDescription>Configure how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch id="push-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch id="email-notifications" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-notifications">Notification Sounds</Label>
            <Switch id="sound-notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>

       {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</CardTitle>
           <CardDescription>Customize the look and feel of the app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Theme</Label>
            <Select defaultValue="dark">
                 <SelectTrigger id="theme" className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                 </SelectContent>
            </Select>
          </div>
           {/* Add more appearance settings like font size, chat density etc. */}
        </CardContent>
      </Card>


      {/* Privacy & Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy & Security</CardTitle>
          <CardDescription>Manage who can see your activity and secure your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">Manage Blocked Users</Button>
          <Button variant="outline" className="w-full">Activity Status Settings</Button>
          <Button variant="outline" className="w-full">Two-Factor Authentication</Button>
        </CardContent>
      </Card>

      {/* Help & Support Section */}
       <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><HelpCircle className="h-5 w-5" /> Help & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
           <Button variant="ghost" className="w-full justify-start">FAQ</Button>
           <Button variant="ghost" className="w-full justify-start">Contact Support</Button>
           <Button variant="ghost" className="w-full justify-start">Terms of Service</Button>
           <Button variant="ghost" className="w-full justify-start">Privacy Policy</Button>
        </CardContent>
      </Card>


      {/* Logout Button */}
       <Button variant="destructive" className="w-full flex items-center gap-2">
           <LogOut className="h-4 w-4" /> Logout
        </Button>
    </div>
  );
}
