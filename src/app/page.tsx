
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
import { cn } from '@/lib/utils';

// --- Initial Placeholder Data ---
// Moved placeholder data generation inside useEffect or fetch simulation
// This prevents hydration issues caused by Date.now() differences between server/client

const globalChatRoomDetails: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'> = {
    id: 'global',
    name: 'Global Chat',
    type: 'group',
    participants: ['alice', 'bob', 'charlie', 'dave', 'eve', 'frank'], // Everyone initially
    avatar: 'https://picsum.photos/seed/group/40/40',
};

// Function to generate placeholder messages (avoids Date.now() at top level)
const generatePlaceholderMessages = (): { [key: string]: Message[] } => {
    const now = Date.now();
    return {
        global: [
            { id: '1', sender: 'Alice', text: 'Hey Bob!', timestamp: now - 600000, avatar: 'https://picsum.photos/seed/alice/40/40' },
            { id: '2', sender: 'Bob', text: 'Hi Alice! What\'s up?', timestamp: now - 540000, avatar: 'https://picsum.photos/seed/bob/40/40' },
            { id: '3', sender: 'Alice', text: 'Not much, just checking out Kinect. Pretty cool!', timestamp: now - 480000, avatar: 'https://picsum.photos/seed/alice/40/40' },
            { id: '4', sender: 'Alice', text: 'Wanna play Tic Tac Toe later?', timestamp: now - 470000, avatar: 'https://picsum.photos/seed/alice/40/40' },
            { id: '5', sender: 'Bob', text: 'Sure, sounds fun! I\'m up for a game.', timestamp: now - 420000, avatar: 'https://picsum.photos/seed/bob/40/40' },
            { id: '6', sender: 'Alice', text: 'Great! Maybe around 8 PM?', timestamp: now - 360000, avatar: 'https://picsum.photos/seed/alice/40/40' },
            { id: '7', sender: 'Bob', text: 'Works for me. Setting up the lobby then!', timestamp: now - 300000, avatar: 'https://picsum.photos/seed/bob/40/40' },
            { id: '8', sender: 'Alice', text: 'Awesome! See you then. 😄', timestamp: now - 295000, avatar: 'https://picsum.photos/seed/alice/40/40' },
            { id: '9', sender: 'Charlie', text: 'Hey everyone, what are we talking about?', timestamp: now - 180000, avatar: 'https://picsum.photos/seed/charlie/40/40' },
            { id: '10', sender: 'Bob', text: 'Hey Charlie! Just planning a Tic Tac Toe game with Alice later.', timestamp: now - 120000, avatar: 'https://picsum.photos/seed/bob/40/40' },
            { id: '11', sender: 'Charlie', text: 'Oh nice! Mind if I join? 👀', timestamp: now - 60000, avatar: 'https://picsum.photos/seed/charlie/40/40' },
            { id: '12', sender: 'Alice', text: 'The more the merrier! But Tic Tac Toe is only 2 players... maybe Chess?', timestamp: now - 30000, avatar: 'https://picsum.photos/seed/alice/40/40' },
            { id: '13', sender: 'Bob', text: 'Chess works! Let\'s do that.', timestamp: now - 10000, avatar: 'https://picsum.photos/seed/bob/40/40' },
            { id: '14', sender: 'Charlie', text: 'Perfect! I\'ll bring my A-game. ♟️', timestamp: now, avatar: 'https://picsum.photos/seed/charlie/40/40' },
        ],
        // Placeholder for DM (will be populated dynamically)
        'dm-bob-alice': [
            { id: 'dm1', sender: 'Bob', text: 'Hey Alice, quick question about the Chess game later.', timestamp: now - 310000, avatar: 'https://picsum.photos/seed/bob/40/40' },
            { id: 'dm2', sender: 'Alice', text: 'Sure, what\'s up?', timestamp: now - 305000, avatar: 'https://picsum.photos/seed/alice/40/40' },
            { id: 'dm3', sender: 'Bob', text: 'Just confirming 8 PM still works?', timestamp: now - 300000, avatar: 'https://picsum.photos/seed/bob/40/40' },
            { id: 'dm4', sender: 'Alice', text: 'Yep, still good!', timestamp: now - 298000, avatar: 'https://picsum.photos/seed/alice/40/40' },
        ]
        // Add more placeholder messages for other chats if needed
    };
};

