
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
import { db } from '@/lib/firebase/config'; // Import Firestore instance
import { collection, onSnapshot, query, orderBy, Timestamp, setDoc, doc } from 'firebase/firestore';

// --- Initial Placeholder Data ---
// Removed placeholder message generation and store
// Chat rooms are still managed locally, but messages come from Firebase

// Initial Room Data (without messages)
const initialChatRoomsData: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'>[] = [
    { id: 'global', name: 'Global Chat', type: 'group', participants: ['alice', 'bob', 'charlie', 'dave', 'eve', 'frank'], avatar: 'https://picsum.photos/seed/group/40/40' },
    { id: `dm-bob-alice`, name: 'Alice', type: 'dm', participants: ['bob', 'alice'], avatar: 'https://picsum.photos/seed/alice/40/40' },
    { id: `group-chess-club`, name: 'Chess Club', type: 'group', participants: ['bob', 'alice', 'charlie'], avatar: 'https://picsum.photos/seed/chessclub/40/40' },
];


export default function Home() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'authenticated_needs_setup' | 'authenticated'>('loading');
  const router = useRouter();
  const { toast } = useToast();

  // State for chat management (rooms only)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatRoom | null>(null);
  const [isChatListLoading, setIsChatListLoading] = useState(true); // Loading state for chat room list and initial auth
  const currentUserId = 'bob'; // Simulate current user ID ('bob')
  const currentUser = 'Bob'; // Simulate the current user name

  // --- Data Initialization and Authentication Logic ---
  useEffect(() => {
    let isMounted = true;

    // Simulate fetching/setting initial chat rooms (could fetch from backend later)
     const initialRoomsWithPlaceholders = initialChatRoomsData.map(roomData => ({
        ...roomData,
        lastMessage: 'Loading...', // Placeholder last message
        lastMessageTime: Date.now() - Math.random() * 1000000 // Placeholder time for initial sort
     }));
     setChatRooms(initialRoomsWithPlaceholders.sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)));


    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate auth check delay

      const loggedIn = sessionStorage.getItem('isAuthenticated') === 'true';
      const profileComplete = sessionStorage.getItem('isProfileComplete') === 'true';

      if (!isMounted) return;

      let newAuthStatus: typeof authStatus;
      if (!loggedIn) {
          newAuthStatus = 'unauthenticated';
          setCurrentChat(null);
          // No message state to reset here
          setIsChatListLoading(true); // Reset overall loading
      } else if (!profileComplete) {
          newAuthStatus = 'authenticated_needs_setup';
          setCurrentChat(null);
      } else {
          newAuthStatus = 'authenticated';
          // If authenticated and profile is complete, set default chat
          if (!currentChat) {
            const globalChat = initialRoomsWithPlaceholders.find(room => room.id === 'global');
            if (globalChat) {
                setCurrentChat(globalChat);
                setIsChatListLoading(false); // Stop loading after setting initial chat
            } else {
                setIsChatListLoading(false);
            }
          } else {
             // If currentChat is already set (e.g., by switchChat)
             setIsChatListLoading(false); // Already authenticated and chat potentially set
          }
      }
      setAuthStatus(newAuthStatus);
    };

    checkAuth();

    return () => { isMounted = false; };
  }, []); // Run only once on mount

  // --- Firestore Listener for Last Messages ---
  useEffect(() => {
    // Listen to last message updates for all *initial* rooms
    // In a real app, you'd likely fetch rooms and then listen
    const unsubscribers = initialChatRoomsData.map(roomData => {
        const messagesCollectionRef = collection(db, 'chats', roomData.id, 'messages');
        const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'), /* limit(1) */); // Get latest message

         // Using limit(1) might be more efficient, but requires index setup.
         // This approach fetches all, then takes the latest client-side.
        return onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const lastMsgDoc = snapshot.docs[0]; // Get the most recent doc
                const lastMsgData = lastMsgDoc.data() as Omit<Message, 'id'>; // Cast to Message basic structure
                setChatRooms(prevRooms =>
                    prevRooms.map(room =>
                        room.id === roomData.id
                            ? {
                                ...room,
                                lastMessage: lastMsgData.text.length > 30 ? lastMsgData.text.substring(0, 27) + '...' : lastMsgData.text,
                                lastMessageTime: lastMsgData.createdAt ? lastMsgData.createdAt.toMillis() : Date.now(), // Use timestamp if available
                            }
                            : room
                    ).sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)) // Re-sort after update
                );
            } else {
                 // Handle case where chat has no messages yet
                 setChatRooms(prevRooms =>
                     prevRooms.map(room =>
                         room.id === roomData.id
                             ? { ...room, lastMessage: 'No messages yet', lastMessageTime: room.lastMessageTime ?? 0 } // Keep original time or 0 if never set
                             : room
                     ).sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0))
                 );
            }
        }, (error) => {
            console.error(`Error listening to last message for ${roomData.id}: `, error);
            // Optionally show a toast or indicator
        });
    });

    // Cleanup all listeners on unmount
    return () => {
        unsubscribers.forEach(unsub => unsub());
    };
  }, []); // Run only once after initial mount


   const handleLoginSuccess = () => {
       sessionStorage.setItem('isAuthenticated', 'true');
       sessionStorage.removeItem('isProfileComplete');
       setAuthStatus('authenticated_needs_setup');
       setCurrentChat(null);
   };

    const handleProfileSetupComplete = () => {
        sessionStorage.setItem('isProfileComplete', 'true');
        setAuthStatus('authenticated');
        const defaultChat = chatRooms.find(room => room.id === 'global'); // Find from current state
        if (defaultChat) {
            setCurrentChat(defaultChat);
            setIsChatListLoading(false); // Stop loading after setup complete
        } else {
            setIsChatListLoading(false);
        }
        router.replace('/');
    };

   const handleLogout = () => {
       sessionStorage.removeItem('isAuthenticated');
       sessionStorage.removeItem('isProfileComplete');
       setAuthStatus('unauthenticated');
       setCurrentChat(null);
       setIsChatListLoading(true); // Reset loading
       // Optionally reset chat rooms if they shouldn't persist after logout
        // const initialRoomsWithPlaceholders = initialChatRoomsData.map(roomData => ({
        //     ...roomData, lastMessage: 'Loading...', lastMessageTime: Date.now()
        // }));
        // setChatRooms(initialRoomsWithPlaceholders);
   };

   // --- Chat Management Logic ---
    const handleSwitchChat = useCallback(async (chatId: string, newChatDetails?: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'>) => {
        if (authStatus === 'authenticated_needs_setup' || chatId === currentChat?.id || chatId === 'loading') return;

        let targetChat = chatRooms.find(room => room.id === chatId);

        if (!targetChat && newChatDetails) {
             // Add new room optimistically
             const roomToAdd: ChatRoom = {
                 ...newChatDetails,
                 lastMessage: 'Chat created', // Initial placeholder
                 lastMessageTime: Date.now()
             };
             targetChat = roomToAdd;

             setChatRooms(prev => {
                if (prev.some(room => room.id === roomToAdd.id)) return prev; // Avoid duplicates
                 const updatedRooms = [...prev, roomToAdd].sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0));
                 return updatedRooms;
             });

             toast({ title: "Chat Created", description: `Started chat with ${newChatDetails.name}` });

             // Create the chat document in Firestore
             try {
                const chatDocRef = doc(db, 'chats', newChatDetails.id);
                await setDoc(chatDocRef, {
                    participants: newChatDetails.participants,
                    type: newChatDetails.type,
                    name: newChatDetails.name,
                    // Add other relevant fields if needed
                });
                console.log(`Firestore document created for chat: ${newChatDetails.id}`);
             } catch (error) {
                 console.error("Error creating Firestore chat document:", error);
                 toast({ variant: "destructive", title: "Chat Creation Failed", description: "Could not save chat details." });
                 // Optionally revert optimistic update
                 setChatRooms(prev => prev.filter(room => room.id !== roomToAdd.id));
                 return; // Prevent switching to the failed chat
             }

        } else if (!targetChat) {
            toast({ variant: "destructive", title: "Chat Not Found" });
            return;
        }

        console.log(`Switching to chat: ${targetChat.name} (ID: ${chatId})`);

        // Set current chat - message loading is handled within Chat component's useEffect
        setCurrentChat(targetChat);

    }, [authStatus, currentChat?.id, chatRooms, toast]);


    // Function to add a new chat room (called from Chat component's sheet)
    const addChatRoom = async (newRoomData: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'>) => {
        const newRoom: ChatRoom = {
            ...newRoomData,
            lastMessage: 'Chat created',
            lastMessageTime: Date.now()
        };

        // Optimistic update
        let roomAlreadyExists = false;
        setChatRooms(prev => {
            if (prev.some(room => room.id === newRoom.id)) {
                roomAlreadyExists = true;
                return prev; // Don't add if it exists
            }
             const updatedRooms = [...prev, newRoom].sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0));
             return updatedRooms;
        });

        if (roomAlreadyExists) {
             handleSwitchChat(newRoom.id); // Just switch if it existed
             return;
        }

        // Create Firestore document for the chat room
         try {
            const chatDocRef = doc(db, 'chats', newRoom.id);
            await setDoc(chatDocRef, {
                participants: newRoom.participants,
                type: newRoom.type,
                name: newRoom.name,
                createdAt: serverTimestamp(), // Add creation timestamp
            });
            console.log(`Firestore document created for chat: ${newRoom.id}`);
             // Switch to the newly created room after state update and Firestore success
             handleSwitchChat(newRoom.id);
         } catch (error) {
             console.error("Error creating Firestore chat document:", error);
             toast({ variant: "destructive", title: "Chat Creation Failed", description: "Could not save chat details." });
             // Revert optimistic update on error
             setChatRooms(prev => prev.filter(room => room.id !== newRoom.id));
         }
    };


   // --- Rendering Logic ---
   if (authStatus === 'loading' || isChatListLoading && authStatus === 'authenticated') { // Show loading if auth is loading OR chat list is loading while authenticated
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
     <div className="flex flex-col flex-1 h-full overflow-hidden">
       {/* Use a wrapper div to contain main content and FAB, allowing main to scroll independently */}
       <div className="flex-1 flex overflow-hidden relative">
          <main className="flex-1 p-2 md:p-3 overflow-hidden">
             <AppLayout
                 chatRooms={chatRooms}
                 currentChat={currentChat}
                 // messages prop removed
                 isChatLoading={isChatListLoading} // Pass overall loading state
                 currentUser={currentUser}
                 currentUserId={currentUserId}
                 onSwitchChat={handleSwitchChat}
                 // onAddMessage prop removed
                 onAddChatRoom={addChatRoom}
              />
           </main>
           {/* FAB Container - Absolutely positioned within the relative parent */}
           <div className="absolute inset-0 pointer-events-none">
                <BottomNavigation
                    onLogout={handleLogout}
                    chatRooms={chatRooms}
                    onSwitchChat={handleSwitchChat}
                    initialSnapPosition="top-right" // Set default position
                />
           </div>
       </div>
       <Toaster /> {/* Keep Toaster outside the main content scrolling area */}
     </div>
   );
}
