
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, MessageCircle, LayoutGrid, Gamepad2, Compass, Settings, User, X as CloseIcon, Move } from 'lucide-react';
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
import { SettingsContent } from './settings-content';

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

// Still useful for menu expansion direction and tooltip side
type NavSnapPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

interface BottomNavigationProps {
  onLogout: () => void;
  initialSnapPosition?: NavSnapPosition; // Represents the corner the FAB snaps to
}

// Styles based on snap position, mostly for menu expansion and tooltip
const snapPositionStyles: Record<NavSnapPosition, { menuDirection: string; tooltipSide: 'left' | 'right' | 'top' | 'bottom' }> = {
  'bottom-right': { menuDirection: 'bottom-[76px] right-4 items-end', tooltipSide: 'left' },
  'bottom-left': { menuDirection: 'bottom-[76px] left-4 items-start', tooltipSide: 'right' },
  'top-right': { menuDirection: 'top-[76px] right-4 items-end', tooltipSide: 'left' },
  'top-left': { menuDirection: 'top-[76px] left-4 items-start', tooltipSide: 'right' },
};

// Default FAB starting position (adjust as needed)
const DEFAULT_FAB_POS = { top: 'auto', right: '1rem', bottom: '1rem', left: 'auto' };
const FAB_SIZE = 56; // Approx size of the FAB (w-14 h-14 = 56px)
const MENU_ITEM_SIZE = 48; // Approx size of menu items (w-12 h-12 = 48px)
const MENU_GAP = 12; // Gap between menu items (gap-3)


