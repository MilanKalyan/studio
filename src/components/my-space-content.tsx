
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Star, Users, Clock, UserPlus, Search, Loader2, Hash } from "lucide-react"; // Added Hash
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ChatRoom } from './chat'; // Import ChatRoom type
import { formatDistanceToNow } from 'date-fns'; // Import for relative time

// Placeholder data - replace with actual user data fetching
const placeholderRecentActivities = [
    { id: 1, type: "game", name: "Tic Tac Toe", time: "5 minutes ago" },
    { id: 2, type: "chat", name: "Global Chat", time: "1 hour ago" },
    { id: 3, type: "profile", name: "Updated bio", time: "Yesterday" },
    { id: 4, type: "friend", name: "Added Alice", time: "2 days ago" },
];

const placeholderFavoriteGames = [
    { id: 'tic-tac-toe', name: 'Tic Tac Toe', img: 'https://picsum.photos/seed/tictactoe/100/100' },
    { id: 'chess', name: 'Chess', img: 'https://picsum.photos/seed/chess/100/100' },
    { id: 'checkers', name: 'Checkers', img: 'https://picsum.photos/seed/checkers/100/100' },
];

// Placeholder Player type definition (copied from chat.tsx)
interface Player {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'ingame';
    kinectId: string;
}

// Placeholder friends data (copied from chat.tsx)
const placeholderFriends: Player[] = [
     { id: 'alice', name: 'Alice', avatar: 'https://picsum.photos/seed/alice/40/40', status: 'online', kinectId: 'KINECT#1234'},
     { id: 'charlie', name: 'Charlie', avatar: 'https://picsum.photos/seed/charlie/40/40', status: 'offline', kinectId: 'KINECT#5678'},
     { id: 'dave', name: 'Dave', avatar: 'https://picsum.photos/seed/dave/40/40', status: 'ingame', kinectId: 'KINECT#9012'},
     { id: 'eve', name: 'Eve', avatar: 'https://picsum.photos/seed/eve/40/40', status: 'online', kinectId: 'KINECT#3456'},
     { id: 'frank', name: 'Frank', avatar: 'https://picsum.photos/seed/frank/40/40', status: 'offline', kinectId: 'KINECT#7890'},
];

// Define initial Global Chat for demonstration
const initialGlobalChat: ChatRoom = {
    id: 'global',
    name: 'Global Chat',
    type: 'group',
    participants: ['alice', 'bob', 'charlie', 'dave', 'eve', 'frank'],
    avatar: 'https://picsum.photos/seed/group/40/40',
    lastMessage: 'Perfect! I\'ll bring my A-game. ♟️',
    lastMessageTime: Date.now(), // Simplified for demo
};


// Props for MySpaceContent
interface MySpaceContentProps {
    // Function to switch chat in the main Chat component
    onSwitchChat?: (chatId: string) => void;
    // Pass chat rooms list (needs to be managed outside and passed in)
    // For demo, we'll use a local state initialized with global chat
    // chatRooms: ChatRoom[];
}

