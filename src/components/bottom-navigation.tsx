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
import { GameLobbyContent } from './game-lobby-content';
import { MySpaceContent } from './my-space-content';
import { SettingsContent } from './settings-content'; // Ensure this component accepts onLogout

interface NavItemBase {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface NavItemLink extends NavItemBase {
  path: string;
  isSheet?: false;
}

interface NavItemSheet extends NavItemBase {
  isSheet: true;
  path?: never; // Sheets don't navigate directly
  sheetContent: (props?: any) => React.ReactNode; // Allow passing props to sheet content
  sheetProps?: Record<string, any>; // Props to pass to the sheet content component
  sheetTitle: string;
}

type NavItem = NavItemLink | NavItemSheet;

interface BottomNavigationProps {
  onLogout: () => void; // Add onLogout prop
}

export function BottomNavigation({ onLogout }: BottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [openSheet, setOpenSheet] = useState<string | null>(null);

  // Define nav items inside the component to access onLogout
  const navItems: NavItem[] = [
    { id: 'chats', label: 'Chats', icon: MessageCircle, path: '/' },
    {
      id: 'myspace',
      label: 'My Space',
      icon: LayoutGrid,
      isSheet: true,
      sheetContent: MySpaceContent,
      sheetTitle: 'My Space',
    },
    {
      id: 'games',
      label: 'Games',
      icon: Gamepad2,
      isSheet: true,
      sheetContent: GameLobbyContent,
      sheetTitle: 'Game Lobby',
    },
    { id: 'browse', label: 'Browse', icon: Compass, path: '/browse' },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      isSheet: true,
      sheetContent: SettingsContent,
      sheetProps: { onLogout }, // Pass onLogout to SettingsContent
      sheetTitle: 'Settings',
    },
  ];


  const handleNavigation = (item: NavItem) => {
    if (item.isSheet) {
      setOpenSheet(item.id);
    } else if (item.path && item.path !== pathname) { // Only navigate if path is different
        router.push(item.path);
    }
    // Close any open sheet when navigating or opening another sheet
    if (!item.isSheet || (item.isSheet && openSheet !== item.id)) {
        setOpenSheet(null);
    }
  };

   const handleSheetOpenChange = (itemId: string, isOpen: boolean) => {
       setOpenSheet(isOpen ? itemId : null);
   };


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-lg z-50 flex items-center justify-around px-2 backdrop-blur-sm bg-card/80">
      <TooltipProvider delayDuration={100}>
        {navItems.map((item) => {
           const isActive = !item.isSheet && pathname === item.path;
           const isSheetOpen = openSheet === item.id;

           const buttonContent = (
              <div className="flex flex-col items-center justify-center h-full w-full gap-0.5">
                <item.icon className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive || isSheetOpen ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className={cn(
                    "text-[10px] leading-tight mt-0.5 transition-colors duration-200", // Smaller text, tighter line height
                    isActive || isSheetOpen ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"
                )}>
                    {item.label}
                </span>
              </div>
           );

           if (item.isSheet) {
             // Dynamically create the SheetContent component with props
             const SheetContentComponent = item.sheetContent;
             return (
              <Sheet key={item.id} open={isSheetOpen} onOpenChange={(isOpen) => handleSheetOpenChange(item.id, isOpen)}>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "h-full flex-1 group flex flex-col items-center justify-center p-1 transition-transform duration-200 ease-out relative overflow-hidden", // Use flex-1
                            isSheetOpen ? 'scale-105' : 'hover:scale-105 active:scale-100'
                          )}
                           aria-label={`Open ${item.label} sheet`}
                        >
                          {buttonContent}
                           <div className={cn(
                               "absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-transform duration-300",
                               isSheetOpen ? 'scale-x-100' : 'scale-x-0'
                           )}/>
                        </Button>
                     </SheetTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top">{item.label}</TooltipContent>
                </Tooltip>
                <SheetContent side="bottom" className="h-[85svh] flex flex-col"> {/* Adjust height, make flex col */}
                  <SheetHeader className="flex-shrink-0"> {/* Prevent header from shrinking */}
                    <SheetTitle className="text-center">{item.sheetTitle}</SheetTitle>
                  </SheetHeader>
                  {/* Make content scrollable */}
                  <div className="flex-1 overflow-y-auto pb-4">
                    <SheetContentComponent {...item.sheetProps} />
                  </div>
                </SheetContent>
              </Sheet>
             );
           }

           // Standard navigation item
           return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-full flex-1 group flex flex-col items-center justify-center p-1 transition-transform duration-200 ease-out relative overflow-hidden", // Use flex-1
                     isActive ? 'scale-105' : 'hover:scale-105 active:scale-100'
                  )}
                   onClick={() => handleNavigation(item)}
                   aria-current={isActive ? 'page' : undefined}
                >
                 {buttonContent}
                  <div className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-transform duration-300",
                      isActive ? 'scale-x-100' : 'scale-x-0'
                  )}/>
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
