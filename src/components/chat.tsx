
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendHorizonal, Users, Paperclip, Bot, Smile, Loader2, MessageSquare, PlusCircle, Search, UserCheck, Hash, User, ChevronsUpDown } from 'lucide-react'; // Added Hash, User, ChevronsUpDown
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

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  avatar: string;
}

// Placeholder Player type
interface Player {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'ingame';
    kinectId: string; // Added Kinect ID
}

// Placeholder friends data
const placeholderFriends: Player[] = [
     { id: 'alice', name: 'Alice', avatar: 'https://picsum.photos/seed/alice/40/40', status: 'online', kinectId: 'KINECT#1234'},
     { id: 'charlie', name: 'Charlie', avatar: 'https://picsum.photos/seed/charlie/40/40', status: 'offline', kinectId: 'KINECT#5678'},
     { id: 'dave', name: 'Dave', avatar: 'https://picsum.photos/seed/dave/40/40', status: 'ingame', kinectId: 'KINECT#9012'},
     { id: 'eve', name: 'Eve', avatar: 'https://picsum.photos/seed/eve/40/40', status: 'online', kinectId: 'KINECT#3456'},
     { id: 'frank', name: 'Frank', avatar: 'https://picsum.photos/seed/frank/40/40', status: 'offline', kinectId: 'KINECT#7890'},
];

// Placeholder Chat Room type
export interface ChatRoom { // Exporting for use in MySpaceContent
    id: string;
    name: string;
    type: 'group' | 'dm';
    avatar?: string; // Optional: Group avatar or DM user avatar
    participants: string[]; // List of participant IDs (e.g., ['bob', 'alice'])
    lastMessage?: string; // For display in lists
    lastMessageTime?: number;
}

// Initial Global Chat
const globalChat: ChatRoom = {
    id: 'global',
    name: 'Global Chat',
    type: 'group',
    participants: ['alice', 'bob', 'charlie', 'dave', 'eve', 'frank'], // Everyone initially
    avatar: 'https://picsum.photos/seed/group/40/40',
    lastMessage: 'Perfect! I\'ll bring my A-game. ♟️',
    lastMessageTime: initialMessages[initialMessages.length - 1]?.timestamp ?? Date.now(),
};

// Keep initialMessages for initial load simulation
const initialMessages: Message[] = [
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
];


