
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendHorizonal, Users, Paperclip, ImageIcon, Bot, Smile, Loader2, MessageSquare } from 'lucide-react'; // Added Loader2 and MessageSquare
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  avatar: string;
}

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

  // --- Client-Side Mounting & Initial Load ---
  useEffect(() => {
    setIsClient(true);
    // Simulate fetching initial messages
    const timer = setTimeout(() => {
        setMessages(initialMessages);
        setIsLoading(false);
        // Use 'instant' for the initial scroll after loading messages
        // Defer slightly to ensure layout is stable
        requestAnimationFrame(() => {
            setTimeout(() => scrollToBottom('instant'), 50);
        });
    }, 1000); // Simulate 1s loading delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  // --- Scroll to Bottom Logic ---
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
      requestAnimationFrame(() => { // Use requestAnimationFrame for smoother scrolling
          const viewport = viewportRef.current;
          if (viewport) {
              viewport.scrollTo({ top: viewport.scrollHeight, behavior });
          }
      });
  }, []);

   // Scroll smoothly when new messages are added by the current user
   useEffect(() => {
       if (messages.length > 0 && messages[messages.length - 1]?.sender === currentUser) {
           scrollToBottom('smooth');
       }
   }, [messages, currentUser, scrollToBottom]);


  // --- Message Sending Logic ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isSending) return; // Prevent sending empty or duplicate messages

    setIsSending(true);
    const tempId = `temp-${Date.now()}`; // Temporary ID for optimistic update

    const messageData: Message = {
      id: tempId,
      sender: currentUser,
      text: trimmedMessage,
      timestamp: Date.now(),
      avatar: 'https://picsum.photos/seed/bob/40/40', // Use current user's avatar
    };

     // Optimistic UI update
     setMessages(prevMessages => [...prevMessages, messageData]);
     setNewMessage('');
     // Scroll immediately after optimistic update
     scrollToBottom('smooth');


    // Simulate API call to send message
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate receiving the message back with a real ID (or handle potential error)
    // In a real app, replace the temp message with the one from the server
    // For demo, we'll just keep the optimistic one.

    setIsSending(false);

     // Simulate a reply from Alice after a short delay
     setTimeout(() => {
         const replyMessage: Message = {
             id: String(Date.now()),
             sender: 'Alice',
             text: `Got it, ${currentUser}! 👋`,
             timestamp: Date.now(),
             avatar: 'https://picsum.photos/seed/alice/40/40',
         };
         setMessages(prevMessages => [...prevMessages, replyMessage]);
         // Consider scrolling only if user is near the bottom when receiving messages
         // const viewport = viewportRef.current;
         // if (viewport && viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 100) {
         //    scrollToBottom('smooth');
         // }
     }, 1500);

  };

  // --- Rendering ---
  return (
    // Use flex-col and h-full to ensure it fills the parent container
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
       <CardHeader className="flex flex-row items-center justify-between border-b border-border p-3 sm:p-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Use a generic group icon or specific chat icon */}
          <div className="relative">
              <Avatar className="h-8 w-8 border-2 border-primary/50">
                  <AvatarImage src="https://picsum.photos/seed/group/40/40" alt="Global Chat" />
                  <AvatarFallback>GC</AvatarFallback>
              </Avatar>
               <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background"></span>
          </div>
          <CardTitle className="text-base sm:text-lg font-semibold leading-tight">Global Chat</CardTitle>
        </div>
         {isClient ? (
            <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="View Users" className="text-muted-foreground hover:text-foreground">
                            <Users className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>View Users (3)</TooltipContent>
                </Tooltip>
            </TooltipProvider>
         ) : (
            <Skeleton className="h-9 w-9 rounded-md" />
         )}
      </CardHeader>

      {/* Chat Messages Area - Use flex-1 to take remaining space */}
      <CardContent className="flex-1 p-0 overflow-hidden">
         {/* ScrollArea takes full height of the CardContent */}
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          {/* Viewport needs a direct ref */}
          <div className="h-full" ref={viewportRef}>
             {/* Inner container for padding and messages - Removed pb-10 */}
              <div className="p-4 space-y-4"> {/* Removed pb-10 */}
                {isLoading ? (
                    // Loading Skeletons
                    <>
                        {[...Array(8)].map((_, i) => (
                           <div key={`skel-${i}`} className={cn("flex gap-3", i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                               {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
                               <div className={cn("flex flex-col gap-1.5", i % 2 === 0 ? 'items-start' : 'items-end')}>
                                   <Skeleton className={cn("h-4 w-20", i % 2 !== 0 && 'hidden')} /> {/* Sender name */}
                                   <Skeleton className={cn("h-10 rounded-lg", i % 3 === 0 ? 'w-48' : i % 3 === 1 ? 'w-32' : 'w-40')} />
                                   <span className={cn(
                                       "text-[10px] opacity-60 mt-1 self-end transition-opacity duration-200 min-h-[1em]", // Ensure min-height for skeleton
                                        'opacity-0' // Hide timestamp skeleton initially
                                   )}>
                                     <Skeleton className="h-3 w-10 inline-block" /> {/* Timestamp - use inline-block for proper skeleton display */}
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
                        <p className="text-sm">Start the conversation!</p>
                    </div>
                 ) : (
                    // Actual Messages
                    messages.map((msg, index) => {
                      const isCurrentUser = msg.sender === currentUser;
                      // Show avatar if it's not the current user AND (it's the first message OR the previous message sender is different)
                      const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1]?.sender !== msg.sender);
                      // Show timestamp if it's the last message OR the next message sender is different
                      const showTimestamp = index === messages.length - 1 || messages[index + 1]?.sender !== msg.sender;

                      return (
                         <div
                          key={msg.id}
                          className={cn(
                            "flex gap-2", // Reduced gap
                            isCurrentUser ? 'justify-end pl-10' : 'justify-start pr-10' // Add padding to opposite side
                          )}
                         >
                           {/* Sender Avatar (Conditional) */}
                           <div className="w-8 flex-shrink-0 self-end"> {/* Align avatar to bottom */}
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


                            {/* Message Bubble */}
                            <div
                              className={cn(
                                "max-w-[80%] rounded-lg px-3 py-1.5 text-sm shadow-sm relative flex flex-col", // Flex column for text and timestamp
                                isCurrentUser
                                  ? 'bg-primary text-primary-foreground rounded-br-none animate-in slide-in-from-right-4 duration-300 ease-out'
                                  : 'bg-muted text-foreground rounded-bl-none animate-in slide-in-from-left-4 duration-300 ease-out',
                                showAvatar ? 'mt-1' : '' // Add slight margin top if avatar is not shown
                              )}
                            >
                                {/* Sender Name (only if showing avatar and not current user) */}
                                {showAvatar && !isCurrentUser && <p className="font-semibold text-xs mb-0.5 text-primary">{msg.sender}</p>}
                                {/* Message Text */}
                                <p className="leading-snug break-words">{msg.text}</p> {/* Improved line height, ensure word breaks */}

                                {/* Timestamp (conditionally displayed, aligned right within bubble) */}
                                <span className={cn(
                                    "text-[10px] opacity-60 mt-1 self-end transition-opacity duration-200 min-h-[1em]", // Ensure min-height for layout stability
                                    showTimestamp ? 'opacity-60' : 'opacity-0' // Hide if not last message of group
                                )}>
                                   {/* Render only on client to avoid hydration issues */}
                                   {isClient ? format(new Date(msg.timestamp), 'p') : ''}
                                </span>
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
      {/* Use flex-shrink-0 to prevent it from shrinking. Remove sticky positioning. */}
      <div className="p-2 sm:p-4 border-t border-border bg-background flex-shrink-0">
         {isClient ? (
           <TooltipProvider delayDuration={200}>
             <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-1 sm:space-x-2">
                {/* Action Buttons (Condensed) */}
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

                {/* Input Field */}
                <Input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-muted/50 focus:ring-primary focus:border-primary rounded-full px-4 h-10 transition-colors duration-200" // Use primary ring
                    aria-label="Chat message input"
                    disabled={isSending} // Disable input while sending
                    autoComplete="off"
                />

                {/* Send Button */}
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full retro-glow w-10 h-10 flex-shrink-0" aria-label="Send message" disabled={isSending || !newMessage.trim()}>
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
            // Skeleton Loader for Input Bar
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

