"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, MessageCircle, LayoutGrid, Gamepad2, Compass, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GameLobbyContent } from './game-lobby-content'; // Import the content part
import { MySpaceContent } from './my-space-content'; // Import MySpace content
import { SettingsContent } from './settings-content'; // Import Settings content

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string; // Path for navigation
  isSheet?: boolean; // Indicates if it opens a sheet
  sheetContent?: React.ReactNode; // Content for the sheet
  sheetTitle?: string; // Title for the sheet
}

const navItems: NavItem[] = [
  { id: 'chats', label: 'Chats', icon: MessageCircle, path: '/' },
  {
    id: 'plane', // Assuming 'Plane' refers to 'My Space' based on visual grouping
    label: 'My Space',
    icon: LayoutGrid, // Using LayoutGrid as a placeholder for 'My Space'
    isSheet: true,
    sheetContent: <MySpaceContent />,
    sheetTitle: 'My Space',
   },
  {
    id: 'games',
    label: 'Games',
    icon: Gamepad2,
    isSheet: true,
    sheetContent: <GameLobbyContent />, // Use the extracted content
    sheetTitle: 'Game Lobby',
   },
  { id: 'browse', label: 'Browse', icon: Compass, path: '/browse' }, // Added Browse based on schematic
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    isSheet: true,
    sheetContent: <SettingsContent />,
    sheetTitle: 'Settings',
   },
];

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [openSheet, setOpenSheet] = useState<string | null>(null);

  const handleNavigation = (item: NavItem) => {
    if (item.isSheet) {
      setOpenSheet(item.id);
    } else if (item.path) {
      router.push(item.path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-lg z-50 flex items-center justify-around px-2">
      <TooltipProvider delayDuration={100}>
        {navItems.map((item) => {
           const isActive = !item.isSheet && pathname === item.path;
           const isSheetOpen = openSheet === item.id;

           const buttonContent = (
              <div className="flex flex-col items-center">
                <item.icon className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive || isSheetOpen ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                    "text-xs mt-1 transition-colors duration-200",
                    isActive || isSheetOpen ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                    {item.label}
                </span>
              </div>
           );

           if (item.isSheet) {
            return (
              <Sheet key={item.id} open={isSheetOpen} onOpenChange={(isOpen) => setOpenSheet(isOpen ? item.id : null)}>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "h-full w-full flex flex-col items-center justify-center p-1 transition-transform duration-200 ease-out",
                            isSheetOpen ? 'scale-110' : 'hover:scale-105'
                          )}
                        >
                          {buttonContent}
                        </Button>
                     </SheetTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top">{item.label}</TooltipContent>
                </Tooltip>
                <SheetContent side="bottom" className="h-[80svh]"> {/* Adjust height as needed */}
                  <SheetHeader>
                    <SheetTitle className="text-center">{item.sheetTitle || item.label}</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 h-full overflow-y-auto">
                    {item.sheetContent}
                  </div>
                </SheetContent>
              </Sheet>
            );
          }

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-full w-full flex flex-col items-center justify-center p-1 transition-transform duration-200 ease-out",
                     isActive ? 'scale-110' : 'hover:scale-105'
                  )}
                  onClick={() => handleNavigation(item)}
                >
                 {buttonContent}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </nav>
  );
}
