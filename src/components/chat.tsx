
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendHorizonal, Users, Paperclip, Bot, Smile, Loader2, MessageSquare, PlusCircle, Search, UserCheck, Hash, User, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase/config'; // Import Firestore instance
import {
  collection,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp, // Import Timestamp type
} from 'firebase/firestore';

// Updated Message interface to include senderId and use Firestore Timestamp
export interface Message {
  id: string;
  senderId: string;
  senderName: string; // Changed from sender
  text: string;
  createdAt: Timestamp; // Use Firestore Timestamp
  avatar: string;
}

// Placeholder Player type
export interface Player {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'ingame';
    kinectId: string;
}

// Placeholder friends data (consistent with MySpaceContent)
const placeholderFriends: Player[] = [
     { id: 'bob', name: 'Bob', avatar: 'https://picsum.photos/seed/bob/40/40', status: 'online', kinectId: 'KINECT#BOBSID'}, // Current User
     { id: 'alice', name: 'Alice', avatar: 'https://picsum.photos/seed/alice/40/40', status: 'online', kinectId: 'KINECT#1234'},
     { id: 'charlie', name: 'Charlie', avatar: 'https://picsum.photos/seed/charlie/40/40', status: 'offline', kinectId: 'KINECT#5678'},
     { id: 'dave', name: 'Dave', avatar: 'https://picsum.photos/seed/dave/40/40', status: 'ingame', kinectId: 'KINECT#9012'},
     { id: 'eve', name: 'Eve', avatar: 'https://picsum.photos/seed/eve/40/40', status: 'online', kinectId: 'KINECT#3456'},
     { id: 'frank', name: 'Frank', avatar: 'https://picsum.photos/seed/frank/40/40', status: 'offline', kinectId: 'KINECT#7890'},
];

// Placeholder Chat Room type
export interface ChatRoom {
    id: string;
    name: string;
    type: 'group' | 'dm';
    avatar?: string;
    participants: string[];
    lastMessage?: string;
    lastMessageTime?: number; // Keep this for sorting in list view (can be derived from Firestore if needed)
}

// Define props for Chat component
interface ChatProps {
    chatRooms: ChatRoom[];
    currentChat: ChatRoom | null;
    isLoading: boolean; // Renamed from isChatLoading for clarity
    currentUser: string;
    currentUserId: string;
    onSwitchChat: (chatId: string, newChatDetails?: ChatRoom) => void;
    // onAddMessage is removed as messages are handled via Firebase
    onAddChatRoom: (newRoom: ChatRoom) => void;
}


