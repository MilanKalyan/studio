
'use client'; // Mark as client component for authentication checks

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from './auth/login/page'; // Import the Login page
import Loading from './loading'; // Import the Loading component
import { BottomNavigation } from '@/components/bottom-navigation'; // Import BottomNavigation
import { AppLayout } from '@/components/app-layout'; // Import the main App Layout
import SetupProfilePage from './auth/setup-profile/page'; // Import Setup Profile page
import type { ChatRoom, Message } from '@/components/chat'; // Import types
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Placeholder initial messages and chat rooms (moved logic here)
const placeholderMessages: { [key: string]: Message[] } = {
    global: [
        { id: '1', sender: 'Alice', text: 'Hey Bob!', timestamp: Date.now() - 600000, avatar: 'https://picsum.photos/seed/alice/40/40' },
        { id: '2', sender: 'Bob', text: 'Hi Alice! What\'s up?', timestamp: Date.now() - 540000, avatar: 'https://picsum.photos/seed/bob/40/40' },
        { id: '3', sender: 'Alice', text: 'Not much, just checking out Kinect. Pretty cool!', timestamp: Date.now() - 480000, avatar: 'https://picsum.photos/seed/alice/40/40' },
        { id: '4', sender: 'Alice', text: 'Wanna play Tic Tac Toe later?', timestamp: Date.now() - 470000, avatar: 'https://picsum.photos/seed/alice/40/40' },
        { id: '5', sender: 'Bob', text: 'Sure, sounds fun! I\'m up for a game.', timestamp: Date.now() - 420000, avatar: 'https://picsum.photos/seed/bob/40/40' },
        { id: '6', sender: 'Alice', text: 'Great! Maybe around 8 PM?', timestamp: Date.now() - 360000, avatar: 'https://picsum.photos/seed/alice/40/40' },
        { id: '7', sender: 'Bob', text: 'Works for me. Setting up the lobby then!', timestamp: Date.now() - 300000, avatar: 'https://picsum.photos/seed/bob/40/40' },
        { id: '8', sender: 'Alice', text: 'Awesome! See you then. 😄', timestamp: Date.now() - 295000, avatar: 'https://picsum.photos/seed/alice/40/40' },
        { id: '9', sender: 'Charlie', text: 'Hey everyone, what are we talking about?', timestamp: Date.now() - 180000, avatar: 'https://picsum.photos/seed/charlie/40/40' },
        { id: '10', sender: 'Bob', text: 'Hey Charlie! Just planning a Tic Tac Toe game with Alice later.', timestamp: Date.now() - 120000, avatar: 'https://picsum.photos/seed/bob/40/40' },
        { id: '11', sender: 'Charlie', text: 'Oh nice! Mind if I join? 👀', timestamp: Date.now() - 60000, avatar: 'https://picsum.photos/seed/charlie/40/40' },
        { id: '12', sender: 'Alice', text: 'The more the merrier! But Tic Tac Toe is only 2 players... maybe Chess?', timestamp: Date.now() - 30000, avatar: 'https://picsum.photos/seed/alice/40/40' },
        { id: '13', sender: 'Bob', text: 'Chess works! Let\'s do that.', timestamp: Date.now() - 10000, avatar: 'https://picsum.photos/seed/bob/40/40' },
        { id: '14', sender: 'Charlie', text: 'Perfect! I\'ll bring my A-game. ♟️', timestamp: Date.now(), avatar: 'https://picsum.photos/seed/charlie/40/40' },
    ],
    // Add more placeholder messages for other chats if needed
};

const globalChat: ChatRoom = {
    id: 'global',
    name: 'Global Chat',
    type: 'group',
    participants: ['alice', 'bob', 'charlie', 'dave', 'eve', 'frank'], // Everyone initially
    avatar: 'https://picsum.photos/seed/group/40/40',
    lastMessage: placeholderMessages.global[placeholderMessages.global.length - 1]?.text ?? 'No messages yet',
    lastMessageTime: placeholderMessages.global[placeholderMessages.global.length - 1]?.timestamp ?? Date.now(),
};

const initialChatRooms: ChatRoom[] = [
    globalChat,
    { id: `dm-alice-bob`, name: 'Alice', type: 'dm', participants: ['bob', 'alice'], avatar: 'https://picsum.photos/seed/alice/40/40', lastMessage: 'Awesome! See you then. 😄', lastMessageTime: Date.now() - 300000 },
    { id: `group-chess-club`, name: 'Chess Club', type: 'group', participants: ['bob', 'alice', 'charlie'], avatar: 'https://picsum.photos/seed/chessclub/40/40', lastMessage: 'Bob: Chess works! Let\'s do that.', lastMessageTime: Date.now() - 15000 },
];