// Function to generate initial chat rooms (using generated messages)
const generateInitialChatRooms = (messages: { [key: string]: Message[] }): ChatRoom[] => {
    const globalMessages = messages['global'] || [];
    const dmBobAliceMessages = messages['dm-bob-alice'] || [];

    const globalChat: ChatRoom = {
        ...globalChatRoomDetails,
        lastMessage: globalMessages[globalMessages.length - 1]?.text ?? 'No messages yet',
        lastMessageTime: globalMessages[globalMessages.length - 1]?.timestamp ?? Date.now(), // Use Date.now() as fallback only if no messages
    };

    const initialRooms = [
        globalChat,
        { id: `dm-bob-alice`, name: 'Alice', type: 'dm', participants: ['bob', 'alice'], avatar: 'https://picsum.photos/seed/alice/40/40', lastMessage: dmBobAliceMessages[dmBobAliceMessages.length - 1]?.text ?? 'Started chat', lastMessageTime: dmBobAliceMessages[dmBobAliceMessages.length - 1]?.timestamp ?? (Date.now() - 298000) },
        { id: `group-chess-club`, name: 'Chess Club', type: 'group', participants: ['bob', 'alice', 'charlie'], avatar: 'https://picsum.photos/seed/chessclub/40/40', lastMessage: 'Bob: Chess works! Let\'s do that.', lastMessageTime: Date.now() - 15000 }, // Keep this simple for now
    ];
    return initialRooms;
}

// Store placeholder messages globally within the component's scope
// This object will be mutated by addMessage for simulation purposes
let placeholderMessagesStore: { [key: string]: Message[] } = {};