export function BottomNavigation({ onLogout, initialSnapPosition = 'top-right' }: BottomNavigationProps) { // Changed default to 'top-right'
  const router = useRouter();
  const pathname = usePathname();
  const [openSheet, setOpenSheet] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [snapPosition, setSnapPosition] = useState<NavSnapPosition>(() => {
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('navSnapPosition') as NavSnapPosition | null;
      return savedPosition && snapPositionStyles[savedPosition] ? savedPosition : initialSnapPosition;
    }
    return initialSnapPosition;
  });
  const [fabPosition, setFabPosition] = useState({ top: 0, left: 0 }); // Current pixel position
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const fabRef = useRef<HTMLDivElement>(null);
  const [hasMounted, setHasMounted] = useState(false); // Track client-side mount

  // Define nav items inside the component
  const navItems: NavItem[] = [
    { id: 'chats', label: 'Chats', icon: MessageCircle, path: '/' },
    { id: 'myspace', label: 'My Space', icon: LayoutGrid, isSheet: true, sheetContent: MySpaceContent, sheetTitle: 'My Space' },
    { id: 'games', label: 'Games', icon: Gamepad2, isSheet: true, sheetContent: GameLobbyContent, sheetTitle: 'Game Lobby' },
    { id: 'browse', label: 'Browse', icon: Compass, path: '/browse' },
    { id: 'settings', label: 'Settings', icon: Settings, isSheet: true, sheetContent: (props) => <SettingsContent {...props} setNavPosition={setSnapPosition} currentNavPosition={snapPosition} />, sheetProps: { onLogout }, sheetTitle: 'Settings' },
  ];

  // --- Initialization and Saving Position ---
  useEffect(() => {
    setHasMounted(true); // Indicate component has mounted on client
    const savedFabPos = localStorage.getItem('fabPosition');
    const savedSnapPos = localStorage.getItem('navSnapPosition') as NavSnapPosition | null;

    if (savedSnapPos && snapPositionStyles[savedSnapPos]) {
        setSnapPosition(savedSnapPos);
    }

    if (savedFabPos) {
      try {
        const pos = JSON.parse(savedFabPos);
        // Basic validation
        if (typeof pos.top === 'number' && typeof pos.left === 'number') {
            // Ensure position is within bounds on load
            const { innerWidth, innerHeight } = window;
            pos.top = Math.max(16, Math.min(pos.top, innerHeight - FAB_SIZE - 16)); // 16px padding
            pos.left = Math.max(16, Math.min(pos.left, innerWidth - FAB_SIZE - 16));
            setFabPosition(pos);
        } else {
            // If invalid data, reset to default based on snap position
             resetFabPositionToSnap(savedSnapPos || initialSnapPosition);
        }
      } catch (e) {
        console.error("Failed to parse saved FAB position", e);
         resetFabPositionToSnap(savedSnapPos || initialSnapPosition);
      }
    } else {
        // No saved position, set initial based on snap position
        resetFabPositionToSnap(savedSnapPos || initialSnapPosition);
    }

  }, [initialSnapPosition]); // Add initialSnapPosition dependency

  const resetFabPositionToSnap = useCallback((snapPos: NavSnapPosition) => {
      if (typeof window === 'undefined') return; // Guard against SSR
      const { innerWidth, innerHeight } = window;
      let newPos = { top: 0, left: 0 };
      const padding = 16; // 1rem = 16px

      switch (snapPos) {
          case 'top-left':
              newPos = { top: padding, left: padding };
              break;
          case 'top-right':
              newPos = { top: padding, left: innerWidth - FAB_SIZE - padding };
              break;
          case 'bottom-left':
              newPos = { top: innerHeight - FAB_SIZE - padding, left: padding };
              break;
          case 'bottom-right':
          default:
              newPos = { top: innerHeight - FAB_SIZE - padding, left: innerWidth - FAB_SIZE - padding };
              break;
      }
       setFabPosition(newPos);
  }, []); // Removed dependencies that caused infinite loop


  // Save FAB position to localStorage whenever it changes
  useEffect(() => {
      if (hasMounted && fabPosition.top !== 0 && fabPosition.left !== 0) { // Avoid saving initial 0,0
         localStorage.setItem('fabPosition', JSON.stringify(fabPosition));
      }
  }, [fabPosition, hasMounted]);

  // Save snap position to localStorage and reset FAB position when snap changes
   useEffect(() => {
       if (hasMounted) {
         localStorage.setItem('navSnapPosition', snapPosition);
         // When snap position changes (e.g., via settings), reset FAB position
         resetFabPositionToSnap(snapPosition);
       }
   }, [snapPosition, hasMounted, resetFabPositionToSnap]); // Added resetFabPositionToSnap


  // --- Drag Handlers ---
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!fabRef.current) return;

    // Close the nav menu if it's open when starting a drag
    if (isNavOpen) {
      setIsNavOpen(false);
    }

    setIsDragging(true);
    fabRef.current.style.transition = 'none'; // Disable transitions during drag
    fabRef.current.style.cursor = 'grabbing'; // Change cursor

    const fabRect = fabRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
      e.preventDefault(); // Prevent text selection etc. during mouse drag
    }

    setDragOffset({
      x: clientX - fabRect.left,
      y: clientY - fabRect.top,
    });

    // Add global listeners
    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragging, { passive: false }); // Allow preventDefault
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleDragging = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    e.preventDefault(); // Prevent scrolling on touch devices

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const { innerWidth, innerHeight } = window;
    let newTop = clientY - dragOffset.y;
    let newLeft = clientX - dragOffset.x;

    // Constrain within viewport boundaries (with padding)
    const padding = 16; // 1rem
    newTop = Math.max(padding, Math.min(newTop, innerHeight - FAB_SIZE - padding));
    newLeft = Math.max(padding, Math.min(newLeft, innerWidth - FAB_SIZE - padding));

    setFabPosition({ top: newTop, left: newLeft });

  }, [isDragging, dragOffset]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    if (fabRef.current) {
        fabRef.current.style.transition = ''; // Re-enable transitions
        fabRef.current.style.cursor = 'grab'; // Restore cursor
    }

    // Remove global listeners
    document.removeEventListener('mousemove', handleDragging);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragging);
    document.removeEventListener('touchend', handleDragEnd);

    // Determine the closest corner and snap
    snapToCorner();

  }, [isDragging, handleDragging, snapToCorner]); // Use snapToCorner


  const snapToCorner = useCallback(() => {
      if (typeof window === 'undefined') return; // Guard against SSR
      const { innerWidth, innerHeight } = window;
      const centerX = innerWidth / 2;
      const centerY = innerHeight / 2;
      const currentFabCenter = {
          x: fabPosition.left + FAB_SIZE / 2,
          y: fabPosition.top + FAB_SIZE / 2,
      };

      let newSnapPosition: NavSnapPosition;

      if (currentFabCenter.y < centerY) { // Top half
          newSnapPosition = currentFabCenter.x < centerX ? 'top-left' : 'top-right';
      } else { // Bottom half
          newSnapPosition = currentFabCenter.x < centerX ? 'bottom-left' : 'bottom-right';
      }

      setSnapPosition(newSnapPosition); // This will trigger the useEffect to reset position and save
  }, [fabPosition]); // Added fabPosition dependency


  // --- Navigation Logic ---
  const handleNavigation = (item: NavItem) => {
    if (isDragging) return; // Don't navigate if just finished dragging

    if (item.isSheet) {
      setOpenSheet(item.id);
      setIsNavOpen(false);
    } else if (item.path && item.path !== pathname) {
      router.push(item.path);
      setIsNavOpen(false);
    } else {
      setIsNavOpen(false);
    }
  };

  const handleSheetOpenChange = (itemId: string, isOpen: boolean) => {
    setOpenSheet(isOpen ? itemId : null);
  };

  const toggleNav = () => {
      // Prevent toggle if dragging starts on the button itself
     if (!isDragging) {
        setIsNavOpen(!isNavOpen);
        setOpenSheet(null);
     }
  };

  const currentSnapStyles = snapPositionStyles[snapPosition];


  // Calculate menu position based on FAB position and snap corner
  const getMenuPositionStyle = useCallback((): React.CSSProperties => {
      const style: React.CSSProperties = {
          position: 'fixed',
          display: 'flex',
          flexDirection: 'column',
          gap: `${MENU_GAP}px`,
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
          zIndex: 50, // Below FAB (60)
      };

      if (!isNavOpen) {
          style.opacity = 0;
          style.transform = snapPosition.includes('bottom')
              ? 'scale(0.95) translateY(10px)'
              : 'scale(0.95) translateY(-10px)';
          style.pointerEvents = 'none';
      } else {
          style.opacity = 1;
          style.transform = 'scale(1) translateY(0)';
          style.pointerEvents = 'auto';
      }

      const menuHeight = navItems.length * MENU_ITEM_SIZE + (navItems.length -1) * MENU_GAP;
      const fabTop = fabPosition.top;
      const fabLeft = fabPosition.left;

      switch (snapPosition) {
          case 'top-left':
              style.top = `${fabTop + FAB_SIZE + MENU_GAP}px`;
              style.left = `${fabLeft}px`;
              style.alignItems = 'flex-start';
              style.transformOrigin = 'top left';
              break;
          case 'top-right':
              style.top = `${fabTop + FAB_SIZE + MENU_GAP}px`;
              style.left = `${fabLeft + FAB_SIZE - MENU_ITEM_SIZE}px`; // Align right edges
              style.alignItems = 'flex-end';
               style.transformOrigin = 'top right';
              break;
          case 'bottom-left':
              style.top = `${fabTop - menuHeight - MENU_GAP}px`;
              style.left = `${fabLeft}px`;
              style.alignItems = 'flex-start';
               style.transformOrigin = 'bottom left';
              break;
          case 'bottom-right':
          default:
              style.top = `${fabTop - menuHeight - MENU_GAP}px`;
              style.left = `${fabLeft + FAB_SIZE - MENU_ITEM_SIZE}px`; // Align right edges
              style.alignItems = 'flex-end';
               style.transformOrigin = 'bottom right';
              break;
      }

      return style;
  }, [isNavOpen, snapPosition, fabPosition, navItems.length]); // Added dependencies


  // Ensure component only renders on client after mount to avoid hydration errors
  if (!hasMounted) {
      return null; // Or a placeholder skeleton if preferred
  }


  return (
    <TooltipProvider delayDuration={100}>
        {/* FAB Container - Position is controlled by state */}
        <div
            ref={fabRef}
            className={cn(
                "fixed z-[60] animate-fade-in opacity-0 [--fade-in-delay:500ms] rounded-full cursor-grab transition-all duration-300 ease-out", // Added transition for snap back
                isDragging && "scale-110 shadow-2xl", // Scale up and shadow during drag
            )}
            style={{
                top: `${fabPosition.top}px`,
                left: `${fabPosition.left}px`,
                touchAction: 'none', // Prevent scrolling while dragging on touch
            }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="icon"
                        className={cn(
                            "rounded-full w-14 h-14 shadow-lg retro-glow transition-all duration-300 ease-out",
                            isNavOpen ? "scale-110 bg-primary/80 rotate-90" : "hover:scale-110 active:scale-100 rotate-0"
                        )}
                        onClick={toggleNav}
                        aria-label={isNavOpen ? "Close Navigation" : "Open Navigation"}
                        aria-expanded={isNavOpen}
                        // Prevent drag start from triggering click
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                    >
                         {isDragging ? <Move className="h-6 w-6 animate-pulse" /> : (isNavOpen ? <CloseIcon className="h-6 w-6 transition-transform duration-300" /> : <Home className="h-6 w-6 transition-transform duration-300" />)}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side={currentSnapStyles.tooltipSide}>{isNavOpen ? "Close" : "Menu"}</TooltipContent>
            </Tooltip>
        </div>

        {/* Navigation Items Container - Dynamically positioned */}
        <div
            style={getMenuPositionStyle()}
            aria-hidden={!isNavOpen}
        >
            {navItems.map((item, index) => {
            const isActive = !item.isSheet && pathname === item.path;
            const buttonContent = <item.icon className="h-5 w-5" />;

            const commonButtonClasses = cn(
                "rounded-full w-12 h-12 shadow-md transition-all duration-200 ease-out",
                `delay-${index * 50}`, // Stagger animation (consider removing if menu animation is sufficient)
                 isNavOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90', // Individual item animation within menu
            );

            if (item.isSheet) {
                const SheetContentComponent = item.sheetContent;
                return (
                <Sheet key={item.id} open={openSheet === item.id} onOpenChange={(isOpen) => handleSheetOpenChange(item.id, isOpen)}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SheetTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className={cn(
                                        commonButtonClasses,
                                        openSheet === item.id ? 'scale-105 bg-primary/10 text-primary' : 'hover:scale-105 active:scale-100'
                                    )}
                                    aria-label={`Open ${item.label} sheet`}
                                    onClick={() => handleNavigation(item)}
                                >
                                    {buttonContent}
                                </Button>
                            </SheetTrigger>
                        </TooltipTrigger>
                        <TooltipContent side={currentSnapStyles.tooltipSide} className="bg-secondary text-secondary-foreground">
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
                        variant={isActive ? "default" : "secondary"}
                        size="icon"
                        className={cn(
                            commonButtonClasses,
                            isActive ? 'scale-105 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:scale-105 active:scale-100'
                        )}
                        onClick={() => handleNavigation(item)}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {buttonContent}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side={currentSnapStyles.tooltipSide} className={cn(isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
                    {item.label}
                </TooltipContent>
                </Tooltip>
            );
            })}
        </div>
    </TooltipProvider>
  );
}
