
"use client";

import { useState, useEffect } from 'react';
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

type NavPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

interface BottomNavigationProps {
  onLogout: () => void; // Add onLogout prop
  initialPosition?: NavPosition; // Allow setting initial position
}

// Mappings for position styles
const positionStyles: Record<NavPosition, { fab: string; menu: string; tooltipSide: 'left' | 'right' | 'top' | 'bottom' }> = {
  'bottom-right': {
    fab: 'bottom-4 right-4',
    menu: 'bottom-[76px] right-4 items-end',
    tooltipSide: 'left',
  },
  'bottom-left': {
    fab: 'bottom-4 left-4',
    menu: 'bottom-[76px] left-4 items-start',
    tooltipSide: 'right',
  },
  'top-right': {
    fab: 'top-4 right-4',
    menu: 'top-[76px] right-4 items-end',
    tooltipSide: 'left',
  },
  'top-left': {
    fab: 'top-4 left-4',
    menu: 'top-[76px] left-4 items-start',
    tooltipSide: 'right',
  },
};

export function BottomNavigation({ onLogout, initialPosition = 'bottom-right' }: BottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [openSheet, setOpenSheet] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false); // State for the main circle toggle
  const [navPosition, setNavPosition] = useState<NavPosition>(() => {
      // Try to get position from localStorage, default to initialPosition
      if (typeof window !== 'undefined') {
          const savedPosition = localStorage.getItem('navPosition') as NavPosition | null;
          return savedPosition && positionStyles[savedPosition] ? savedPosition : initialPosition;
      }
      return initialPosition;
  });

  // Example: Allow cycling through positions by clicking the FAB 5 times quickly (demo purpose)
  // In a real app, this would be controlled via settings
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  useEffect(() => {
    // Reset click count if too much time passes
    if (Date.now() - lastClickTime > 1000) {
      setClickCount(0);
    }
  }, [lastClickTime]);

  const cyclePosition = () => {
    const positions: NavPosition[] = ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
    const currentIndex = positions.indexOf(navPosition);
    const nextIndex = (currentIndex + 1) % positions.length;
    const nextPosition = positions[nextIndex];
    setNavPosition(nextPosition);
    localStorage.setItem('navPosition', nextPosition); // Save new position
    setClickCount(0); // Reset count after cycling
  };

  const handleFabClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 300) { // Check for rapid clicks (e.g., within 300ms)
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount >= 4) { // Cycle after 5 rapid clicks (0, 1, 2, 3, 4)
        cyclePosition();
        setIsNavOpen(false); // Close nav after cycling
      } else {
         toggleNav(); // Normal toggle if not cycling
      }
    } else {
      setClickCount(0); // Reset count if click is slow
      toggleNav(); // Normal toggle
    }
    setLastClickTime(now);
  };
  // End demo cycle logic

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
      // Pass setNavPosition to settings to allow changing position
      sheetContent: (props) => <SettingsContent {...props} setNavPosition={setNavPosition} currentNavPosition={navPosition} />,
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

   const currentPositionStyles = positionStyles[navPosition];

  return (
    <TooltipProvider delayDuration={100}>
        {/* Floating Action Button (FAB) Container - Position is controlled here */}
        <div className={cn(
            "fixed z-[60] animate-fade-in opacity-0 [--fade-in-delay:500ms]",
            currentPositionStyles.fab
        )}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="icon"
                        className={cn(
                            "rounded-full w-14 h-14 shadow-lg retro-glow transition-all duration-300 ease-out", // Added transition-all
                            isNavOpen ? "scale-110 bg-primary/80 rotate-90" : "hover:scale-110 active:scale-100 rotate-0" // Rotate icon on open
                        )}
                        // onClick={toggleNav} // Use handleFabClick for demo cycle logic
                        onClick={handleFabClick}
                        aria-label={isNavOpen ? "Close Navigation" : "Open Navigation"}
                        aria-expanded={isNavOpen}
                    >
                        {isNavOpen ? <CloseIcon className="h-6 w-6 transition-transform duration-300" /> : <Home className="h-6 w-6 transition-transform duration-300" />}
                    </Button>
                </TooltipTrigger>
                {/* Adjust tooltip side based on position */}
                <TooltipContent side={currentPositionStyles.tooltipSide}>{isNavOpen ? "Close" : "Menu"}</TooltipContent>
            </Tooltip>
        </div>

        {/* Navigation Items Container - Position is controlled here */}
        {/* Adjust transform-origin based on position */}
        <div
            className={cn(
                "fixed z-50 flex flex-col gap-3 transition-all duration-300 ease-out",
                currentPositionStyles.menu, // Apply position classes
                isNavOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none", // Adjusted animation
                navPosition.includes('bottom') ? (navPosition.includes('left') ? 'origin-bottom-left' : 'origin-bottom-right') : '',
                navPosition.includes('top') ? (navPosition.includes('left') ? 'origin-top-left' : 'origin-top-right') : ''
            )}
            aria-hidden={!isNavOpen} // Hide from screen readers when closed
        >
            {navItems.map((item, index) => {
            const isActive = !item.isSheet && pathname === item.path;

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
                                         `delay-${index * 50}`, // Stagger animation
                                        openSheet === item.id ? 'scale-105 bg-primary/10 text-primary' : 'hover:scale-105 active:scale-100'
                                    )}
                                    aria-label={`Open ${item.label} sheet`}
                                    onClick={() => handleNavigation(item)} // Ensure sheet opens via nav logic
                                >
                                    {buttonContent}
                                </Button>
                            </SheetTrigger>
                        </TooltipTrigger>
                         {/* Adjust tooltip side based on position */}
                        <TooltipContent side={currentPositionStyles.tooltipSide} className="bg-secondary text-secondary-foreground">
                            {item.label}
                        </TooltipContent>
                    </Tooltip>
                    <SheetContent side="bottom" className="h-[80svh] flex flex-col rounded-t-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <SheetHeader className="flex-shrink-0 border-b pb-2">
                            <SheetTitle className="text-center text-lg">{item.sheetTitle}</SheetTitle>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto pt-2 pb-4">
                             {/* Pass potential props needed by sheet content */}
                             {/* Ensure sheetProps includes setNavPosition if SettingsContent needs it directly */}
                            <SheetContentComponent
                                {...item.sheetProps}
                                // SettingsContent now receives setNavPosition and currentNavPosition via its props defined in the navItems array
                                // No need to explicitly pass them here again unless they weren't in sheetProps
                            />
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
                             `delay-${index * 50}`, // Stagger animation
                            isActive ? 'scale-105 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:scale-105 active:scale-100'
                        )}
                        onClick={() => handleNavigation(item)}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {buttonContent}
                    </Button>
                </TooltipTrigger>
                 {/* Adjust tooltip side based on position */}
                 <TooltipContent side={currentPositionStyles.tooltipSide} className={cn(isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
                    {item.label}
                </TooltipContent>
                </Tooltip>
            );
            })}
        </div>
    </TooltipProvider>
  );
}

// Helper function to generate Tailwind delay classes (optional, can inline)
function generateDelayClasses() {
  const delays = [0, 50, 75, 100, 150, 200, 300, 500];
  return delays.map(d => `delay-${d}`).join(' ');
}
// You might need to configure Tailwind Safelist if you generate classes dynamically like this:
// tailwind.config.js
// module.exports = {
//   safelist: [
//     {
//       pattern: /delay-\d+/,
//     },
//   ],
//   // ... rest of config
// };

