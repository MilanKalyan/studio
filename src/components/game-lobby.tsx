
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Users } from 'lucide-react';
import { GameLobbyContent } from './game-lobby-content'; // Import the content part
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function GameLobby() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);


  return (
     // Ensure this outer div is also flex column
     <div className="flex flex-col h-full bg-background overflow-hidden">
        {/* Header - Added subtle transition */}
         <CardHeader className={cn(
             "flex flex-row items-center justify-between border-b border-border p-3 sm:p-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10 flex-shrink-0 transition-all duration-150 ease-in-out"
         )}>
            <div className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-secondary" />
                <CardTitle className="text-base sm:text-lg font-semibold leading-tight">Game Lobby</CardTitle>
            </div>
            {isClient ? (
                <Button variant="ghost" size="icon" aria-label="Find Players" className="text-muted-foreground hover:text-foreground rounded-full interactive-hover">
                    <Users className="h-5 w-5" />
                </Button>
            ) : (
                <Skeleton className="h-9 w-9 rounded-full" /> // Changed to round
            )}
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 overflow-y-auto p-0"> {/* Ensure overflow is auto */}
           {/* Render content only on client or show skeleton */}
           {isClient ? (
               <GameLobbyContent />
            ) : (
               <div className="p-4 space-y-6">
                 <Skeleton className="h-36 w-full rounded-lg" />
                 <Skeleton className="h-48 w-full rounded-lg" />
                 <Skeleton className="h-40 w-full rounded-lg" />
               </div>
            )}
        </CardContent>
     </div>
  );
}