export default function Home() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'authenticated_needs_setup' | 'authenticated'>('loading');
  const router = useRouter();
  const { toast } = useToast();

  // State for chat management
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatRoom | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(true); // Loading state specifically for chat messages
  const currentUserId = 'bob'; // Simulate current user ID ('bob')
  const currentUser = 'Bob'; // Simulate the current user name

  // --- Data Initialization and Authentication Logic ---
  useEffect(() => {
    let isMounted = true;

    // Initialize placeholder data only once on mount
    if (Object.keys(placeholderMessagesStore).length === 0) {
        placeholderMessagesStore = generatePlaceholderMessages();
    }
     const initialRooms = generateInitialChatRooms(placeholderMessagesStore);
     setChatRooms(initialRooms); // Set initial rooms

    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate auth check delay

      const loggedIn = sessionStorage.getItem('isAuthenticated') === 'true';
      const profileComplete = sessionStorage.getItem('isProfileComplete') === 'true';

      if (!isMounted) return;

      let newAuthStatus: typeof authStatus;
      if (!loggedIn) {
          newAuthStatus = 'unauthenticated';
          // Reset chat state on logout or initial unauthenticated state
          setCurrentChat(null);
          setCurrentMessages([]);
          setIsChatLoading(true); // Reset loading state for chat
      } else if (!profileComplete) {
          newAuthStatus = 'authenticated_needs_setup';
          setCurrentChat(null); // No chat during setup
          setCurrentMessages([]);
      } else {
          newAuthStatus = 'authenticated';
          // If authenticated and profile is complete, set default chat
          // Check if currentChat is already set (e.g., by switchChat)
          if (!currentChat) {
            const globalChat = initialRooms.find(room => room.id === 'global');
            if (globalChat) {
                setCurrentChat(globalChat);
                setCurrentMessages(placeholderMessagesStore[globalChat.id] || []);
                setIsChatLoading(false);
            } else {
                setIsChatLoading(false); // No global chat found, stop loading
            }
          } else {
             // If currentChat is already set, ensure messages are loaded
             setCurrentMessages(placeholderMessagesStore[currentChat.id] || []);
             setIsChatLoading(false);
          }
      }
      setAuthStatus(newAuthStatus);
    };

    checkAuth();

    return () => { isMounted = false; };
    // Ensure currentChat is a dependency to re-evaluate default chat setting if needed
  }, [currentChat]);

   const handleLoginSuccess = () => {
       sessionStorage.setItem('isAuthenticated', 'true');
       sessionStorage.removeItem('isProfileComplete'); // Ensure setup is required
       setAuthStatus('authenticated_needs_setup'); // Move to setup state
       // Reset any lingering chat state
       setCurrentChat(null);
       setCurrentMessages([]);
   };

    const handleProfileSetupComplete = () => {
        sessionStorage.setItem('isProfileComplete', 'true');
        setAuthStatus('authenticated'); // Move to authenticated state
        // Explicitly set the default chat *after* setup is complete
        const defaultChat = chatRooms.find(room => room.id === 'global');
        if (defaultChat) {
            setCurrentChat(defaultChat);
            setCurrentMessages(placeholderMessagesStore[defaultChat.id] || []);
            setIsChatLoading(false);
        } else {
            setIsChatLoading(false); // Still finish loading even if no default
        }
        router.replace('/'); // Ensure navigation to the main app view
    };

   const handleLogout = () => {
       sessionStorage.removeItem('isAuthenticated');
       sessionStorage.removeItem('isProfileComplete');
       setAuthStatus('unauthenticated'); // Change state to trigger re-render
       // Reset chat state explicitly
       setCurrentChat(null);
       setCurrentMessages([]);
       setIsChatLoading(true);
       // Optionally reset chat rooms if they shouldn't persist after logout
       // setChatRooms(generateInitialChatRooms(placeholderMessagesStore));
   };

   // --- Chat Management Logic (Lifted from Chat.tsx) ---
    const handleSwitchChat = useCallback((chatId: string, newChatDetails?: ChatRoom) => {
        // Allow switching even if authenticated state is still resolving, but not during setup
        if (authStatus === 'authenticated_needs_setup' || chatId === currentChat?.id || chatId === 'loading') return;

        let targetChat = chatRooms.find(room => room.id === chatId);

        // If trying to switch to a chat that doesn't exist (e.g., new DM via MySpace)
        if (!targetChat && newChatDetails) {
            targetChat = newChatDetails;
            // Add to chatRooms state if not already present
            setChatRooms(prev => {
                if (prev.some(room => room.id === newChatDetails.id)) return prev;
                return [...prev, newChatDetails];
            });
            // Add empty messages array for new chat in the store
            if (!placeholderMessagesStore[newChatDetails.id]) {
                placeholderMessagesStore[newChatDetails.id] = [];
            }
            toast({ title: "Chat Created", description: `Started chat with ${newChatDetails.name}` });
        } else if (!targetChat) {
            toast({ variant: "destructive", title: "Chat Not Found" });
            return;
        }

        console.log(`Switching to chat: ${targetChat.name} (ID: ${chatId})`);

        setIsChatLoading(true);
        // Use a temporary loading state for currentChat to indicate change
        setCurrentChat({ id: 'loading', name: 'Loading...', type: 'group', participants: [] });
        setCurrentMessages([]); // Clear previous messages immediately

        // Simulate fetching messages for the new chat
        setTimeout(() => {
            setCurrentChat(targetChat as ChatRoom); // Assert targetChat is not null/undefined here
            // Load placeholder messages or empty array from the store
            setCurrentMessages(placeholderMessagesStore[chatId] || []);
            setIsChatLoading(false);
             // Scroll handled within Chat component's useEffect
        }, 300); // Faster switch simulation
    }, [authStatus, currentChat?.id, chatRooms, toast]);

    // Function to add a new message (called from Chat component)
     const addMessage = (newMessage: Message) => {
        if (currentChat && currentChat.id !== 'loading') {
            const chatId = currentChat.id;
            // Update placeholderMessagesStore for simulation
            if (!placeholderMessagesStore[chatId]) {
                placeholderMessagesStore[chatId] = [];
            }
            placeholderMessagesStore[chatId].push(newMessage);

            // Update component state only if the message belongs to the currently viewed chat
             setCurrentMessages(prev => [...prev, newMessage]);


            // Update the last message in the chatRooms state
             setChatRooms(prevRooms =>
               prevRooms.map(room =>
                 room.id === chatId
                   ? {
                       ...room,
                       lastMessage: newMessage.text.length > 30 ? newMessage.text.substring(0, 27) + '...' : newMessage.text, // Truncate long messages
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
             // Add empty message array for the new room in placeholder data store
             if (!placeholderMessagesStore[newRoom.id]) {
                placeholderMessagesStore[newRoom.id] = [];
            }
             // Add the new room and sort immediately for consistent order
             const updatedRooms = [...prev, newRoom].sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0));
             return updatedRooms;
        });
        // Switch to the newly created room after state update
        handleSwitchChat(newRoom.id);
    };


   // --- Rendering Logic ---
   if (authStatus === 'loading') {
     return <Loading />;
   }

   if (authStatus === 'unauthenticated') {
     return <LoginPage onLoginSuccess={handleLoginSuccess} />;
   }

   if (authStatus === 'authenticated_needs_setup') {
     return (
       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
         <SetupProfilePage onSetupComplete={handleProfileSetupComplete} />
       </div>
     );
   }

   // Authenticated User - Render main app layout
   return (
     // Adjusted padding and ensure flex column structure
     <div className="flex flex-col flex-1 h-full overflow-hidden">
       {/* Main content area with AppLayout, ensure it fills height */}
       <main className="flex-1 p-2 md:p-3 overflow-hidden relative"> {/* Reduced padding slightly */}
         <AppLayout
             chatRooms={chatRooms}
             currentChat={currentChat}
             messages={currentMessages}
             isChatLoading={isChatLoading}
             currentUser={currentUser}
             currentUserId={currentUserId}
             onSwitchChat={handleSwitchChat}
             onAddMessage={addMessage}
             onAddChatRoom={addChatRoom} // Pass the handler here
          />
       </main>
       {/* Bottom Navigation FAB */}
       <BottomNavigation
            onLogout={handleLogout}
            chatRooms={chatRooms}
            onSwitchChat={handleSwitchChat}
            // initialSnapPosition="top-right" // Set default position
       />
     </div>
   );
}
