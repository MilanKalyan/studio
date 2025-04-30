"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendHorizonal, Users, MessageSquare } from 'lucide-react';
import { format } from 'date-fns'; // Import format from date-fns

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
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isClient, setIsClient] = useState(false); // State to track client-side mount
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Ref for scroll area viewport
  const currentUser = 'Bob'; // Assume current user is Bob for display logic

  useEffect(() => {
    // Set isClient to true after component mounts
    setIsClient(true);
    // Scroll to bottom initially when component mounts and client is ready
    scrollToBottom();
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    if (scrollAreaRef.current) {
      // Access the viewport element within the ScrollArea component
      const viewport = scrollAreaRef.current.querySelector(':scope > div');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior });
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: Message = {
        id: String(Date.now()),
        sender: currentUser,
        text: newMessage,
        timestamp: Date.now(),
        avatar: 'https://picsum.photos/seed/bob/40/40', // Use current user's avatar
      };
      setMessages(prevMessages => [...prevMessages, message]);
      setNewMessage('');

      // Scroll to bottom after sending a message using the viewport
      // Use timeout to ensure the DOM has updated with the new message
      setTimeout(() => scrollToBottom('smooth'), 0);

      // Here you would typically send the message to a backend/WebSocket
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col border-primary/50 shadow-lg shadow-primary/10">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-secondary" />
          <CardTitle className="text-lg font-semibold">Global Chat</CardTitle>
        </div>
        <Button variant="ghost" size="icon">
          <Users className="h-5 w-5" />
          <span className="sr-only">View Users</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        {/* Pass the ref to the ScrollArea component */}
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === currentUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender !== currentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.avatar} alt={msg.sender} />
                    <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-md ${
                    msg.sender === currentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {msg.sender !== currentUser && <p className="font-semibold text-xs mb-1 opacity-80">{msg.sender}</p>}
                  <p>{msg.text}</p>
                  <p className="text-xs opacity-60 mt-1 text-right min-h-[1em]"> {/* Add min-height to prevent layout shift */}
                    {/* Use date-fns format for consistent time formatting, only render on client */}
                    {isClient ? format(new Date(msg.timestamp), 'p') : ''}
                  </p>
                </div>
                 {msg.sender === currentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.avatar} alt={msg.sender} />
                    <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-background/80 focus:ring-accent focus:border-accent"
            aria-label="Chat message input"
          />
          <Button type="submit" size="icon" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground retro-glow">
            <SendHorizonal className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
