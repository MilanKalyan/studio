
'use client'; // Mark as client component for authentication checks

import { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
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

// Initial Room Data (without messages)
const initialChatRoomsData: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'>[] = [
    { id: 'global', name: 'Global Chat', type: 'group', participants: ['bob', 'alice', 'charlie', 'dave', 'eve', 'frank'], avatar: 'https://picsum.photos/seed/global/40/40' },
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
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Combined initial loading state
  const currentUserId = 'bob'; // Simulate current user ID ('bob')
  const currentUser = placeholderFriendsData.find(f => f.id === currentUserId)?.name || 'User'; // Use placeholder data
  const initialLoadCompleteRef = useRef(false); // Ref to track if initial load logic has finished

  // --- Data Initialization and Authentication Logic ---
  useEffect(() => {
    let isMounted = true;
    initialLoadCompleteRef.current = false; // Reset on mount/re-run

    // Simulate fetching/setting initial chat rooms (placeholders before listener updates)
     const initialRoomsWithPlaceholders = initialChatRoomsData.map(roomData => ({
        ...roomData,
        lastMessage: 'Loading...', // Placeholder last message
        lastMessageTime: Date.now() - Math.random() * 1000000 // Placeholder time for initial sort
     }));
     // Set initial rooms to avoid errors before Firebase listener updates
     setChatRooms(initialRoomsWithPlaceholders.sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)));


    const checkAuth = async () => {
      // Simulate auth check delay, slightly longer for smoother feel if needed
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!isMounted) return;

      const loggedIn = sessionStorage.getItem('isAuthenticated') === 'true';
      const profileComplete = sessionStorage.getItem('isProfileComplete') === 'true';
      let newAuthStatus: typeof authStatus;

      if (!loggedIn) {
          newAuthStatus = 'unauthenticated';
          setCurrentChat(null);
          setIsInitialLoad(false); // Stop loading if unauthenticated
      } else if (!profileComplete) {
          newAuthStatus = 'authenticated_needs_setup';
          setCurrentChat(null);
          setIsInitialLoad(false); // Stop loading during setup phase
      } else {
          newAuthStatus = 'authenticated';
          // Don't set isInitialLoad to false here; let the listener handle it
          // Select initial chat only if not already set
           if (!currentChat) {
               const globalChat = initialRoomsWithPlaceholders.find(room => room.id === 'global');
               if (globalChat) {
                   setCurrentChat(globalChat);
               }
               // Keep isInitialLoad true until listener confirms data load
           }
      }
      setAuthStatus(newAuthStatus);
    };

    checkAuth();

    return () => {
      isMounted = false;
      initialLoadCompleteRef.current = true; // Mark as complete on unmount to stop any pending updates
    };
  }, []); // Run only once on mount

  // --- Firestore Listener for Last Messages ---
  useEffect(() => {
    // Only run listener if authenticated and profile is complete
    if (authStatus !== 'authenticated') {
        // If not authenticated, ensure loading is false
        if (authStatus !== 'loading' && !initialLoadCompleteRef.current) { // Check ref to prevent race condition
           setIsInitialLoad(false);
           initialLoadCompleteRef.current = true;
        }
        return; // Exit if not authenticated
    }

    console.log("Setting up Firestore listeners for chat rooms.");

    // Use a counter to track how many listeners have loaded their initial data
    let loadedListenersCount = 0;
    const totalListeners = initialChatRoomsData.length;

    const unsubscribers = initialChatRoomsData.map(roomData => {
        const messagesCollectionRef = collection(db, 'chats', roomData.id, 'messages');
        const q = query(messagesCollectionRef, orderBy('createdAt', 'desc'), /* limit(1) */);

        return onSnapshot(q, (snapshot) => {
            if (initialLoadCompleteRef.current) return; // Stop updates if already marked complete

            let isInitialDataForThisListener = false;
            // Check if this listener has contributed to the count yet
            if (!snapshot.metadata.hasPendingWrites && loadedListenersCount < totalListeners) {
                loadedListenersCount++;
                isInitialDataForThisListener = true;
                // console.log(`Listener for ${roomData.id} initial data loaded (${loadedListenersCount}/${totalListeners}).`);
            }

            if (!snapshot.empty) {
                const lastMsgDoc = snapshot.docs[0];
                const lastMsgData = lastMsgDoc.data() as Omit<Message, 'id'>;
                setChatRooms(prevRooms => {
                    const updatedRooms = prevRooms.map(room =>
                        room.id === roomData.id
                            ? {
                                ...room,
                                lastMessage: lastMsgData.text.length > 30 ? lastMsgData.text.substring(0, 27) + '...' : lastMsgData.text,
                                lastMessageTime: lastMsgData.createdAt ? lastMsgData.createdAt.toMillis() : Date.now(),
                            }
                            : room
                    ).sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0));

                    // Only set loading false when all listeners have reported their initial state
                    if (!initialLoadCompleteRef.current && isInitialDataForThisListener && loadedListenersCount === totalListeners) {
                        console.log("All Firestore listeners loaded initial data.");
                         setIsInitialLoad(false);
                         initialLoadCompleteRef.current = true;
                    }
                    return updatedRooms;
                 });
            } else {
                 setChatRooms(prevRooms => {
                     const updatedRooms = prevRooms.map(room =>
                         room.id === roomData.id
                             ? { ...room, lastMessage: 'No messages yet', lastMessageTime: room.lastMessageTime ?? 0 }
                             : room
                     ).sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0));

                    // Only set loading false when all listeners have reported their initial state
                    if (!initialLoadCompleteRef.current && isInitialDataForThisListener && loadedListenersCount === totalListeners) {
                        console.log("All Firestore listeners loaded initial data (some empty).");
                        setIsInitialLoad(false);
                        initialLoadCompleteRef.current = true;
                    }
                     return updatedRooms;
                 });
            }
        }, (error) => {
            console.error(`Error listening to last message for ${roomData.id}: `, error);
            // Stop loading on error, maybe show a specific error state?
            if (!initialLoadCompleteRef.current) {
                loadedListenersCount++; // Count this listener as 'done' even if errored
                 if (loadedListenersCount === totalListeners) {
                     setIsInitialLoad(false);
                     initialLoadCompleteRef.current = true;
                     console.error("Finished initial load with errors.");
                 }
            }
        });
    });

     // Fallback timeout remains useful
     const loadingTimeout = setTimeout(() => {
        if (isInitialLoad && !initialLoadCompleteRef.current) {
            console.warn("Forcing initial load to false after timeout.");
            setIsInitialLoad(false);
            initialLoadCompleteRef.current = true;
        }
     }, 7000); // Slightly longer timeout


    // Cleanup all listeners and timeout on unmount or auth change
    return () => {
        console.log("Cleaning up Firestore listeners.");
        unsubscribers.forEach(unsub => unsub());
        clearTimeout(loadingTimeout);
        // Reset ref for potential future logins without full page reload
        // initialLoadCompleteRef.current = false; // Keep it true until next mount
    };
  }, [authStatus]); // Re-run when authStatus changes


   const handleLoginSuccess = () => {
       sessionStorage.setItem('isAuthenticated', 'true');
       sessionStorage.removeItem('isProfileComplete'); // Ensure setup check runs
       setAuthStatus('loading'); // Briefly show loading
       setIsInitialLoad(true); // Reset initial load state for potential data fetch
       initialLoadCompleteRef.current = false; // Reset completion ref

       // Trigger the checkAuth logic again after a short delay
       const checkAuthOnLogin = async () => {
           await new Promise(resolve => setTimeout(resolve, 150)); // Minimal delay
           const loggedIn = sessionStorage.getItem('isAuthenticated') === 'true';
           const profileComplete = sessionStorage.getItem('isProfileComplete') === 'true';
            if (!isInitialLoad && initialLoadCompleteRef.current) return; // Avoid race condition if already completed

            if (loggedIn && !profileComplete) {
               setAuthStatus('authenticated_needs_setup');
               setCurrentChat(null);
               setIsInitialLoad(false); // Stop loading for setup
               initialLoadCompleteRef.current = true;
            } else if (loggedIn && profileComplete) {
                setAuthStatus('authenticated');
                 // Listener useEffect will handle setting isInitialLoad to false
            } else {
                setAuthStatus('unauthenticated');
                 setIsInitialLoad(false); // Stop loading if somehow unauthenticated
                 initialLoadCompleteRef.current = true;
            }
       };
       checkAuthOnLogin();
   };


    const handleProfileSetupComplete = () => {
        sessionStorage.setItem('isProfileComplete', 'true');
        setAuthStatus('loading'); // Briefly show loading before transitioning to authenticated
        setIsInitialLoad(true); // Start loading sequence for authenticated state
        initialLoadCompleteRef.current = false;

        // Need to re-trigger the auth check flow
        const checkAuthOnSetupComplete = async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            setAuthStatus('authenticated');
            // Listener useEffect will handle setting isInitialLoad to false
            router.replace('/'); // Navigate after state update begins
        };
        checkAuthOnSetupComplete();
    };

   const handleLogout = () => {
       sessionStorage.removeItem('isAuthenticated');
       sessionStorage.removeItem('isProfileComplete');
       setAuthStatus('unauthenticated');
       setCurrentChat(null);
       setIsInitialLoad(true); // Reset loading state for next potential login
       initialLoadCompleteRef.current = false; // Reset completion ref
       // Reset chat rooms to initial placeholder state
        const initialRoomsWithPlaceholders = initialChatRoomsData.map(roomData => ({
            ...roomData, lastMessage: 'Loading...', lastMessageTime: Date.now()
        }));
        setChatRooms(initialRoomsWithPlaceholders.sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)));
   };

   // --- Chat Management Logic ---
    const handleSwitchChat = useCallback(async (chatId: string, newChatDetails?: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'>) => {
        // Prevent switching during setup or to the same chat or during initial load
        if (authStatus === 'authenticated_needs_setup' || chatId === currentChat?.id || isInitialLoad) {
             console.log(`Switch chat blocked: authStatus=${authStatus}, currentChatId=${currentChat?.id}, targetChatId=${chatId}, isInitialLoad=${isInitialLoad}`);
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
                     // Revert optimistic update
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

    }, [authStatus, currentChat?.id, chatRooms, toast, isInitialLoad]); // Added isInitialLoad dependency


    // Function to add a new chat room (called from Chat component's sheet)
    const addChatRoom = async (newRoomData: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'>) => {
        // Reuse handleSwitchChat logic - if the room exists, it switches; if not, it creates and switches.
         handleSwitchChat(newRoomData.id, newRoomData);
    };


   // --- Rendering Logic ---
   // Use isInitialLoad for the main loading overlay
   if (isInitialLoad && authStatus === 'loading') {
     return <Loading />; // Show loading overlay during initial auth check and data load
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
          {/* Conditional Loading Overlay (use isInitialLoad) */}
          {isInitialLoad && <Loading className="absolute z-50 opacity-100" />} {/* Use isInitialLoad */}

          <main className={cn(
              "flex-1 p-2 md:p-3 overflow-hidden transition-opacity duration-300 ease-in-out",
              isInitialLoad ? "opacity-0 pointer-events-none" : "opacity-100" // Fade in main content when loading is finished
          )}>
             <AppLayout
                 chatRooms={chatRooms}
                 currentChat={currentChat}
                 isChatLoading={isInitialLoad} // Pass overall initial load state
                 currentUser={currentUser}
                 currentUserId={currentUserId}
                 onSwitchChat={handleSwitchChat}
                 onAddChatRoom={addChatRoom}
              />
           </main>
           {/* FAB Container - Absolutely positioned within the relative parent */}
           {/* Only render BottomNavigation if not initially loading */}
           {!isInitialLoad && (
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
