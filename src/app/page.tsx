
'use client'; // Mark as client component for authentication checks

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from './auth/login/page'; // Import the Login page
import Loading from './loading'; // Import the Loading component
import { BottomNavigation } from '@/components/bottom-navigation'; // Import BottomNavigation
import { AppLayout } from '@/components/app-layout'; // Import the main App Layout
import SetupProfilePage from './auth/setup-profile/page'; // Import Setup Profile page
import type { ChatRoom, Message, Player } from '@/components/chat'; // Import types
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { Toaster } from '@/components/ui/toaster'; // Import Toaster component
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase/config'; // Import Firestore instance
import { collection, onSnapshot, query, orderBy, Timestamp, setDoc, doc, serverTimestamp } from 'firebase/firestore'; // Added serverTimestamp

// --- Initial Placeholder Data ---
// Removed placeholder message generation and store
// Chat rooms are still managed locally, but messages come from Firebase

// Initial Room Data (without messages)
const initialChatRoomsData: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'>[] = [
    { id: 'global', name: 'Global Chat', type: 'group', participants: ['bob', 'alice', 'charlie', 'dave', 'eve', 'frank'], avatar: 'https://picsum.photos/seed/group/40/40' },
    { id: `dm-bob-alice`, name: 'Alice', type: 'dm', participants: ['bob', 'alice'], avatar: 'https://picsum.photos/seed/alice/40/40' },
    { id: `group-chess-club`, name: 'Chess Club', type: 'group', participants: ['bob', 'alice', 'charlie'], avatar: 'https://picsum.photos/seed/chessclub/40/40' },
];