export function Chat({
    chatRooms,
    currentChat,
    isLoading: isChatLoading, // Use prop name internally
    currentUser,
    currentUserId,
    onSwitchChat,
    // onAddMessage is removed
    onAddChatRoom
}: ChatProps) {
  const [newMessageText, setNewMessageText] = useState(''); // State for the input field text
  const [isSending, setIsSending] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]); // State for messages fetched from Firestore
  const [isMessagesLoading, setIsMessagesLoading] = useState(true); // Separate loading state for messages
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isAddRoomSheetOpen, setIsAddRoomSheetOpen] = useState(false);
  const [friends, setFriends] = useState<Player[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Player[]>([]);
  const [friendSearchTerm, setFriendSearchTerm] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const { toast } = useToast();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // --- Client-Side Mounting & Initial Friend Load ---
  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
        const otherFriends = placeholderFriends.filter(friend => friend.id !== currentUserId);
        setFriends(otherFriends);
        setFilteredFriends(otherFriends);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentUserId]);

  // --- Friend Search Logic ---
   useEffect(() => {
       if (!friendSearchTerm) {
           setFilteredFriends(friends);
           return;
       }
       const lowerCaseTerm = friendSearchTerm.toLowerCase();
       setFilteredFriends(
           friends.filter(friend =>
               friend.name.toLowerCase().includes(lowerCaseTerm) ||
               (friend.kinectId && friend.kinectId.toLowerCase().includes(lowerCaseTerm))
           )
       );
   }, [friendSearchTerm, friends]);

  // --- Firestore Message Fetching ---
  useEffect(() => {
    if (!currentChat || currentChat.id === 'loading') {
      setMessages([]); // Clear messages if no chat selected
      setIsMessagesLoading(false);
      return;
    }

    setIsMessagesLoading(true);
    console.log(`Subscribing to messages for chat: ${currentChat.id}`);

    const messagesCollectionRef = collection(db, 'chats', currentChat.id, 'messages');
    const q = query(messagesCollectionRef, orderBy('createdAt', 'asc')); // Order by Firestore Timestamp

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`Received snapshot for ${currentChat.id} with ${snapshot.docs.length} messages.`);
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      } as Message)); // Cast directly to Message
      setMessages(msgs);
      setIsMessagesLoading(false);
      // Scroll after messages are loaded
      scrollToBottom('instant');
    }, (error) => {
        console.error("Error fetching messages: ", error);
        toast({
            variant: "destructive",
            title: "Error Loading Messages",
            description: "Could not fetch messages for this chat.",
        });
        setIsMessagesLoading(false);
    });

    // Cleanup subscription on chat change or unmount
    return () => {
        console.log(`Unsubscribing from messages for chat: ${currentChat.id}`);
        unsubscribe();
    };

  }, [currentChat, toast]); // Dependency on currentChat


  // --- Scroll to Bottom Logic ---
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
      requestAnimationFrame(() => {
          const viewport = viewportRef.current;
          if (viewport) {
              viewport.scrollTo({ top: viewport.scrollHeight, behavior });
          }
      });
  }, []);

   // Scroll logic based on message changes
   useEffect(() => {
        if (!isMessagesLoading && messages.length > 0) {
            // If the last message is from the current user, always scroll smoothly
            if (messages[messages.length - 1]?.senderId === currentUserId) {
                scrollToBottom('smooth');
            } else {
                // If receiving a message from others, only scroll if near the bottom
                const viewport = viewportRef.current;
                if (viewport && viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 250) {
                  scrollToBottom('smooth');
                }
            }
        }
        // Scroll to top instantly if loading finishes with no messages
        else if (!isMessagesLoading && messages.length === 0 && viewportRef.current) {
            viewportRef.current.scrollTo({ top: 0, behavior: 'instant' });
       }
    // Don't depend on currentChat here to avoid double scrolls on switch
   }, [messages, currentUserId, scrollToBottom, isMessagesLoading]);


  // --- Message Sending Logic ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = newMessageText.trim();
    if (!currentChat || currentChat.id === 'loading' || !trimmedMessage || isSending) return;

    setIsSending(true);

    const currentUserAvatar = placeholderFriends.find(f => f.id === currentUserId)?.avatar || 'https://picsum.photos/seed/user/40/40'; // Reuse avatar logic

    const messageData = {
      text: trimmedMessage,
      senderId: currentUserId,
      senderName: currentUser,
      avatar: currentUserAvatar,
      createdAt: serverTimestamp(), // Use Firestore server timestamp
    };

    try {
        // Add message to the subcollection of the current chat
        const messagesCollectionRef = collection(db, 'chats', currentChat.id, 'messages');
        await addDoc(messagesCollectionRef, messageData);
        console.log(`Message sent to chat: ${currentChat.id}`);
        setNewMessageText(''); // Clear input after successful send
        // Scroll handled by useEffect watching messages
    } catch (error) {
        console.error("Error sending message: ", error);
        toast({
            variant: "destructive",
            title: "Message Failed",
            description: "Could not send your message.",
        });
    } finally {
        setIsSending(false);
    }
  };

  // --- Add Room Sheet Logic ---
   const handleFriendSelect = (friendId: string) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
   };

   const handleCreateChat = async () => {
       if (selectedFriends.length === 0) {
           toast({ variant: "destructive", title: "No Friends Selected" });
           return;
       }
       if (selectedFriends.length > 1 && !groupName.trim()) {
           toast({ variant: "destructive", title: "Group Name Required", description: "Please enter a name for the group chat." });
           return;
       }

       setIsCreatingChat(true);
       await new Promise(resolve => setTimeout(resolve, 700));

       const selectedFriendDetails = placeholderFriends.filter(f => selectedFriends.includes(f.id));
       const participantIds = [currentUserId, ...selectedFriends];
       const isGroup = selectedFriends.length > 1;

       let newChat: ChatRoom;
       if (isGroup) {
            newChat = {
                id: `group-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
                name: groupName.trim(),
                type: 'group',
                participants: participantIds,
                avatar: `https://picsum.photos/seed/${encodeURIComponent(groupName.trim().replace(/\s+/g, '-'))}/40/40`
            };
            toast({ title: "Group Chat Created", description: `Started group: ${newChat.name}` });
       } else {
           const friend = selectedFriendDetails[0];
           const existingDmId = `dm-${[currentUserId, friend.id].sort().join('-')}`;

            const existingDm = chatRooms.find(room => room.id === existingDmId);
            if (existingDm) {
                toast({ variant: "default", title: "Chat Exists", description: `Chat with ${friend.name} already exists.` });
                onSwitchChat(existingDm.id);
                setIsCreatingChat(false);
                setIsAddRoomSheetOpen(false);
                setSelectedFriends([]);
                setGroupName('');
                setFriendSearchTerm('');
                return;
            }

            newChat = {
                id: existingDmId,
                name: friend.name,
                type: 'dm',
                participants: participantIds,
                avatar: friend.avatar
            };
            toast({ title: "Direct Chat Started", description: `Chat with ${newChat.name} created.` });
       }

        onAddChatRoom(newChat); // Update chat list in parent

        // Reset form and close sheet
        setIsCreatingChat(false);
        setIsAddRoomSheetOpen(false);
        setSelectedFriends([]);
        setGroupName('');
        setFriendSearchTerm('');
   };


   // Get display details for the current chat
   const currentChatDisplay = !currentChat || currentChat.id === 'loading' ? {
       name: 'Loading...',
       avatar: undefined,
       fallback: '?',
       isOnline: false,
       isGroup: false,
       participantCount: 0,
       statusText: 'Loading chat details...'
   } : {
       name: currentChat.name,
       avatar: currentChat.avatar || undefined,
       fallback: currentChat.type === 'group' ? '#' : currentChat.name.charAt(0).toUpperCase(),
       dmFriend: currentChat.type === 'dm' ? placeholderFriends.find(f => f.id === currentChat.participants.find(p => p !== currentUserId)) : null,
       isOnline: currentChat.type === 'dm' ? placeholderFriends.find(f => f.id === currentChat.participants.find(p => p !== currentUserId))?.status === 'online' : false,
       isGroup: currentChat.type === 'group',
       participantCount: currentChat.participants.length,
       statusText: currentChat.type === 'group'
           ? `${currentChat.participants.length} Members`
           : (placeholderFriends.find(f => f.id === currentChat.participants.find(p => p !== currentUserId))?.status === 'online' ? 'Online'
             : placeholderFriends.find(f => f.id === currentChat.participants.find(p => p !== currentUserId))?.status === 'ingame' ? 'In Game'
             : 'Offline')
   };



  // --- Rendering ---
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
       <CardHeader className="flex flex-row items-center justify-between border-b border-border p-3 sm:p-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10 flex-shrink-0 transition-all duration-150 ease-in-out">
        {/* Chat Switcher Dropdown */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-auto -ml-2 focus-visible:ring-1 focus-visible:ring-ring rounded-md hover:bg-accent" disabled={!currentChat || isChatLoading}>
                    <div className="relative">
                        <Avatar className={cn(
                             "h-9 w-9 border-2 transition-colors duration-300",
                             currentChatDisplay.isOnline && currentChatDisplay.type === 'dm' ? "border-green-500/80" : "border-border/60",
                             (isChatLoading || currentChat?.id === 'loading') && "animate-pulse" // Use combined loading state
                         )}>
                            <AvatarImage src={currentChatDisplay.avatar || ''} alt={currentChatDisplay.name} />
                            <AvatarFallback className="text-sm">{currentChatDisplay.fallback}</AvatarFallback>
                        </Avatar>
                         {currentChatDisplay.isOnline && currentChatDisplay.type === 'dm' && !(isChatLoading || currentChat?.id === 'loading') && (
                            <span className="absolute bottom-[-2px] right-[-2px] block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></span>
                         )}
                          {currentChatDisplay.dmFriend?.status === 'ingame' && !(isChatLoading || currentChat?.id === 'loading') && (
                            <span className="absolute bottom-[-2px] right-[-2px] block h-3 w-3 rounded-full bg-blue-500 ring-2 ring-background"></span>
                         )}
                    </div>
                    <div className="flex flex-col items-start">
                        <CardTitle className="text-sm sm:text-base font-semibold leading-tight truncate max-w-[150px] sm:max-w-[250px]">
                            {currentChatDisplay.name}
                        </CardTitle>
                         <span className={cn(
                             "text-xs leading-tight",
                              currentChatDisplay.isOnline && currentChatDisplay.type === 'dm' ? "text-green-500" : "text-muted-foreground"
                         )}>
                             {currentChatDisplay.statusText}
                         </span>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground ml-1 shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Chats</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuGroup>
                     {chatRooms.map(room => (
                         <DropdownMenuItem
                            key={room.id}
                            onSelect={() => onSwitchChat(room.id)}
                            className={cn(
                                "flex items-center gap-2 cursor-pointer",
                                currentChat?.id === room.id && "bg-accent"
                            )}
                          >
                            {room.type === 'group' ? (
                                <Avatar className="h-5 w-5 bg-muted text-muted-foreground flex items-center justify-center rounded-sm">
                                    <Hash className="h-3 w-3" />
                                </Avatar>
                            ) : (
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={room.avatar || undefined} alt={room.name} />
                                    <AvatarFallback className="text-xs">{room.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            <span className="truncate text-sm">{room.name}</span>
                         </DropdownMenuItem>
                     ))}
                </DropdownMenuGroup>
                 <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setIsAddRoomSheetOpen(true)} className="flex items-center gap-2 cursor-pointer">
                      <PlusCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Create New Chat...</span>
                  </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

         {/* Action Buttons */}
         {isClient ? (
            <TooltipProvider delayDuration={200}>
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Sheet open={isAddRoomSheetOpen} onOpenChange={setIsAddRoomSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label="Create New Chat" className="text-muted-foreground hover:text-foreground">
                                        <PlusCircle className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                 <SheetContent side="left" className="sm:max-w-sm w-[90vw] flex flex-col p-0">
                                    <SheetHeader className="px-4 pt-4 pb-2 border-b">
                                        <SheetTitle>Create New Chat</SheetTitle>
                                        <SheetDescription>
                                            Select friends for a DM or group chat.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="px-4 pt-4">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search friends by name or ID..."
                                                className="pl-8 h-9 bg-muted/50"
                                                value={friendSearchTerm}
                                                onChange={(e) => setFriendSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                     {selectedFriends.length > 1 && (
                                        <div className="px-4 pt-4 animate-fade-in">
                                            <Label htmlFor="group-name" className="text-xs font-medium text-muted-foreground">Group Name</Label>
                                            <Input
                                                id="group-name"
                                                placeholder="Enter group chat name"
                                                value={groupName}
                                                onChange={(e) => setGroupName(e.target.value)}
                                                className="mt-1 h-9"
                                                required
                                            />
                                        </div>
                                     )}
                                     <ScrollArea className="flex-1 px-4 py-4">
                                         {filteredFriends.length === 0 && !friendSearchTerm && (
                                              <p className="text-sm text-muted-foreground text-center py-6">No other friends found.</p>
                                         )}
                                         {filteredFriends.length === 0 && friendSearchTerm && (
                                              <p className="text-sm text-muted-foreground text-center py-6">No friends matching "{friendSearchTerm}".</p>
                                         )}
                                         {filteredFriends.length > 0 && (
                                            <div className="space-y-3">
                                                {filteredFriends.map(friend => (
                                                    <div
                                                        key={friend.id}
                                                        className={cn(
                                                            "flex items-center justify-between p-2 rounded-md transition-colors duration-150 cursor-pointer hover:bg-muted/50",
                                                            selectedFriends.includes(friend.id) && "bg-muted ring-1 ring-primary/50"
                                                        )}
                                                        onClick={() => handleFriendSelect(friend.id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={friend.avatar} alt={friend.name} />
                                                                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">{friend.name}</span>
                                                                 <span className="text-xs text-muted-foreground">{friend.kinectId}</span>
                                                            </div>
                                                        </div>
                                                        <Checkbox
                                                            checked={selectedFriends.includes(friend.id)}
                                                            onCheckedChange={() => handleFriendSelect(friend.id)}
                                                            aria-label={`Select ${friend.name}`}
                                                            className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                         )}
                                    </ScrollArea>
                                    <SheetFooter className="px-4 pb-4 pt-2 border-t bg-background/95 backdrop-blur-sm">
                                         <SheetClose asChild>
                                             <Button variant="outline" className="flex-1 sm:flex-none">Cancel</Button>
                                         </SheetClose>
                                        <Button
                                            onClick={handleCreateChat}
                                            disabled={selectedFriends.length === 0 || isCreatingChat || (selectedFriends.length > 1 && !groupName.trim())}
                                            className="flex-1 sm:flex-none"
                                        >
                                            {isCreatingChat ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <UserCheck className="mr-2 h-4 w-4" />
                                            )}
                                            {selectedFriends.length > 1 ? "Create Group" : "Start Chat"}
                                        </Button>
                                    </SheetFooter>
                                </SheetContent>
                             </Sheet>
                        </TooltipTrigger>
                        <TooltipContent>New Chat</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="View Chat Members or Profile" className="text-muted-foreground hover:text-foreground" disabled={!currentChat || isChatLoading}>
                                {currentChatDisplay.isGroup ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {currentChatDisplay.isGroup ? `View Members (${currentChatDisplay.participantCount})` : `View Profile`}
                        </TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
         ) : (
            <div className="flex items-center gap-1">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
            </div>
         )}
      </CardHeader>

      {/* Chat Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div ref={viewportRef} className="h-full">
              <div className="space-y-4 pb-4 px-4 pt-4">
                {(isChatLoading || isMessagesLoading) ? ( // Combined loading check
                    // Loading Skeletons
                    <>
                        {[...Array(8)].map((_, i) => (
                           <div key={`skel-${i}`} className={cn("flex gap-3", i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                               {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0 self-end" />}
                               <div className={cn("flex flex-col gap-1", i % 2 === 0 ? 'items-start' : 'items-end')}>
                                   <Skeleton className={cn("h-4 w-20 rounded", i % 2 !== 0 && 'hidden')} />
                                   <Skeleton className={cn("h-10 rounded-lg", i % 3 === 0 ? 'w-48' : i % 3 === 1 ? 'w-32' : 'w-40')} />
                                    {/* Skeleton for timestamp */}
                                    <span className="text-xs opacity-60 mt-1 px-1 min-h-[1em]">
                                         <Skeleton className="h-3 w-10 inline-block" />
                                    </span>
                               </div>
                               {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0 self-end" />}
                           </div>
                        ))}
                    </>
                ) : messages.length === 0 ? (
                    // Empty Chat Placeholder
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center pt-10 animate-fade-in opacity-0 [--fade-in-delay:300ms]">
                        <MessageSquare className="h-16 w-16 mb-5 opacity-30" />
                        <p className="text-xl font-medium mb-1">It's quiet here...</p>
                        <p className="text-sm max-w-xs">
                           {currentChat?.type === 'dm' ? `Start the conversation with ${currentChat.name}!` : currentChat ? `Be the first to send a message in ${currentChat.name}!` : 'Select or create a chat to begin.'}
                        </p>
                    </div>
                 ) : (
                    // Actual Messages
                    messages.map((msg, index) => {
                      const isCurrentUser = msg.senderId === currentUserId;
                      const prevMessage = messages[index - 1];
                      // Use Firestore Timestamp for comparison
                      const timeDiff = msg.createdAt && prevMessage?.createdAt
                          ? msg.createdAt.toMillis() - prevMessage.createdAt.toMillis()
                          : Infinity;

                      const showMeta = !prevMessage || prevMessage.senderId !== msg.senderId || timeDiff > 5 * 60 * 1000;

                      const nextMessage = messages[index + 1];
                      const nextTimeDiff = nextMessage?.createdAt && msg.createdAt
                           ? nextMessage.createdAt.toMillis() - msg.createdAt.toMillis()
                           : Infinity;

                      const showTimestamp = !nextMessage || nextMessage.senderId !== msg.senderId || nextTimeDiff > 5 * 60 * 1000;

                      return (
                         <div
                          key={msg.id}
                          className={cn(
                              "flex gap-2",
                              isCurrentUser ? 'justify-end pl-10 sm:pl-16' : 'justify-start pr-10 sm:pr-16',
                              showMeta ? 'mt-3' : 'mt-1'
                          )}
                         >
                           <div className="w-8 flex-shrink-0 self-end">
                            {!isCurrentUser && showMeta && (
                                <TooltipProvider delayDuration={300}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Avatar className="h-8 w-8 animate-fade-in opacity-0 [--fade-in-delay:50ms]">
                                                <AvatarImage src={msg.avatar} alt={msg.senderName} />
                                                <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent side="left">{msg.senderName}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                           </div>

                            <div
                              className={cn(
                                "max-w-[85%] sm:max-w-[75%] flex flex-col",
                                isCurrentUser ? 'items-end' : 'items-start'
                              )}
                            >
                                {!isCurrentUser && showMeta && currentChat?.type === 'group' && (
                                     <p className="text-xs font-semibold mb-0.5 text-primary/80">{msg.senderName}</p>
                                )}

                                <div className={cn(
                                     "rounded-xl px-3.5 py-2 text-sm shadow-md relative",
                                     isCurrentUser
                                      ? 'bg-gradient-to-br from-primary/90 to-primary text-primary-foreground rounded-br-sm animate-in slide-in-from-right-5 duration-300 ease-out'
                                      : 'bg-muted text-foreground rounded-bl-sm animate-in slide-in-from-left-5 duration-300 ease-out'
                                  )}>
                                    <p className="leading-snug break-words whitespace-pre-wrap">{msg.text}</p>
                                </div>

                                {isClient && msg.createdAt && ( // Check if createdAt exists and isClient
                                    <span className={cn(
                                        "text-[10px] opacity-0 mt-1 px-1 transition-opacity duration-300 min-h-[1em]", // Added min-h-[1em]
                                        showTimestamp ? 'opacity-60' : '', // Don't hide if not showing, keep space
                                        isCurrentUser ? 'self-end' : 'self-start'
                                    )}>
                                        {/* Format Firestore Timestamp */}
                                       {showTimestamp ? format(msg.createdAt.toDate(), 'p') : ''}
                                    </span>
                                )}
                            </div>
                         </div>
                      );
                  })
                 )}
              </div>
          </div>
        </ScrollArea>
      </CardContent>

      {/* Chat Input Bar */}
      <div className="p-2 sm:p-3 border-t border-border bg-background/90 backdrop-blur-sm flex-shrink-0">
         {isClient ? (
           <TooltipProvider delayDuration={200}>
             <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-1 sm:space-x-2">
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" aria-label="Emoji" className="text-muted-foreground hover:text-accent-foreground rounded-full interactive-hover" disabled={isChatLoading || !currentChat || currentChat.id === 'loading'}>
                            <Smile className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Emoji & Stickers</TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" aria-label="Attach file" className="text-muted-foreground hover:text-accent-foreground rounded-full interactive-hover" disabled={isChatLoading || !currentChat || currentChat.id === 'loading'} onClick={() => document.getElementById('file-input')?.click()}>
                            <Paperclip className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file/image</TooltipContent>
                </Tooltip>
                 <input id="file-input" type="file" className="hidden" onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                         toast({title: "File Selected", description: `${file.name} ready to attach (feature not fully implemented).`});
                     }
                     e.target.value = '';
                 }} />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" aria-label="AI Assistant" className="text-muted-foreground hover:text-accent-foreground rounded-full interactive-hover" disabled={isChatLoading || !currentChat || currentChat.id === 'loading'}>
                            <Bot className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>AI Assistant</TooltipContent>
                </Tooltip>

                <Input
                    type="text"
                    placeholder={currentChat && currentChat.id !== 'loading' ? `Message ${currentChat.name}...` : "Select a chat"}
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-1 bg-muted/60 focus:ring-primary focus:border-primary rounded-full px-4 h-10 transition-colors duration-200 border-transparent focus:bg-background"
                    aria-label="Chat message input"
                    disabled={isSending || isChatLoading || !currentChat || currentChat.id === 'loading'}
                    autoComplete="off"
                />

                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full retro-glow w-10 h-10 flex-shrink-0 interactive-hover" aria-label="Send message" disabled={isSending || !newMessageText.trim() || isChatLoading || !currentChat || currentChat.id === 'loading'}>
                             {isSending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                             ) : (
                                <SendHorizonal className="h-5 w-5" />
                             )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send message</TooltipContent>
                </Tooltip>
            </form>
          </TooltipProvider>
         ) : (
            <div className="flex w-full items-center space-x-2 h-10">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-10 flex-1 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
         )}
      </div>
    </div>
  );
}