export function MySpaceContent({ onSwitchChat }: MySpaceContentProps) {
  const { toast } = useToast();
  const [friendIdInput, setFriendIdInput] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state for sections
  const [recentActivities, setRecentActivities] = useState<typeof placeholderRecentActivities>([]);
  const [favoriteGames, setFavoriteGames] = useState<typeof placeholderFavoriteGames>([]);
  const [friends, setFriends] = useState<typeof placeholderFriends>([]);
  const [isClient, setIsClient] = useState(false);
  // Local state for chat rooms, initialized with global chat.
  // In a real app, this would likely come from props or a shared context.
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([initialGlobalChat]);


  useEffect(() => {
      setIsClient(true);
      // Simulate loading data
      const timer = setTimeout(() => {
          setRecentActivities(placeholderRecentActivities);
          setFavoriteGames(placeholderFavoriteGames);
          setFriends(placeholderFriends);
          // Simulate adding a DM and another group chat after load for demonstration
          setChatRooms(prev => [
              ...prev,
               { id: `dm-alice-bob`, name: 'Alice', type: 'dm', participants: ['bob', 'alice'], avatar: 'https://picsum.photos/seed/alice/40/40', lastMessage: 'Awesome! See you then. 😄', lastMessageTime: Date.now() - 300000 },
               { id: `group-chess-club`, name: 'Chess Club', type: 'group', participants: ['bob', 'alice', 'charlie'], avatar: 'https://picsum.photos/seed/chessclub/40/40', lastMessage: 'Bob: Chess works! Let\'s do that.', lastMessageTime: Date.now() - 15000 },
          ]);
          setIsLoading(false);
      }, 800); // Simulate loading delay

      return () => clearTimeout(timer);
  }, []);


   const handleAddFriend = async () => {
     const trimmedId = friendIdInput.trim();
     if (!trimmedId) {
         toast({ variant: "destructive", title: "Invalid ID" });
         return;
     }

     // Check if already friends
     if (friends.some(f => f.kinectId === trimmedId)) {
         toast({ variant: "destructive", title: "Already Friends", description: "You are already friends with this user." });
         setFriendIdInput('');
         return;
     }
     // Check if adding self (assuming current user's placeholder ID)
      const currentUserKinectId = "KINECT#BOBSID"; // Placeholder for current user
      if (trimmedId === currentUserKinectId) {
          toast({ variant: "destructive", title: "Cannot Add Self", description: "You cannot add yourself as a friend." });
          return;
      }


     setIsAddingFriend(true);
     console.log(`Attempting to add friend with ID: ${trimmedId}`);
     await new Promise(resolve => setTimeout(resolve, 1000));

     // Simulate success/failure
     const success = Math.random() > 0.3; // 70% success rate
     // Try to find a user from the placeholder list *not already friends*
     const potentialFriend = placeholderFriends.find(p => p.kinectId === trimmedId && !friends.some(f => f.id === p.id));

     if (success && potentialFriend) {
         // Simulate adding friend locally
          setFriends(prev => [...prev, { ...potentialFriend, status: Math.random() > 0.5 ? 'online' : 'offline' }]); // Add found user with random status
         toast({ title: "Friend Request Sent", description: `Friend request sent to ${potentialFriend.name} (${trimmedId}).` });
         setFriendIdInput('');
     } else {
         toast({ variant: "destructive", title: "Friend Not Found", description: `Could not find a user with ID ${trimmedId} or request failed.` });
     }
     setIsAddingFriend(false);
   };

    // Function to handle clicking on a chat
    const handleChatClick = (chatId: string) => {
        console.log("Clicked chat:", chatId);
        // If onSwitchChat prop exists, call it
        if (onSwitchChat) {
            onSwitchChat(chatId);
            // Maybe close the sheet after switching? Depends on UX.
        } else {
            toast({ title: "Switching Chat (Placeholder)", description: `Would switch to chat ID: ${chatId}`, duration: 2000 });
        }
    };

   // Sort chat rooms by last message time (most recent first)
   const sortedChatRooms = [...chatRooms].sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0));


  return (
    <div className="space-y-6 p-4 pb-10">
      {/* My Chats Section */}
       <Card className={cn("animate-fade-in opacity-0 [--fade-in-delay:100ms]", isLoading && "opacity-100")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-md font-semibold flex items-center gap-2">
                    <Hash className="h-5 w-5 text-primary" /> My Chats
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7" disabled={isLoading}>See All</Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={`chat-skel-${i}`} className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-1.5">
                                     <Skeleton className="h-4 w-3/4" />
                                     <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {sortedChatRooms.map(room => (
                            <div
                                key={room.id}
                                className="flex items-center gap-3 p-2 -mx-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => handleChatClick(room.id)}
                                role="button"
                                tabIndex={0}
                                aria-label={`Open chat ${room.name}`}
                            >
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={room.avatar} alt={room.name} />
                                    <AvatarFallback>{room.type === 'group' ? '#' : room.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium truncate">{room.name}</p>
                                        {room.lastMessageTime && isClient && (
                                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                                {formatDistanceToNow(new Date(room.lastMessageTime), { addSuffix: true })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{room.lastMessage || 'No messages yet'}</p>
                                </div>
                            </div>
                        ))}
                        {sortedChatRooms.length === 0 && !isLoading && (
                           <p className="text-sm text-muted-foreground text-center py-4">No active chats. Create one!</p>
                        )}
                    </div>
                )}
            </CardContent>
       </Card>


       {/* Favorite Games */}
      <Card className={cn("animate-fade-in opacity-0 [--fade-in-delay:150ms]", isLoading && "opacity-100")}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-md font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" /> Favorite Games
            </CardTitle>
             <Button variant="ghost" size="sm" className="text-xs h-7" disabled={isLoading}>See All</Button>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="grid grid-cols-3 gap-4">
                     {[...Array(3)].map((_, i) => (
                        <div key={`fav-skel-${i}`} className="flex flex-col items-center space-y-2">
                            <Skeleton className="h-20 w-20 rounded-lg" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                     ))}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                     {favoriteGames.slice(0, 3).map(game => (
                        <div key={game.id} className="flex flex-col items-center text-center group cursor-pointer"
                             onClick={() => { /* Navigate to game or show details */ }}>
                             <Image
                                src={game.img}
                                alt={game.name}
                                width={80}
                                height={80}
                                className="rounded-lg mb-1 shadow-md hover:scale-105 transition-transform duration-200 border-2 border-transparent group-hover:border-secondary"
                             />
                             <span className="text-xs font-medium leading-tight mt-1">{game.name}</span>
                        </div>
                     ))}
                      {favoriteGames.length === 0 && !isLoading && (
                        <p className="col-span-3 text-center text-sm text-muted-foreground py-4">No favorite games yet.</p>
                      )}
                </div>
            )}
        </CardContent>
      </Card>


      {/* Recent Activity */}
      <Card className={cn("animate-fade-in opacity-0 [--fade-in-delay:250ms]", isLoading && "opacity-100")}>
         <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-md font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" /> Recent Activity
            </CardTitle>
             <Button variant="ghost" size="sm" className="text-xs h-7" disabled={isLoading}>Clear</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={`act-skel-${i}`} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-3/5" />
                        <Skeleton className="h-3 w-1/5" />
                    </div>
                ))}
            </div>
          ) : (
            <ul className="space-y-2 text-sm text-muted-foreground max-h-36 overflow-y-auto pr-1">
                {recentActivities.map((activity) => (
                <li key={activity.id} className="flex justify-between items-center hover:bg-muted/50 px-1 -mx-1 rounded transition-colors">
                    <span className="truncate pr-2">{activity.name} <span className="text-xs opacity-70">({activity.type})</span></span>
                    <span className="text-xs flex-shrink-0">{activity.time}</span>
                </li>
                ))}
                 {recentActivities.length === 0 && !isLoading && (
                    <p className="text-center text-sm text-muted-foreground py-4">No recent activity.</p>
                 )}
            </ul>
          )}
        </CardContent>
      </Card>

       {/* Friends List */}
      <Card className={cn("animate-fade-in opacity-0 [--fade-in-delay:350ms]", isLoading && "opacity-100")}>
         <CardHeader className="pb-2">
            <CardTitle className="text-md font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" /> Friends ({friends.length})
            </CardTitle>
             {/* Add Friend Input */}
             <form onSubmit={(e) => { e.preventDefault(); handleAddFriend(); }} className="flex items-center gap-2 mt-3">
                 <Input
                    type="text"
                    placeholder="Enter Kinect ID..."
                    className="flex-1 bg-muted/50 text-sm h-9"
                    value={friendIdInput}
                    onChange={(e) => setFriendIdInput(e.target.value)}
                    aria-label="Enter Kinect ID to add friend"
                    disabled={isAddingFriend || isLoading}
                 />
                <Button size="icon" type="submit" aria-label="Add Friend" disabled={isAddingFriend || !friendIdInput.trim() || isLoading} className="h-9 w-9 flex-shrink-0">
                    {isAddingFriend ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                </Button>
            </form>
            {/* Search Friends (Optional) */}
             {/* <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search friends..." className="pl-8 h-9 bg-muted/50" />
            </div> */}
        </CardHeader>
        <CardContent>
           {/* Existing Friends List */}
           {isLoading ? (
               <div className="space-y-3">
                 {[...Array(4)].map((_, i) => (
                    <div key={`friend-skel-${i}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                 ))}
               </div>
           ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {friends.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between hover:bg-muted/50 px-1 -mx-1 rounded transition-colors cursor-pointer"
                         onClick={() => { /* Open chat or profile */ }}>
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="relative flex-shrink-0">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={friend.avatar} alt={friend.name} />
                                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className={cn(
                                    "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-card",
                                    friend.status === 'online' ? 'bg-green-500' :
                                    friend.status === 'ingame' ? 'bg-blue-500' : 'bg-gray-400'
                                )}></span>
                            </div>
                            <span className="text-sm font-medium truncate">{friend.name}</span>
                        </div>
                         <Badge
                            variant={friend.status === 'online' ? 'secondary' : friend.status === 'ingame' ? 'default' : 'outline'}
                            className={cn(
                                "h-5 px-1.5 text-[10px] capitalize transition-colors flex-shrink-0",
                                friend.status === 'online' && 'bg-green-500/10 text-green-600 border-green-500/20',
                                friend.status === 'ingame' && 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            )}
                            >
                            {friend.status}
                         </Badge>
                    </div>
                ))}
                {friends.length === 0 && !isLoading && (
                    <p className="text-sm text-muted-foreground text-center py-4">Add friends using their Kinect ID!</p>
                )}
            </div>
           )}
        </CardContent>
      </Card>


      {/* My Files Section (Placeholder) */}
       <Card className={cn("animate-fade-in opacity-0 [--fade-in-delay:450ms]", isLoading && "opacity-100")}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-md font-semibold flex items-center gap-2">
                <Folder className="h-5 w-5 text-orange-500" /> My Files
            </CardTitle>
             <Button variant="ghost" size="sm" className="text-xs h-7" disabled={isLoading}>Manage</Button>
        </CardHeader>
        <CardContent>
             {isLoading ? (
                 <>
                    <Skeleton className="h-4 w-4/5 mb-3" />
                    <Skeleton className="h-9 w-full" />
                 </>
             ) : (
                 <>
                    <p className="text-sm text-muted-foreground mb-3">Organize your documents, images, and saved game states.</p>
                    <Button variant="outline" className="w-full h-9 text-sm">Browse Files</Button>
                 </>
             )}
        </CardContent>
      </Card>
    </div>
  );
}