// Consistent placeholder friends data including Bob
const placeholderFriendsData: Player[] = [
     { id: 'bob', name: 'Bob', avatar: 'https://picsum.photos/seed/bob/40/40', status: 'online', kinectId: 'KINECT#BOBSID'}, // Current User
     { id: 'alice', name: 'Alice', avatar: 'https://picsum.photos/seed/alice/40/40', status: 'online', kinectId: 'KINECT#1234'},
     { id: 'charlie', name: 'Charlie', avatar: 'https://picsum.photos/seed/charlie/40/40', status: 'offline', kinectId: 'KINECT#5678'},
     { id: 'dave', name: 'Dave', avatar: 'https://picsum.photos/seed/dave/40/40', status: 'ingame', kinectId: 'KINECT#9012'},
     { id: 'eve', name: 'Eve', avatar: 'https://picsum.photos/seed/eve/40/40', status: 'online', kinectId: 'KINECT#3456'},
     { id: 'frank', name: 'Frank', avatar: 'https://picsum.photos/seed/frank/40/40', status: 'offline', kinectId: 'KINECT#7890'},
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
  const currentUser = placeholderFriendsData.find(f => f.id === currentUserId)?.name || 'User'; // Use placeholder data

  // --- Data Initialization and Authentication Logic ---
  useEffect(() => {
    let isMounted = true;

    // Simulate fetching/setting initial chat rooms (could fetch from backend later)
     const initialRoomsWithPlaceholders = initialChatRoomsData.map(roomData => ({
        ...roomData,
        lastMessage: 'Loading...', // Placeholder last message
        lastMessageTime: Date.now() - Math.random() * 1000000 // Placeholder time for initial sort
     }));
     // Ensure initial state doesn't cause errors before Firebase listener updates it
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
                // Don't set loading false here, let Firestore listener do it
            } else {
                setIsChatListLoading(false); // No global chat? Stop loading
            }
          } else {
             // If currentChat is already set (e.g., by switchChat)
             // Don't set loading false here, let Firestore listener do it
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
    let initialLoadComplete = false; // Track if initial load is done

    const unsubscribers = initialChatRoomsData.map(roomData => {
        const messagesCollectionRef = collection(db, 'chats', roomData.id, 'messages');
        const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'), /* limit(1) */); // Get latest message

         // Using limit(1) might be more efficient, but requires index setup.
         // This approach fetches all, then takes the latest client-side.
        return onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const lastMsgDoc = snapshot.docs[0]; // Get the most recent doc
                const lastMsgData = lastMsgDoc.data() as Omit<Message, 'id'>; // Cast to Message basic structure
                setChatRooms(prevRooms => {
                    const updatedRooms = prevRooms.map(room =>
                        room.id === roomData.id
                            ? {
                                ...room,
                                lastMessage: lastMsgData.text.length > 30 ? lastMsgData.text.substring(0, 27) + '...' : lastMsgData.text,
                                lastMessageTime: lastMsgData.createdAt ? lastMsgData.createdAt.toMillis() : Date.now(), // Use timestamp if available
                            }
                            : room
                    ).sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)); // Re-sort after update

                    // Check if this is the last update in the initial batch
                    if (!initialLoadComplete && updatedRooms.every(room => room.lastMessage !== 'Loading...')) {
                         setIsChatListLoading(false);
                         initialLoadComplete = true;
                         console.log("Initial chat list load complete.");
                    }
                    return updatedRooms;
                 });
            } else {
                 // Handle case where chat has no messages yet
                 setChatRooms(prevRooms => {
                     const updatedRooms = prevRooms.map(room =>
                         room.id === roomData.id
                             ? { ...room, lastMessage: 'No messages yet', lastMessageTime: room.lastMessageTime ?? 0 } // Keep original time or 0 if never set
                             : room
                     ).sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0));

                    // Check if this is the last update in the initial batch
                    if (!initialLoadComplete && updatedRooms.every(room => room.lastMessage !== 'Loading...')) {
                         setIsChatListLoading(false);
                         initialLoadComplete = true;
                         console.log("Initial chat list load complete (empty chat found).");
                    }
                     return updatedRooms;
                 });
            }
        }, (error) => {
            console.error(`Error listening to last message for ${roomData.id}: `, error);
            // Optionally show a toast or indicator
             setIsChatListLoading(false); // Stop loading on error too
        });
    });

     // Fallback: If after a short delay, loading is still true, force it to false
     const loadingTimeout = setTimeout(() => {
        if (isChatListLoading && authStatus === 'authenticated') {
            console.warn("Forcing chat list loading to false after timeout.");
            setIsChatListLoading(false);
            initialLoadComplete = true; // Mark as complete to prevent future attempts
        }
     }, 5000); // 5 seconds timeout


    // Cleanup all listeners and timeout on unmount
    return () => {
        unsubscribers.forEach(unsub => unsub());
        clearTimeout(loadingTimeout);
    };
    // Depend on authStatus to re-run if user logs in/out? No, separate effect handles that.
  }, [authStatus]); // Re-run when authStatus changes to authenticated


   const handleLoginSuccess = () => {
       sessionStorage.setItem('isAuthenticated', 'true');
       sessionStorage.removeItem('isProfileComplete'); // Ensure setup runs if needed
       setAuthStatus('loading'); // Go back to loading briefly to re-check status
       setIsChatListLoading(true); // Ensure chat list reloads
       // Trigger the checkAuth logic again
       const checkAuthOnLogin = async () => {
           await new Promise(resolve => setTimeout(resolve, 100)); // Short delay
           const loggedIn = sessionStorage.getItem('isAuthenticated') === 'true';
           const profileComplete = sessionStorage.getItem('isProfileComplete') === 'true';
            if (loggedIn && !profileComplete) {
               setAuthStatus('authenticated_needs_setup');
               setCurrentChat(null);
            } else if (loggedIn && profileComplete) {
                setAuthStatus('authenticated');
                 // Setting default chat handled by the useEffect watching authStatus
            } else {
                // Should not happen, but handle fallback
                setAuthStatus('unauthenticated');
            }
       };
       checkAuthOnLogin();
   };


    const handleProfileSetupComplete = () => {
        sessionStorage.setItem('isProfileComplete', 'true');
        setAuthStatus('authenticated');
        // Setting default chat handled by the useEffect watching authStatus
        // Ensure loading is false after setup
        setIsChatListLoading(false);
        router.replace('/');
    };

   const handleLogout = () => {
       sessionStorage.removeItem('isAuthenticated');
       sessionStorage.removeItem('isProfileComplete');
       setAuthStatus('unauthenticated');
       setCurrentChat(null);
       setIsChatListLoading(true); // Reset loading
       // Reset chat rooms to initial placeholder state
        const initialRoomsWithPlaceholders = initialChatRoomsData.map(roomData => ({
            ...roomData, lastMessage: 'Loading...', lastMessageTime: Date.now()
        }));
        setChatRooms(initialRoomsWithPlaceholders.sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)));
   };

   // --- Chat Management Logic ---
    const handleSwitchChat = useCallback(async (chatId: string, newChatDetails?: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'>) => {
        // Prevent switching during setup or to the same chat or during load
        if (authStatus === 'authenticated_needs_setup' || chatId === currentChat?.id || chatId === 'loading') {
             console.log(`Switch chat blocked: authStatus=${authStatus}, currentChatId=${currentChat?.id}, targetChatId=${chatId}`);
             return;
        }

        let targetChat = chatRooms.find(room => room.id === chatId);

        if (!targetChat && newChatDetails) {
             // Add new room optimistically
             const roomToAdd: ChatRoom = {
                 ...newChatDetails,
                 lastMessage: 'Chat created', // Initial placeholder
                 lastMessageTime: Date.now()
             };
             targetChat = roomToAdd;

             // Ensure no duplicates before adding
             let roomExists = false;
             setChatRooms(prev => {
                if (prev.some(room => room.id === roomToAdd.id)) {
                    roomExists = true;
                    return prev; // Avoid duplicates
                }
                 const updatedRooms = [...prev, roomToAdd].sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0));
                 return updatedRooms;
             });

             if (roomExists) {
                 console.log(`Attempted to add existing chat: ${newChatDetails.id}. Switching instead.`);
                 // Proceed to set currentChat below with the existing room details
                  targetChat = chatRooms.find(room => room.id === chatId)!; // Re-find the existing chat
             } else {
                toast({ title: "Chat Created", description: `Started chat with ${newChatDetails.name}` });

                 // Create the chat document in Firestore *only* if it was truly new
                 try {
                    const chatDocRef = doc(db, 'chats', newChatDetails.id);
                    await setDoc(chatDocRef, {
                        participants: newChatDetails.participants,
                        type: newChatDetails.type,
                        name: newChatDetails.name,
                        createdAt: serverTimestamp(), // Add creation timestamp
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
             }

        } else if (!targetChat) {
            toast({ variant: "destructive", title: "Chat Not Found" });
            console.error(`Target chat not found and no details provided for ID: ${chatId}`);
            return;
        }

        console.log(`Switching to chat: ${targetChat.name} (ID: ${chatId})`);

        // Set current chat - message loading is handled within Chat component's useEffect
        setCurrentChat(targetChat);

    }, [authStatus, currentChat?.id, chatRooms, toast]); // Added chatRooms dependency


    // Function to add a new chat room (called from Chat component's sheet)
    // Now mostly handled by handleSwitchChat logic
    const addChatRoom = async (newRoomData: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'>) => {
        // Reuse handleSwitchChat logic - if the room exists, it switches; if not, it creates and switches.
         handleSwitchChat(newRoomData.id, newRoomData);
    };


   // --- Rendering Logic ---
   if (authStatus === 'loading') { // Simpler loading check initially
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
          {/* Conditional Loading Overlay for Chat List */}
          {isChatListLoading && <Loading className="absolute z-50" />} {/* Show overlay only when list is loading */}

          <main className={cn(
              "flex-1 p-2 md:p-3 overflow-hidden transition-opacity duration-300",
              isChatListLoading ? "opacity-50 pointer-events-none" : "opacity-100" // Fade out main content while loading list
          )}>
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
           {/* Only render BottomNavigation if not loading the chat list */}
           {!isChatListLoading && (
              <div className="absolute inset-0 pointer-events-none">
                   <BottomNavigation
                       onLogout={handleLogout}
                       chatRooms={chatRooms}
                       onSwitchChat={handleSwitchChat}
                       initialSnapPosition="top-right" // Set default position
                   />
              </div>
           )}
       </div>
       <Toaster /> {/* Keep Toaster outside the main content scrolling area */}
     </div>
   );
}

    