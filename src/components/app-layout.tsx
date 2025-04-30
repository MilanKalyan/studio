
'use client';

import { Card } from '@/components/ui/card';
import { Chat } from '@/components/chat';
import { GameLobby } from '@/components/game-lobby';

/**
 * AppLayout defines the primary two-column structure for the authenticated application view.
 * It includes the Chat component on the left and the GameLobby component on the right (on larger screens).
 */
export function AppLayout() {
  return (
    // Card takes full height within the main area defined in page.tsx
    <Card className="h-full w-full shadow-xl border-primary/10 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Chat Area - Takes full height within Card */}
        <div className="lg:col-span-2 h-full overflow-hidden border-r border-border/50">
          <Chat />
        </div>
        {/* Game Lobby Area - Takes full height within Card */}
        <div className="hidden lg:flex lg:col-span-1 h-full overflow-hidden"> {/* Hide on smaller screens */}
          <GameLobby />
        </div>
    </Card>
  );
}