export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]); // Start with empty messages
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start in loading state
  const [isSending, setIsSending] = useState(false); // State for sending message indicator
  const [isClient, setIsClient] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null); // Ref for the viewport div
  const currentUser = 'Bob'; // Simulate the current user
  const currentUserId = 'bob'; // Simulate current user ID
  const [isAddRoomSheetOpen, setIsAddRoomSheetOpen] = useState(false);
  const [friends, setFriends] = useState<Player[]>([]); // State for friends list
  const [filteredFriends, setFilteredFriends] = useState<Player[]>([]);
  const [friendSearchTerm, setFriendSearchTerm] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const { toast } = useToast();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([globalChat]); // State to hold all chat rooms
  const [currentChat, setCurrentChat] = useState<ChatRoom>(globalChat); // State for the currently viewed chat


  // --- Client-Side Mounting & Initial Load ---
  useEffect(() => {
    setIsClient(true);
    // Simulate fetching initial messages & friends
    const timer = setTimeout(() => {
        // Load messages for the default chat (Global Chat)
        setMessages(initialMessages);
        setFriends(placeholderFriends); // Load placeholder friends
        setFilteredFriends(placeholderFriends); // Initialize filtered list
        setIsLoading(false);
        // Scroll to bottom after initial load
        requestAnimationFrame(() => {
            setTimeout(() => scrollToBottom('instant'), 50);
        });
    }, 1000); // Simulate 1s loading delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

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
               friend.kinectId.toLowerCase().includes(lowerCaseTerm) // Search by Kinect ID too
           )
       );
   }, [friendSearchTerm, friends]);


  // --- Scroll to Bottom Logic ---
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
      requestAnimationFrame(() => {
          const viewport = viewportRef.current;
          if (viewport) {
              viewport.scrollTo({ top: viewport.scrollHeight, behavior });
          }
      });
  }, []);

   // Scroll smoothly when new messages are added by the current user or when messages load initially
   useEffect(() => {
       if (!isLoading && messages.length > 0) {
           if (messages[messages.length - 1]?.sender === currentUser) {
               scrollToBottom('smooth');
           } else {
               const viewport = viewportRef.current;
               if (viewport && viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 150) {
                 scrollToBottom('smooth');
               }
           }
       }
       // If switching chats and messages become empty, ensure view is scrolled to top/start
       else if (!isLoading && messages.length === 0 && viewportRef.current) {
            viewportRef.current.scrollTo({ top: 0, behavior: 'instant' });
       }
   }, [messages, currentUser, scrollToBottom, isLoading]);


  // --- Message Sending Logic ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isSending || currentChat.id === 'loading') return; // Prevent sending empty, duplicate or while loading

    setIsSending(true);
    const tempId = `temp-${Date.now()}`;

    const messageData: Message = {
      id: tempId,
      sender: currentUser,
      text: trimmedMessage,
      timestamp: Date.now(),
      avatar: 'https://picsum.photos/seed/bob/40/40',
    };

     // Simulate API call to send message (would target currentChat.id)
     console.log(`Sending to chat ${currentChat.id}:`, messageData);
     // Optimistic UI update *only if in the correct chat*
     // In a real app, WS would push the update
     if (currentChat.id === globalChat.id) { // For demo, only update Global Chat optimistically
        setMessages(prevMessages => [...prevMessages, messageData]);
        scrollToBottom('smooth'); // Scroll after optimistic update
     } else {
         // If not in global chat, just show sending state and maybe clear input
         // In real app, send to backend, rely on WS/refetch for update
          toast({ title: "Message Sent", description: `To: ${currentChat.name}` });
     }

     setNewMessage('');


    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSending(false);

     // Simulate a reply only in Global Chat for demo
     if (currentChat.id === globalChat.id) {
         setTimeout(() => {
             const replyMessage: Message = {
                 id: String(Date.now()),
                 sender: 'Alice',
                 text: `Got it, ${currentUser}! 👋`,
                 timestamp: Date.now(),
                 avatar: 'https://picsum.photos/seed/alice/40/40',
             };
             setMessages(prevMessages => [...prevMessages, replyMessage]);
             const viewport = viewportRef.current;
             if (viewport && viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 150) {
                scrollToBottom('smooth');
             }
         }, 1500);
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
           toast({ variant: "destructive", title: "Group Name Required" });
           return;
       }

       setIsCreatingChat(true);
       await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate creation

       const selectedFriendDetails = friends.filter(f => selectedFriends.includes(f.id));
       const participantIds = [currentUserId, ...selectedFriends]; // Include self
       const isGroup = selectedFriends.length > 1;

       let newChat: ChatRoom;
       if (isGroup) {
            newChat = {
                id: `group-${Date.now()}`, // Simple unique ID
                name: groupName.trim(),
                type: 'group',
                participants: participantIds,
                avatar: `https://picsum.photos/seed/${groupName.trim()}/40/40` // Placeholder avatar based on name
            };
            toast({ title: "Group Chat Created", description: `Started group: ${newChat.name}` });
       } else {
           const friend = selectedFriendDetails[0];
            newChat = {
                id: `dm-${friend.id}-${currentUserId}`, // Consistent DM ID (order might matter in real app)
                name: friend.name, // DM name is the friend's name
                type: 'dm',
                participants: participantIds,
                avatar: friend.avatar // Use friend's avatar for DM
            };
            toast({ title: "Direct Chat Started", description: `Chat with ${newChat.name} created.` });
       }

        // Add to chat list and switch to the new chat
        setChatRooms(prev => [...prev, newChat]);
        handleSwitchChat(newChat.id); // Switch to the newly created chat

        // Reset form and close sheet
        setIsCreatingChat(false);
        setIsAddRoomSheetOpen(false);
        setSelectedFriends([]);
        setGroupName('');
        setFriendSearchTerm('');

       // TODO: Update MySpace with the new group/chat link
       // This would likely involve a shared state or context/props drilling
       // For now, just log it.
       console.log("New chat created, ID:", newChat.id, "Should update MySpace.");
   };

   // --- Chat Switching Logic ---
    const handleSwitchChat = (chatId: string) => {
        if (chatId === currentChat.id || chatId === 'loading') return;

        const targetChat = chatRooms.find(room => room.id === chatId);
        if (!targetChat) return;

        console.log(`Switching to chat: ${targetChat.name} (ID: ${chatId})`);

        // Set loading state for messages
        setIsLoading(true);
        setCurrentChat({ id: 'loading', name: 'Loading...', type: 'group', participants: [] }); // Temporary loading state
        setMessages([]); // Clear previous messages

        // Simulate fetching messages for the new chat
        setTimeout(() => {
            setCurrentChat(targetChat);
            if (targetChat.id === globalChat.id) {
                setMessages(initialMessages); // Load global messages
            } else {
                // Simulate empty chat for newly created DMs/Groups
                 setMessages([]); // Empty messages for other chats in this demo
                 // In a real app, fetch messages for targetChat.id here
            }
            setIsLoading(false);
            // Scroll to bottom (or top if empty) after switching
            requestAnimationFrame(() => {
                setTimeout(() => scrollToBottom(messages.length > 0 ? 'instant' : 'instant'), 50); // Instant scroll on switch
            });
        }, 500); // Simulate network delay for switching
    };

   // Get display details for the current chat
   const currentChatDisplay = currentChat.id === 'loading' ? {
       name: 'Loading...',
       avatar: '',
       fallback: 'L',
       isOnline: false
   } : {
       name: currentChat.name,
       avatar: currentChat.avatar || '',
       fallback: currentChat.name.charAt(0).toUpperCase(),
       // Basic online status simulation (only for DMs for now)
       isOnline: currentChat.type === 'dm' && friends.find(f => f.id === currentChat.participants.find(p => p !== currentUserId))?.status === 'online'
   };



  // --- Rendering ---
  return (
    // Use flex-col and h-full to ensure it fills the parent container
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
       <CardHeader className="flex flex-row items-center justify-between border-b border-border p-3 sm:p-4 sticky top-0 bg-background/90 backdrop-blur-sm z-10 flex-shrink-0">
        {/* Chat Switcher Dropdown */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-auto -ml-2 focus-visible:ring-1 focus-visible:ring-ring">
                    <div className="relative">
                        <Avatar className={cn("h-8 w-8 border-2", currentChatDisplay.isOnline ? "border-green-500/70" : "border-border/50")}>
                            <AvatarImage src={currentChatDisplay.avatar} alt={currentChatDisplay.name} />
                            <AvatarFallback>{currentChatDisplay.fallback}</AvatarFallback>
                        </Avatar>
                         {currentChatDisplay.isOnline && (
                            <span className="absolute bottom-[-2px] right-[-2px] block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background"></span>
                         )}
                    </div>
                    <CardTitle className="text-base sm:text-lg font-semibold leading-tight truncate max-w-[150px] sm:max-w-[250px]">
                        {currentChatDisplay.name}
                    </CardTitle>
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground ml-1 shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Chats</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuGroup>
                     {/* Global Chat Always First */}
                     <DropdownMenuItem
                        key={globalChat.id}
                        onSelect={() => handleSwitchChat(globalChat.id)}
                        className={cn("flex items-center gap-2 cursor-pointer", currentChat.id === globalChat.id && "bg-accent")}
                      >
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{globalChat.name}</span>
                     </DropdownMenuItem>

                     {/* DMs */}
                     {chatRooms.filter(room => room.type === 'dm').map(room => (
                         <DropdownMenuItem
                            key={room.id}
                            onSelect={() => handleSwitchChat(room.id)}
                            className={cn("flex items-center gap-2 cursor-pointer", currentChat.id === room.id && "bg-accent")}
                          >
                              <Avatar className="h-5 w-5">
                                  <AvatarImage src={room.avatar} alt={room.name} />
                                  <AvatarFallback>{room.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            <span className="truncate">{room.name}</span>
                         </DropdownMenuItem>
                     ))}

                     {/* Groups */}
                     {chatRooms.filter(room => room.type === 'group' && room.id !== globalChat.id).map(room => (
                          <DropdownMenuItem
                            key={room.id}
                            onSelect={() => handleSwitchChat(room.id)}
                            className={cn("flex items-center gap-2 cursor-pointer", currentChat.id === room.id && "bg-accent")}
                          >
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={room.avatar} alt={room.name} />
                                <AvatarFallback>#</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{room.name}</span>
                          </DropdownMenuItem>
                     ))}
                </DropdownMenuGroup>
                 <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setIsAddRoomSheetOpen(true)} className="flex items-center gap-2 cursor-pointer">
                      <PlusCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Create New Chat...</span>
                  </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

         {/* Action Buttons */}
         {isClient ? (
            <TooltipProvider delayDuration={200}>
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {/* Add Room Sheet Trigger */}
                             <Sheet open={isAddRoomSheetOpen} onOpenChange={setIsAddRoomSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label="Create New Chat" className="text-muted-foreground hover:text-foreground">
                                        <PlusCircle className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                 <SheetContent side="left" className="sm:max-w-sm flex flex-col p-0">
                                    <SheetHeader className="px-4 pt-4 pb-2 border-b">
                                        <SheetTitle>Create New Chat</SheetTitle>
                                        <SheetDescription>
                                            Select friends for a DM or group chat.
                                        </SheetDescription>
                                    </SheetHeader>
                                     {/* Search Input */}
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

                                     {/* Group Name Input (Conditional) */}
                                     {selectedFriends.length > 1 && (
                                        <div className="px-4 pt-4">
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

                                     {/* Friend List */}
                                     <ScrollArea className="flex-1 px-4 py-4">
                                         {filteredFriends.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-6">No friends found.</p>
                                         ) : (
                                            <div className="space-y-3">
                                                {filteredFriends.map(friend => (
                                                    <div
                                                        key={friend.id}
                                                        className={cn(
                                                            "flex items-center justify-between p-2 rounded-md transition-colors cursor-pointer hover:bg-muted/50",
                                                            selectedFriends.includes(friend.id) && "bg-muted"
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
                                    <SheetFooter className="px-4 pb-4 pt-2 border-t bg-background">
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
                            <Button variant="ghost" size="icon" aria-label="View Chat Members" className="text-muted-foreground hover:text-foreground">
                                {currentChat.type === 'group' ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {currentChat.type === 'group' ? `View Members (${currentChat.participants.length})` : `View Profile`}
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
          <div ref={viewportRef} className="h-full"> {/* Viewport takes full height */}
              <div className="p-4 space-y-4 pb-4">
                {isLoading ? (
                    // Loading Skeletons
                    <>
                        {[...Array(8)].map((_, i) => (
                           <div key={`skel-${i}`} className={cn("flex gap-3", i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                               {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
                               <div className={cn("flex flex-col gap-1.5", i % 2 === 0 ? 'items-start' : 'items-end')}>
                                   <Skeleton className={cn("h-4 w-20", i % 2 !== 0 && 'hidden')} />
                                   <Skeleton className={cn("h-10 rounded-lg", i % 3 === 0 ? 'w-48' : i % 3 === 1 ? 'w-32' : 'w-40')} />
                                   {/* Timestamp Skeleton */}
                                    <span className="text-[10px] opacity-0 mt-1 self-end min-h-[1em]">
                                        <Skeleton className="h-3 w-10 inline-block" />
                                    </span>
                               </div>
                               {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
                           </div>
                        ))}
                    </>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center pt-20">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">No messages yet</p>
                        <p className="text-sm">
                           {currentChat.type === 'dm' ? `Start chatting with ${currentChat.name}!` : `Start the conversation in ${currentChat.name}!`}
                        </p>
                    </div>
                 ) : (
                    // Actual Messages
                    messages.map((msg, index) => {
                      const isCurrentUser = msg.sender === currentUser;
                      const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1]?.sender !== msg.sender);
                      const nextMessageTimestamp = messages[index + 1]?.timestamp;
                      const timeDiff = nextMessageTimestamp ? nextMessageTimestamp - msg.timestamp : Infinity;
                      const showTimestamp = index === messages.length - 1 || messages[index + 1]?.sender !== msg.sender || timeDiff > 5 * 60 * 1000;

                      return (
                         <div
                          key={msg.id}
                          className={cn( "flex gap-2", isCurrentUser ? 'justify-end pl-10' : 'justify-start pr-10')}
                         >
                           <div className="w-8 flex-shrink-0 self-end">
                            {showAvatar && (
                                <TooltipProvider delayDuration={300}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Avatar className="h-8 w-8 animate-fade-in opacity-0 [--fade-in-delay:100ms]">
                                                <AvatarImage src={msg.avatar} alt={msg.sender} />
                                                <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent side="left">{msg.sender}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                           </div>

                            <div
                              className={cn(
                                "max-w-[80%] rounded-lg px-3 py-1.5 text-sm shadow-sm relative flex flex-col",
                                isCurrentUser
                                  ? 'bg-primary text-primary-foreground rounded-br-none animate-in slide-in-from-right-4 duration-300 ease-out'
                                  : 'bg-muted text-foreground rounded-bl-none animate-in slide-in-from-left-4 duration-300 ease-out',
                                (!showAvatar && index > 0 && messages[index-1].sender === msg.sender) ? 'mt-1' : 'mt-0'
                              )}
                            >
                                {showAvatar && !isCurrentUser && currentChat.type === 'group' && <p className="font-semibold text-xs mb-0.5 text-primary">{msg.sender}</p>}
                                <p className="leading-snug break-words">{msg.text}</p>
                                {isClient && (
                                    <span className={cn(
                                        "text-[10px] opacity-60 mt-1 self-end transition-opacity duration-200 min-h-[1em]",
                                        showTimestamp ? 'opacity-60' : 'opacity-0'
                                    )}>
                                       {format(new Date(msg.timestamp), 'p')}
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
      <div className="p-2 sm:p-4 border-t border-border bg-background flex-shrink-0">
         {isClient ? (
           <TooltipProvider delayDuration={200}>
             <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-1 sm:space-x-2">
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" aria-label="Emoji" className="text-muted-foreground hover:text-accent-foreground">
                            <Smile className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Emoji & Stickers</TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" aria-label="Attach file" className="text-muted-foreground hover:text-accent-foreground">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file/image</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" aria-label="AI Assistant" className="text-muted-foreground hover:text-accent-foreground">
                            <Bot className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>AI Assistant</TooltipContent>
                </Tooltip>

                <Input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-muted/50 focus:ring-primary focus:border-primary rounded-full px-4 h-10 transition-colors duration-200"
                    aria-label="Chat message input"
                    disabled={isSending || isLoading || currentChat.id === 'loading'} // Disable while sending or loading chats
                    autoComplete="off"
                />

                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full retro-glow w-10 h-10 flex-shrink-0" aria-label="Send message" disabled={isSending || !newMessage.trim() || isLoading || currentChat.id === 'loading'}>
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
            <div className="flex w-full items-center space-x-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 flex-1 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
         )}
      </div>
    </div>
  );
}