export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null initially, then boolean
  const [needsProfileSetup, setNeedsProfileSetup] = useState<boolean>(false); // Check if profile setup is needed
  const router = useRouter();
  const { toast } = useToast(); // Use toast hook

  // State for chat management lifted from Chat component
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(initialChatRooms); // Initialize with demo data
  const [currentChat, setCurrentChat] = useState<ChatRoom | null>(null); // Current active chat room
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]); // Messages for the current chat
  const [isChatLoading, setIsChatLoading] = useState(true); // Loading state for chat messages
  const currentUserId = 'bob'; // Simulate current user ID
  const currentUser = 'Bob'; // Simulate the current user name

  // --- Authentication Logic ---
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const loggedIn = sessionStorage.getItem('isAuthenticated') === 'true';
      const profileComplete = sessionStorage.getItem('isProfileComplete') === 'true';

      if (isMounted) {
        setIsAuthenticated(loggedIn);
        setNeedsProfileSetup(loggedIn && !profileComplete);
        if (loggedIn && profileComplete && !currentChat) {
            // Set default chat to global chat after login and profile setup
            setCurrentChat(globalChat);
            setIsChatLoading(false);
            setCurrentMessages(placeholderMessages[globalChat.id] || []);
        } else if (!loggedIn) {
             // Reset chat state on logout
             setCurrentChat(null);
             setChatRooms(initialChatRooms); // Reset to initial rooms
             setCurrentMessages([]);
             setIsChatLoading(true);
        }
      }
    };

    checkAuth();

    return () => { isMounted = false; };
  }, [currentChat]); // Re-check or set default chat based on auth state

   const handleLoginSuccess = () => {
       sessionStorage.setItem('isAuthenticated', 'true');
       sessionStorage.removeItem('isProfileComplete');
       setIsAuthenticated(true);
       setNeedsProfileSetup(true);
   };

    const handleProfileSetupComplete = () => {
        sessionStorage.setItem('isProfileComplete', 'true');
        setNeedsProfileSetup(false);
        // Set default chat after profile setup
        setCurrentChat(globalChat);
        setIsChatLoading(false);
        setCurrentMessages(placeholderMessages[globalChat.id] || []);
        router.replace('/'); // Navigate to the main app view
    };

   const handleLogout = () => {
       sessionStorage.removeItem('isAuthenticated');
       sessionStorage.removeItem('isProfileComplete');
       setIsAuthenticated(false);
       setNeedsProfileSetup(false);
       setCurrentChat(null); // Reset chat state
       setIsChatLoading(true);
       setCurrentMessages([]);
   };

   // --- Chat Management Logic (Lifted from Chat.tsx) ---
    const handleSwitchChat = useCallback((chatId: string, newChatDetails?: ChatRoom) => {
        if (!isAuthenticated || needsProfileSetup || chatId === currentChat?.id || chatId === 'loading') return;

        let targetChat = chatRooms.find(room => room.id === chatId);

        // If trying to switch to a chat that doesn't exist (e.g., new DM via MySpace)
        if (!targetChat && newChatDetails) {
            targetChat = newChatDetails;
            setChatRooms(prev => {
                // Check if already added by another process (prevent duplicates)
                if (prev.some(room => room.id === newChatDetails.id)) {
                    return prev;
                }
                return [...prev, newChatDetails];
            });
            toast({ title: "Chat Created", description: `Started chat with ${newChatDetails.name}` });
        } else if (!targetChat) {
            toast({ variant: "destructive", title: "Chat Not Found" });
            return;
        }

        console.log(`Switching to chat: ${targetChat.name} (ID: ${chatId})`);

        setIsChatLoading(true);
        setCurrentChat({ id: 'loading', name: 'Loading...', type: 'group', participants: [] }); // Temp loading state
        setCurrentMessages([]); // Clear previous messages

        // Simulate fetching messages for the new chat
        setTimeout(() => {
            setCurrentChat(targetChat as ChatRoom); // Assert targetChat is not null/undefined here
            // Load placeholder messages or empty array
            setCurrentMessages(placeholderMessages[chatId] || []);
            setIsChatLoading(false);
             // Scroll handled within Chat component's useEffect
        }, 500);
    }, [isAuthenticated, needsProfileSetup, currentChat?.id, chatRooms, toast]);

    // Function to add a new message (called from Chat component)
     const addMessage = (newMessage: Message) => {
        if (currentChat && currentChat.id !== 'loading') {
            // Update placeholderMessages for simulation
            if (!placeholderMessages[currentChat.id]) {
                placeholderMessages[currentChat.id] = [];
            }
            placeholderMessages[currentChat.id].push(newMessage);

            // Update component state
            setCurrentMessages(prev => [...prev, newMessage]);

            // Update the last message in the chatRooms state
             setChatRooms(prevRooms =>
               prevRooms.map(room =>
                 room.id === currentChat.id
                   ? {
                       ...room,
                       lastMessage: newMessage.text,
                       lastMessageTime: newMessage.timestamp,
                     }
                   : room
               )
             );
        }
    };

    // Function to add a new chat room (called from Chat component's sheet)
    const addChatRoom = (newRoom: ChatRoom) => {
        setChatRooms(prev => {
            if (prev.some(room => room.id === newRoom.id)) {
                // If room already exists (e.g., DM), don't add again
                handleSwitchChat(newRoom.id); // Just switch to it
                return prev;
            }
            return [...prev, newRoom];
        });
        handleSwitchChat(newRoom.id); // Switch to the newly created room
    };


   // --- Rendering Logic ---
   if (isAuthenticated === null) {
     return <Loading />;
   }

   if (!isAuthenticated) {
     return <LoginPage onLoginSuccess={handleLoginSuccess} />;
   }

   if (needsProfileSetup) {
     return (
       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
         <SetupProfilePage onSetupComplete={handleProfileSetupComplete} />
       </div>
     );
   }

   // Render main app layout
   return (
     <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/10">
       <main className="flex-1 p-2 md:p-4 overflow-hidden relative pb-20"> {/* Keep padding-bottom */}
         {/* Pass chat state and handlers to AppLayout */}
         <AppLayout
             chatRooms={chatRooms}
             currentChat={currentChat}
             messages={currentMessages}
             isChatLoading={isChatLoading}
             currentUser={currentUser}
             currentUserId={currentUserId}
             onSwitchChat={handleSwitchChat}
             onAddMessage={addMessage}
             onAddChatRoom={addChatRoom}
          />
       </main>
       {/* Pass necessary props to BottomNavigation */}
       <BottomNavigation
            onLogout={handleLogout}
            chatRooms={chatRooms} // Pass chatRooms for MySpace
            onSwitchChat={handleSwitchChat} // Pass switch function for MySpace
       />
     </div>
   );
}
