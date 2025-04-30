
'use client';

import { Card } from '@/components/ui/card';
import { Chat } from '@/components/chat';
import { GameLobby } from '@/components/game-lobby';
import type { ChatRoom, Message } from '@/components/chat'; // Import types
import { cn } from '@/lib/utils';

interface AppLayoutProps {
    chatRooms: ChatRoom[];
    currentChat: ChatRoom | null;
    // messages prop is removed as Chat component fetches its own messages
    isChatLoading: boolean;
    currentUser: string;
    currentUserId: string;
    onSwitchChat: (chatId: string, newChatDetails?: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'>) => void; // Adjusted type
    // onAddMessage prop is removed
    onAddChatRoom: (newRoom: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'>) => Promise<void>; // Adjusted type
}

/**
 * AppLayout defines the primary two-column structure for the authenticated application view.
 * It includes the Chat component on the left and the GameLobby component on the right (on larger screens).
 * It receives chat state and handlers from the parent (Home) component.
 */
export function AppLayout({
    chatRooms,
    currentChat,
    // messages prop removed
    isChatLoading,
    currentUser,
    currentUserId,
    onSwitchChat,
    // onAddMessage prop removed
    onAddChatRoom
}: AppLayoutProps) {
  return (
    // Card takes full height within the main area defined in page.tsx
    // Added subtle gradient, improved overflow handling and responsive gap
    <Card className={cn(
        "h-full w-full shadow-xl border-primary/10 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-0",
        "bg-gradient-to-br from-card/90 via-card/95 to-card/90" // Subtle gradient
    )}>
        {/* Chat Area - Takes full height within Card */}
        <div className="lg:col-span-2 h-full overflow-hidden border-r border-border/50 flex flex-col"> {/* Ensure flex column */}
          {/* Pass down relevant props to Chat component */}
          <Chat
             chatRooms={chatRooms}
             currentChat={currentChat}
             // messages prop removed
             isLoading={isChatLoading}
             currentUser={currentUser}
             currentUserId={currentUserId}
             onSwitchChat={onSwitchChat}
             // onAddMessage prop removed
             onAddChatRoom={onAddChatRoom} // Pass down the updated onAddChatRoom
          />
        </div>
        {/* Game Lobby Area - Takes full height within Card */}
        <div className="hidden lg:flex lg:col-span-1 h-full overflow-hidden flex-col"> {/* Ensure flex column */}
          <GameLobby />
        </div>
    </Card>
  );
}
