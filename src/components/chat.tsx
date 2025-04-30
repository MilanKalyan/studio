
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendHorizonal, Users, MessageSquare, Paperclip, Image as ImageIcon, Bot, Smile } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  avatar: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'Alice', text: 'Hey Bob!', timestamp: Date.now() - 60000, avatar: 'https://picsum.photos/seed/alice/40/40' },
    { id: '2', sender: 'Bob', text: 'Hi Alice! What\'s up?', timestamp: Date.now() - 30000, avatar: 'https://picsum.photos/seed/bob/40/40' },
    { id: '3', sender: 'Alice', text: 'Not much, just checking out Kinect. Wanna play Tic Tac Toe?', timestamp: Date.now(), avatar: 'https://picsum.photos/seed/alice/40/40' },
     // Add more messages for scrolling demonstration
    { id: '4', sender: 'Bob', text: 'Sure, I\'m setting up the lobby!', timestamp: Date.now() + 1000, avatar: 'https://picsum.photos/seed/bob/40/40' },
    { id: '5', sender: 'Alice', text: 'Cool! Send me an invite.', timestamp: Date.now() + 2000, avatar: 'https://picsum.photos/seed/alice/40/40' },
    { id: '6', sender: 'Bob', text: 'Invite sent!', timestamp: Date.now() + 3000, avatar: 'https://picsum.photos/seed/bob/40/40' },
    { id: '7', sender: 'Alice', text: 'Got it! Joining now.', timestamp: Date.now() + 4000, avatar: 'https://picsum.photos/seed/alice/40/40' },
    { id: '8', sender: 'Bob', text: 'Awesome! Let\'s play.', timestamp: Date.now() + 5000, avatar: 'https://picsum.photos/seed/bob/40/40' },
    { id: '9', sender: 'Alice', text: 'You\'re going down! 😉', timestamp: Date.now() + 6000, avatar: 'https://picsum.photos/seed/alice/40/40' },
    { id: '10', sender: 'Bob', text: 'We\'ll see about that! 😄', timestamp: Date.now() + 7000, avatar: 'https://picsum.photos/seed/bob/40/40' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const currentUser = 'Bob'; // Simulate the current user

  // --- Client-Side Mounting ---
  useEffect(() => {
    setIsClient(true);
    // Scroll to bottom initially, but wait for potential layout shifts
    // Use 'instant' for the initial scroll to avoid jarring animation on load
    setTimeout(() => scrollToBottom('instant'), 100);
  }, []);

  // --- Scroll to Bottom Logic ---
   // Ensure scroll to bottom happens after messages are rendered/updated
  useEffect(() => {
    if (isClient) {
       // Scroll smoothly after new messages are added
       setTimeout(() => scrollToBottom('smooth'), 100);
    }
    // Only re-run when messages change *after* the initial mount
  }, [messages, isClient]);


  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(':scope > div'); // Target the viewport div directly
      if (viewport) {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior });
      }
    }
  };

  // --- Message Sending Logic ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: Message = {
        id: String(Date.now()),
        sender: currentUser, // Use the simulated current user
        text: newMessage,
        timestamp: Date.now(),
        avatar: 'https://picsum.photos/seed/bob/40/40', // Current user's avatar
      };
      setMessages(prevMessages => [...prevMessages, message]);
      setNewMessage('');
      // No need to manually scroll here, useEffect handles it
    }
  };

  // --- Rendering ---
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
       <CardHeader className="flex flex-row items-center justify-between border-b border-border p-4 sticky top-0 bg-background z-10">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-secondary" />
          <CardTitle className="text-lg font-semibold">Global Chat</CardTitle>
        </div>
         {/* Show Skeleton only on server, actual button on client */}
         {isClient ? (
            <Button variant="ghost" size="icon" aria-label="View Users">
                <Users className="h-5 w-5" />
                {/* <span className="sr-only">View Users</span> */}
            </Button>
         ) : (
            <Skeleton className="h-10 w-10 rounded-md" />
         )}
      </CardHeader>

      {/* Chat Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4 mb-4"> {/* Add margin-bottom */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === currentUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Sender Avatar (only if not current user) */}
                {msg.sender !== currentUser && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={msg.avatar} alt={msg.sender} />
                    <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-md transition-transform duration-300 ease-out ${
                    msg.sender === currentUser
                      ? 'bg-primary text-primary-foreground animate-in slide-in-from-right-5'
                      : 'bg-secondary text-secondary-foreground animate-in slide-in-from-left-5'
                  }`}
                >
                  {/* Sender Name (only if not current user) */}
                  {msg.sender !== currentUser && <p className="font-semibold text-xs mb-1 opacity-80">{msg.sender}</p>}
                  {/* Message Text */}
                  <p>{msg.text}</p>
                  {/* Timestamp */}
                  {/* Use span instead of p to allow div (Skeleton) inside */}
                  <span className="text-xs opacity-60 mt-1 text-right min-h-[1em] block">
                    {/* Conditionally render timestamp or skeleton */}
                    {isClient ? format(new Date(msg.timestamp), 'p') : <Skeleton className="h-3 w-10 inline-block"/>}
                  </span>
                </div>

                 {/* Current User Avatar (only if is current user) */}
                 {msg.sender === currentUser && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={msg.avatar} alt={msg.sender} />
                    <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-border bg-background sticky bottom-16 z-10"> {/* Adjust bottom offset */}
         {/* Render Skeleton on server, actual input bar on client */}
         {isClient ? (
           <TooltipProvider delayDuration={200}>
             <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                {/* Action Buttons */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" aria-label="Attach file">
                            <Paperclip className="h-5 w-5" />
                            {/* <span className="sr-only">Attach file</span> */}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" aria-label="Attach image">
                            <ImageIcon className="h-5 w-5" />
                           {/* <span className="sr-only">Attach image</span> */}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach image</TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" type="button" aria-label="AI Chat Bot">
                            <Bot className="h-5 w-5" />
                            {/* <span className="sr-only">AI Chat Bot</span> */}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>AI Chat Bot</TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" type="button" aria-label="Stickers and Emoji">
                            <Smile className="h-5 w-5" />
                           {/* <span className="sr-only">Stickers</span> */}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Stickers & Emoji</TooltipContent>
                </Tooltip>

                {/* Input Field */}
                <Input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-muted/50 focus:ring-accent focus:border-accent rounded-full px-4" // Rounded input
                    aria-label="Chat message input"
                />

                {/* Send Button */}
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="submit" size="icon" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full retro-glow" aria-label="Send message">
                            <SendHorizonal className="h-5 w-5" />
                           {/* <span className="sr-only">Send message</span> */}
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
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 flex-1 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
         )}
      </div>
    </div>
  );
}
