
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

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  avatar: string;
}

// Placeholder Player type
export interface Player { // Exporting for use in MySpaceContent
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'ingame';
    kinectId: string; // Added Kinect ID
}

// Placeholder friends data (consistent with MySpaceContent)
const placeholderFriends: Player[] = [
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
    avatar?: string; // Optional: Group avatar or DM user avatar
    participants: string[]; // List of participant IDs (e.g., ['bob', 'alice'])
    lastMessage?: string; // For display in lists
    lastMessageTime?: number;
}

// Define props for Chat component
interface ChatProps {
    chatRooms: ChatRoom[];
    currentChat: ChatRoom | null; // Now nullable
    messages: Message[];
    isLoading: boolean;
    currentUser: string;
    currentUserId: string;
    onSwitchChat: (chatId: string, newChatDetails?: ChatRoom) => void;
    onAddMessage: (newMessage: Message) => void;
    onAddChatRoom: (newRoom: ChatRoom) => void;
}


export function Chat({
    chatRooms,
    currentChat,
    messages,
    isLoading,
    currentUser,
    currentUserId,
    onSwitchChat,
    onAddMessage,
    onAddChatRoom
}: ChatProps) {
  // Local state for the input field, sending status, etc.
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null); // Ref for the viewport div
  const [isAddRoomSheetOpen, setIsAddRoomSheetOpen] = useState(false);
  const [friends, setFriends] = useState<Player[]>([]); // State for friends list (still local to Chat for the sheet)
  const [filteredFriends, setFilteredFriends] = useState<Player[]>([]);
  const [friendSearchTerm, setFriendSearchTerm] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const { toast } = useToast();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // --- Client-Side Mounting & Initial Friend Load ---
  useEffect(() => {
    setIsClient(true);
    // Simulate fetching initial friends (still needed for the 'Add Room' sheet)
    const timer = setTimeout(() => {
        // Ensure friends list is consistent
        const kinectIds = ['1234', '5678', '9012', '3456', '7890'];
        const updatedFriends = placeholderFriends.map((friend, index) => ({
            ...friend,
            kinectId: `KINECT#${kinectIds[index] || Math.floor(1000 + Math.random() * 9000)}` // Add unique ID if missing
        }));
        setFriends(updatedFriends);
        setFilteredFriends(updatedFriends);
    }, 500); // Shorter delay as main data comes from props

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
               (friend.kinectId && friend.kinectId.toLowerCase().includes(lowerCaseTerm)) // Search by Kinect ID too, check if kinectId exists
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

   // Scroll logic based on props changes
   useEffect(() => {
       if (!isLoading && messages.length > 0) {
           // If the last message is from the current user, always scroll smoothly
           if (messages[messages.length - 1]?.sender === currentUser) {
               scrollToBottom('smooth');
           } else {
               // If receiving a message from others, only scroll if near the bottom
               const viewport = viewportRef.current;
               if (viewport && viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 150) {
                 scrollToBottom('smooth');
               }
           }
       }
       // If switching chats and messages become empty or loading finishes with empty messages, scroll to top
       else if (!isLoading && messages.length === 0 && viewportRef.current) {
            viewportRef.current.scrollTo({ top: 0, behavior: 'instant' });
       }
   }, [messages, currentUser, scrollToBottom, isLoading]);

   // Scroll instantly when currentChat changes (switching chats)
   useEffect(() => {
       if (currentChat && currentChat.id !== 'loading') {
           scrollToBottom('instant');
       }
   }, [currentChat, scrollToBottom]);


  // --- Message Sending Logic ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    // Check currentChat exists and is not the loading placeholder
    if (!currentChat || currentChat.id === 'loading' || !trimmedMessage || isSending) return;

    setIsSending(true);
    const tempId = `temp-${Date.now()}`;

    const messageData: Message = {
      id: tempId,
      sender: currentUser,
      text: trimmedMessage,
      timestamp: Date.now(),
      avatar: 'https://picsum.photos/seed/bob/40/40', // Current user's avatar
    };

     // Call the onAddMessage prop function to update state in Home component
     onAddMessage(messageData);

     // Clear input and scroll (optimistic update handled by state change)
     setNewMessage('');
     // scrollToBottom('smooth'); // Let the useEffect handle scrolling

     // Simulate API call delay
     await new Promise(resolve => setTimeout(resolve, 500));
     setIsSending(false);

     // Simulate a reply only in Global Chat for demo (keep this local if desired)
     if (currentChat.id === 'global') { // Use 'global' id consistently
         setTimeout(() => {
             const replyMessage: Message = {
                 id: String(Date.now()),
                 sender: 'Alice',
                 text: `Got it, ${currentUser}! 👋`,
                 timestamp: Date.now(),
                 avatar: 'https://picsum.photos/seed/alice/40/40',
             };
             // Use onAddMessage for replies too, ensuring state consistency
             onAddMessage(replyMessage);
             // Scroll handled by useEffect
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
           const existingDmId = `dm-${[currentUserId, friend.id].sort().join('-')}`; // Create consistent sorted ID

           // Check if DM already exists using the chatRooms prop
            const existingDm = chatRooms.find(room => room.id === existingDmId);
            if (existingDm) {
                toast({ variant: "default", title: "Chat Exists", description: `Chat with ${friend.name} already exists.` });
                onSwitchChat(existingDm.id); // Use prop to switch chat
                setIsCreatingChat(false);
                setIsAddRoomSheetOpen(false);
                setSelectedFriends([]);
                setGroupName('');
                setFriendSearchTerm('');
                return; // Stop creation process
            }

            newChat = {
                id: existingDmId, // Use the consistent sorted ID
                name: friend.name, // DM name is the friend's name
                type: 'dm',
                participants: participantIds,
                avatar: friend.avatar // Use friend's avatar for DM
            };
            toast({ title: "Direct Chat Started", description: `Chat with ${newChat.name} created.` });
       }

        // Use the onAddChatRoom prop to add the new chat room to the state in Home
        onAddChatRoom(newChat);

        // Reset form and close sheet
        setIsCreatingChat(false);
        setIsAddRoomSheetOpen(false);
        setSelectedFriends([]);
        setGroupName('');
        setFriendSearchTerm('');
   };


   // Get display details for the current chat using the currentChat prop
   const currentChatDisplay = !currentChat || currentChat.id === 'loading' ? {
       name: 'Loading...',
       avatar: undefined, // Pass undefined instead of empty string
       fallback: 'L',
       isOnline: false
   } : {
       name: currentChat.name,
       avatar: currentChat.avatar || undefined, // Ensure undefined if no avatar
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
                <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-auto -ml-2 focus-visible:ring-1 focus-visible:ring-ring" disabled={!currentChat}>
                    <div className="relative">
                        <Avatar className={cn("h-8 w-8 border-2", currentChatDisplay.isOnline ? "border-green-500/70" : "border-border/50")}>
                             {/* Pass undefined or a valid URL to src */}
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
                     {/* Use chatRooms prop */}
                     {chatRooms.map(room => (
                         <DropdownMenuItem
                            key={room.id}
                            onSelect={() => onSwitchChat(room.id)} // Use onSwitchChat prop
                            className={cn(
                                "flex items-center gap-2 cursor-pointer",
                                currentChat?.id === room.id && "bg-accent" // Use currentChat prop
                            )}
                          >
                            {room.type === 'group' ? (
                                <Hash className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Avatar className="h-5 w-5">
                                    {/* Pass undefined or valid URL */}
                                    <AvatarImage src={room.avatar || undefined} alt={room.name} />
                                    <AvatarFallback>{room.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
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
                            <Button variant="ghost" size="icon" aria-label="View Chat Members" className="text-muted-foreground hover:text-foreground" disabled={!currentChat || isLoading}>
                                {currentChat?.type === 'group' ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {currentChat?.type === 'group' ? `View Members (${currentChat.participants.length})` : `View Profile`}
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
                           {currentChat?.type === 'dm' ? `Start chatting with ${currentChat.name}!` : currentChat ? `Start the conversation in ${currentChat.name}!` : 'Select a chat to begin.'}
                        </p>
                    </div>
                 ) : (
                    // Actual Messages (using messages prop)
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
                                {showAvatar && !isCurrentUser && currentChat?.type === 'group' && <p className="font-semibold text-xs mb-0.5 text-primary">{msg.sender}</p>}
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
                        <Button variant="ghost" size="icon" type="button" aria-label="Emoji" className="text-muted-foreground hover:text-accent-foreground" disabled={isLoading || !currentChat || currentChat.id === 'loading'}>
                            <Smile className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Emoji & Stickers</TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" aria-label="Attach file" className="text-muted-foreground hover:text-accent-foreground" disabled={isLoading || !currentChat || currentChat.id === 'loading'}>
                            <Paperclip className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file/image</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" aria-label="AI Assistant" className="text-muted-foreground hover:text-accent-foreground" disabled={isLoading || !currentChat || currentChat.id === 'loading'}>
                            <Bot className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>AI Assistant</TooltipContent>
                </Tooltip>

                <Input
                    type="text"
                    placeholder={currentChat ? "Type a message..." : "Select a chat"}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-muted/50 focus:ring-primary focus:border-primary rounded-full px-4 h-10 transition-colors duration-200"
                    aria-label="Chat message input"
                    disabled={isSending || isLoading || !currentChat || currentChat.id === 'loading'} // Disable while sending or loading chats or if no chat selected
                    autoComplete="off"
                />

                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full retro-glow w-10 h-10 flex-shrink-0" aria-label="Send message" disabled={isSending || !newMessage.trim() || isLoading || !currentChat || currentChat.id === 'loading'}>
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
