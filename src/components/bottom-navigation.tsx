
"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, MessageCircle, LayoutGrid, Gamepad2, Compass, Settings, User, X as CloseIcon } from 'lucide-react';
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
  const [isNavOpen, setIsNavOpen] = useState(false); // State for the main circle toggle

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
      setIsNavOpen(false); // Close main nav when sheet opens
    } else if (item.path && item.path !== pathname) { // Only navigate if path is different
        router.push(item.path);
        setIsNavOpen(false); // Close main nav on navigation
    } else {
        // If clicking the active link or a non-navigational item without a sheet
        setIsNavOpen(false);
    }
  };

   const handleSheetOpenChange = (itemId: string, isOpen: boolean) => {
       setOpenSheet(isOpen ? itemId : null);
       // Don't automatically close the main nav circle here, sheet controls itself
   };

   const toggleNav = () => {
       setIsNavOpen(!isNavOpen);
       setOpenSheet(null); // Close any open sheet when toggling main nav
   }

  return (
    <TooltipProvider delayDuration={100}>
        {/* Floating Action Button (FAB) to toggle the main navigation */}
        <div className="fixed bottom-4 right-4 z-[60] animate-fade-in opacity-0 [--fade-in-delay:500ms]">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="icon"
                        className={cn(
                            "rounded-full w-14 h-14 shadow-lg retro-glow transition-transform duration-300 ease-out",
                            isNavOpen ? "scale-110 bg-primary/80" : "hover:scale-110 active:scale-100"
                        )}
                        onClick={toggleNav}
                        aria-label={isNavOpen ? "Close Navigation" : "Open Navigation"}
                        aria-expanded={isNavOpen}
                    >
                        {isNavOpen ? <CloseIcon className="h-6 w-6" /> : <Home className="h-6 w-6" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">{isNavOpen ? "Close" : "Menu"}</TooltipContent>
            </Tooltip>
        </div>

        {/* Navigation Items Container - Appears when FAB is clicked */}
        {/* Positioned slightly above the FAB */}
        <div
            className={cn(
                "fixed bottom-[76px] right-4 z-50 flex flex-col items-end gap-3 transition-all duration-300 ease-out",
                isNavOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}
            aria-hidden={!isNavOpen} // Hide from screen readers when closed
        >
            {navItems.map((item) => {
            const isActive = !item.isSheet && pathname === item.path;
            const isSheetTrigger = item.isSheet;

            const buttonContent = (
                <item.icon className={cn(
                    "h-5 w-5", // Slightly smaller icon
                )} />
            );

            if (item.isSheet) {
                // Dynamically create the SheetContent component with props
                const SheetContentComponent = item.sheetContent;
                return (
                <Sheet key={item.id} open={openSheet === item.id} onOpenChange={(isOpen) => handleSheetOpenChange(item.id, isOpen)}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SheetTrigger asChild>
                                <Button
                                    variant="secondary" // Use secondary for contrast
                                    size="icon"
                                    className={cn(
                                        "rounded-full w-12 h-12 shadow-md transition-all duration-200 ease-out",
                                        openSheet === item.id ? 'scale-105 bg-primary/10 text-primary' : 'hover:scale-105 active:scale-100'
                                    )}
                                    aria-label={`Open ${item.label} sheet`}
                                    onClick={() => handleNavigation(item)} // Ensure sheet opens via nav logic
                                >
                                    {buttonContent}
                                </Button>
                            </SheetTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="bg-secondary text-secondary-foreground">
                            {item.label}
                        </TooltipContent>
                    </Tooltip>
                    <SheetContent side="bottom" className="h-[80svh] flex flex-col rounded-t-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <SheetHeader className="flex-shrink-0 border-b pb-2">
                            <SheetTitle className="text-center text-lg">{item.sheetTitle}</SheetTitle>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto pt-2 pb-4">
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
                        variant={isActive ? "default" : "secondary"} // Default for active, secondary otherwise
                        size="icon"
                        className={cn(
                            "rounded-full w-12 h-12 shadow-md transition-all duration-200 ease-out",
                            isActive ? 'scale-105 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:scale-105 active:scale-100'
                        )}
                        onClick={() => handleNavigation(item)}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {buttonContent}
                    </Button>
                </TooltipTrigger>
                 <TooltipContent side="left" className={cn(isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
                    {item.label}
                </TooltipContent>
                </Tooltip>
            );
            })}
        </div>
    </TooltipProvider>
  );
}

