
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Star, Users, Clock, UserPlus, Search, Loader2, Hash, MessageCircle, MoreHorizontal } from "lucide-react"; // Added MoreHorizontal
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ChatRoom, Player } from './chat'; // Import types
import { formatDistanceToNow } from 'date-fns'; // Import for relative time
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea

// Placeholder data - replace with actual user data fetching
const placeholderRecentActivities = [
    { id: 1, type: "game", name: "Tic Tac Toe", time: Date.now() - 5 * 60 * 1000 }, // Use timestamps
    { id: 2, type: "chat", name: "Global Chat", time: Date.now() - 60 * 60 * 1000 },
    { id: 3, type: "profile", name: "Updated bio", time: Date.now() - 24 * 60 * 60 * 1000 },
    { id: 4, type: "friend", name: "Added Alice", time: Date.now() - 2 * 24 * 60 * 60 * 1000 },
];

const placeholderFavoriteGames = [
    { id: 'tic-tac-toe', name: 'Tic Tac Toe', img: 'https://picsum.photos/seed/tictactoe/100/100' },
    { id: 'chess', name: 'Chess', img: 'https://picsum.photos/seed/chess/100/100' },
    { id: 'checkers', name: 'Checkers', img: 'https://picsum.photos/seed/checkers/100/100' },
    // Add more for scrolling example
     { id: 'connect-four', name: 'Connect Four', img: 'https://picsum.photos/seed/connect4/100/100' },
     { id: 'battleship', name: 'Battleship', img: 'https://picsum.photos/seed/battleship/100/100' },
];

// Placeholder friends data (ensure Bob is included for demo consistency)
const placeholderFriendsData: Player[] = [
     { id: 'bob', name: 'Bob', avatar: 'https://picsum.photos/seed/bob/40/40', status: 'online', kinectId: 'KINECT#BOBSID'}, // Current User
     { id: 'alice', name: 'Alice', avatar: 'https://picsum.photos/seed/alice/40/40', status: 'online', kinectId: 'KINECT#1234'},
     { id: 'charlie', name: 'Charlie', avatar: 'https://picsum.photos/seed/charlie/40/40', status: 'offline', kinectId: 'KINECT#5678'},
     { id: 'dave', name: 'Dave', avatar: 'https://picsum.photos/seed/dave/40/40', status: 'ingame', kinectId: 'KINECT#9012'},
     { id: 'eve', name: 'Eve', avatar: 'https://picsum.photos/seed/eve/40/40', status: 'online', kinectId: 'KINECT#3456'},
     { id: 'frank', name: 'Frank', avatar: 'https://picsum.photos/seed/frank/40/40', status: 'offline', kinectId: 'KINECT#7890'},
];


// Props for MySpaceContent - receives chatRooms and onSwitchChat from BottomNavigation -> Home
interface MySpaceContentProps {
    chatRooms: ChatRoom[];
    onSwitchChat: (chatId: string, newChatDetails?: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'>) => void; // Allow passing new chat details
}

export function MySpaceContent({ chatRooms, onSwitchChat }: MySpaceContentProps) {
  const { toast } = useToast();
  const [friendIdInput, setFriendIdInput] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state for sections
  const [recentActivities, setRecentActivities] = useState<(typeof placeholderRecentActivities[0])[]>([]);
  const [favoriteGames, setFavoriteGames] = useState<(typeof placeholderFavoriteGames[0])[]>([]);
  const [friends, setFriends] = useState<Player[]>([]); // Keep friends list local for Add Friend functionality
  const [isClient, setIsClient] = useState(false); // State to track client-side mount
  const currentUserId = 'bob'; // Simulate current user ID for DM creation


  useEffect(() => {
      setIsClient(true); // Component has mounted
      // Simulate loading data (except chatRooms which comes from props)
      const timer = setTimeout(() => {
          setRecentActivities(placeholderRecentActivities);
          setFavoriteGames(placeholderFavoriteGames);
           // Filter out current user for display in friend list
          setFriends(placeholderFriendsData.filter(f => f.id !== currentUserId));
          setIsLoading(false);
      }, 600); // Simulate loading delay

      return () => clearTimeout(timer);
  }, [currentUserId]);


   const handleAddFriend = async () => {
     const trimmedId = friendIdInput.trim().toUpperCase(); // Normalize ID input
     if (!trimmedId || !trimmedId.startsWith('KINECT#') || trimmedId.length < 8) {
         toast({ variant: "destructive", title: "Invalid Kinect ID Format", description:"ID should be like KINECT#1234" });
         return;
     }

     // Check if already friends (using the local 'friends' state which excludes self)
     if (friends.some(f => f.kinectId === trimmedId)) {
         toast({ variant: "destructive", title: "Already Friends", description: "You are already friends with this user." });
         setFriendIdInput('');
         return;
     }
     // Check if adding self
      const currentUserKinectId = placeholderFriendsData.find(f => f.id === currentUserId)?.kinectId;
      if (trimmedId === currentUserKinectId) {
          toast({ variant: "destructive", title: "Cannot Add Self", description: "You cannot add yourself as a friend." });
          return;
      }


     setIsAddingFriend(true);
     console.log(`Attempting to add friend with ID: ${trimmedId}`);
     await new Promise(resolve => setTimeout(resolve, 800)); // Faster simulation

     // Simulate success/failure by finding the user in the master data
     const potentialFriend = placeholderFriendsData.find(p => p.kinectId === trimmedId);

     if (potentialFriend) {
         // Simulate adding friend locally to the displayed list
          setFriends(prev => [...prev, potentialFriend]);
         toast({ title: "Friend Request Sent", description: `Friend request sent to ${potentialFriend.name} (${trimmedId}).` });
         setFriendIdInput('');
     } else {
         toast({ variant: "destructive", title: "Friend Not Found", description: `Could not find a user with ID ${trimmedId}.` });
     }
     setIsAddingFriend(false);
   };

    // Function to handle clicking on a chat in the list
    const handleChatClick = (chatId: string) => {
        // console.log("MySpace: Clicked chat:", chatId);
        // Use the onSwitchChat prop passed down from Home
        onSwitchChat(chatId);
        // Optionally close the sheet after switching (consider UX)
        // document.dispatchEvent(new CustomEvent('close-myspace-sheet')); // Example event dispatch
    };

     // Function to handle clicking a friend to start/open a DM
     const handleFriendClick = (friend: Player) => {
         // console.log("MySpace: Clicked friend:", friend.name);
         // Generate the potential DM chat ID
         const dmId = `dm-${[currentUserId, friend.id].sort().join('-')}`;

         // Check if the DM chat room already exists in the passed chatRooms prop
         const existingDm = chatRooms.find(room => room.id === dmId);

         // Find friend details from master list (might have updated status)
         const friendDetails = placeholderFriendsData.find(f => f.id === friend.id);
         if (!friendDetails) return; // Should not happen with current setup

         if (existingDm) {
             // If it exists, just switch to it
             onSwitchChat(dmId);
         } else {
             // If it doesn't exist, create the details and pass them to onSwitchChat
             const newDmDetails: Omit<ChatRoom, 'lastMessage' | 'lastMessageTime'> = { // Use Omit type
                 id: dmId,
                 name: friendDetails.name,
                 type: 'dm',
                 participants: [currentUserId, friendDetails.id],
                 avatar: friendDetails.avatar,
             };
             onSwitchChat(dmId, newDmDetails); // Pass the details to create and switch
         }
         // Optionally close the sheet
         // document.dispatchEvent(new CustomEvent('close-myspace-sheet'));
     };


   // Sort chat rooms by last message time (most recent first) using the prop
   const sortedChatRooms = [...chatRooms].sort((a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0));


  return (
    // Increased overall padding
    <div className="space-y-6 p-4 pb-12">
      {/* My Chats Section - Enhanced Layout */}
       <Card className={cn("animate-fade-in opacity-0 [--fade-in-delay:100ms] shadow-sm hover:shadow-md transition-shadow duration-200", isLoading && "opacity-100")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" /> My Chats
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-primary" disabled={isLoading}>See All</Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4 pt-1">
                        {[...Array(3)].map((_, i) => (
                            <div key={`chat-skel-${i}`} className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="flex-1 space-y-1.5">
                                     <Skeleton className="h-4 w-3/4 rounded" />
                                     <Skeleton className="h-3 w-1/2 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <ScrollArea className="max-h-48 pr-2 -mr-2"> {/* Added ScrollArea */}
                        <div className="space-y-1">
                            {sortedChatRooms.map(room => (
                                <div
                                    key={room.id}
                                    className="flex items-center gap-3 p-2 -mx-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors duration-150 interactive-hover"
                                    onClick={() => handleChatClick(room.id)} // Use the handler
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Open chat ${room.name}`}
                                >
                                    <Avatar className="h-9 w-9 flex-shrink-0 border-2 border-border/50">
                                        <AvatarImage src={room.avatar || ''} alt={room.name} />
                                        <AvatarFallback className="text-xs">{room.type === 'group' ? '#' : room.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-medium truncate">{room.name}</p>
                                            {/* Only render timestamp on client */}
                                            {room.lastMessageTime && isClient && (
                                                <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                                                    {formatDistanceToNow(new Date(room.lastMessageTime), { addSuffix: true, includeSeconds: false })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{room.lastMessage || 'No messages yet'}</p>
                                    </div>
                                </div>
                            ))}
                            {sortedChatRooms.length === 0 && !isLoading && (
                               <p className="text-sm text-muted-foreground text-center py-4">No active chats. Start a new one!</p>
                            )}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
       </Card>


       {/* Favorite Games - Horizontal Scroll */}
      <Card className={cn("animate-fade-in opacity-0 [--fade-in-delay:150ms] shadow-sm hover:shadow-md transition-shadow duration-200", isLoading && "opacity-100")}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" /> Favorite Games
            </CardTitle>
             <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-primary" disabled={isLoading}>See All</Button>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex space-x-4 overflow-x-auto pb-2">
                     {[...Array(4)].map((_, i) => (
                        <div key={`fav-skel-${i}`} className="flex flex-col items-center space-y-2 flex-shrink-0 w-20">
                            <Skeleton className="h-20 w-20 rounded-lg" />
                            <Skeleton className="h-3 w-16 rounded" />
                        </div>
                     ))}
                </div>
            ) : (
                <ScrollArea className="w-full whitespace-nowrap pb-2">
                    <div className="flex space-x-4">
                        {favoriteGames.map(game => (
                            <div key={game.id} className="inline-flex flex-col items-center text-center group cursor-pointer w-20 flex-shrink-0 interactive-hover"
                                 onClick={() => { /* Navigate to game or show details */ }}>
                                 <Image
                                    src={game.img}
                                    alt={game.name}
                                    width={80}
                                    height={80}
                                    className="rounded-lg mb-1 shadow-md group-hover:shadow-lg border-2 border-transparent group-hover:border-secondary transition-all duration-200"
                                 />
                                 <span className="text-xs font-medium leading-tight mt-1 truncate w-full">{game.name}</span>
                            </div>
                        ))}
                        {favoriteGames.length === 0 && !isLoading && (
                            <p className="col-span-3 text-center text-sm text-muted-foreground py-4">Add your favorite games!</p>
                        )}
                    </div>
                    {/* Add ScrollBar component if needed */}
                </ScrollArea>
            )}
        </CardContent>
      </Card>


      {/* Recent Activity - Improved Formatting */}
      <Card className={cn("animate-fade-in opacity-0 [--fade-in-delay:250ms] shadow-sm hover:shadow-md transition-shadow duration-200", isLoading && "opacity-100")}>
         <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" /> Recent Activity
            </CardTitle>
             <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-destructive" disabled={isLoading}>Clear</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 pt-1">
                {[...Array(3)].map((_, i) => (
                    <div key={`act-skel-${i}`} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-3/5 rounded" />
                        <Skeleton className="h-3 w-1/5 rounded" />
                    </div>
                ))}
            </div>
          ) : (
             <ScrollArea className="max-h-36 pr-2 -mr-2"> {/* ScrollArea */}
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {recentActivities.map((activity) => (
                    <li key={activity.id} className="flex justify-between items-center hover:bg-muted/50 px-1 -mx-1 rounded transition-colors duration-150">
                        <span className="truncate pr-2">{activity.name} <span className="text-xs opacity-60">({activity.type})</span></span>
                        {/* Only render timestamp on client */}
                        {isClient && (
                            <span className="text-[11px] flex-shrink-0">
                                {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                            </span>
                        )}
                    </li>
                    ))}
                    {recentActivities.length === 0 && !isLoading && (
                        <p className="text-center text-sm text-muted-foreground py-4">No recent activity.</p>
                    )}
                </ul>
             </ScrollArea>
          )}
        </CardContent>
      </Card>

       {/* Friends List - Polished Look */}
      <Card className={cn("animate-fade-in opacity-0 [--fade-in-delay:350ms] shadow-sm hover:shadow-md transition-shadow duration-200", isLoading && "opacity-100")}>
         <CardHeader className="pb-3"> {/* Slightly more padding */}
            <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-green-400" /> Friends ({friends.length})
            </CardTitle>
             {/* Add Friend Input */}
             <form onSubmit={(e) => { e.preventDefault(); handleAddFriend(); }} className="flex items-center gap-2 pt-2">
                 <div className="relative flex-1">
                     <Input
                        type="text"
                        placeholder="Enter Kinect ID (e.g., KINECT#1234)"
                        className="bg-muted/50 text-sm h-9 pl-3 pr-10" // Adjust padding for button
                        value={friendIdInput}
                        onChange={(e) => setFriendIdInput(e.target.value)}
                        aria-label="Enter Kinect ID to add friend"
                        disabled={isAddingFriend || isLoading}
                        spellCheck="false"
                        autoCapitalize="characters"
                     />
                    <Button size="icon" type="submit" aria-label="Add Friend" disabled={isAddingFriend || !friendIdInput.trim() || isLoading} className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 flex-shrink-0">
                        {isAddingFriend ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    </Button>
                 </div>
            </form>
        </CardHeader>
        <CardContent>
           {/* Existing Friends List */}
           {isLoading ? (
               <div className="space-y-4 pt-1">
                 {[...Array(4)].map((_, i) => (
                    <div key={`friend-skel-${i}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <Skeleton className="h-4 w-20 rounded" />
                        </div>
                        <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                 ))}
               </div>
           ) : (
            <ScrollArea className="max-h-48 pr-2 -mr-2"> {/* ScrollArea */}
                <div className="space-y-2">
                    {friends.map(friend => (
                        <div key={friend.id} className="flex items-center justify-between group hover:bg-muted/50 p-2 -mx-2 rounded-md transition-colors duration-150 cursor-pointer interactive-hover"
                             onClick={() => handleFriendClick(friend)} // Call handler on click
                             role="button"
                             tabIndex={0}
                             aria-label={`Open chat with ${friend.name}`}
                             >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative flex-shrink-0">
                                    <Avatar className="h-9 w-9 border border-border/50">
                                        <AvatarImage src={friend.avatar || ''} alt={friend.name} />
                                        <AvatarFallback className="text-xs">{friend.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className={cn(
                                        "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-card",
                                        friend.status === 'online' ? 'bg-green-500' :
                                        friend.status === 'ingame' ? 'bg-blue-500' : 'bg-gray-400'
                                    )}></span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium truncate">{friend.name}</span>
                                    <span className="text-xs text-muted-foreground truncate">{friend.kinectId}</span>
                                </div>
                            </div>
                             {/* Keep status badge, add message icon on hover */}
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                 <MessageCircle className="h-4 w-4 text-primary" />
                                 <Badge
                                    variant={friend.status === 'online' ? 'secondary' : friend.status === 'ingame' ? 'default' : 'outline'}
                                    className={cn(
                                        "h-5 px-1.5 text-[10px] capitalize transition-colors flex-shrink-0 pointer-events-none", // Make badge non-interactive visually
                                        friend.status === 'online' && 'bg-green-500/10 text-green-600 border-green-500/20',
                                        friend.status === 'ingame' && 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                    )}
                                    >
                                    {friend.status}
                                 </Badge>
                             </div>
                              {/* Show only status badge when not hovered */}
                             <Badge
                                variant={friend.status === 'online' ? 'secondary' : friend.status === 'ingame' ? 'default' : 'outline'}
                                className={cn(
                                    "h-5 px-1.5 text-[10px] capitalize transition-colors flex-shrink-0 group-hover:opacity-0", // Hide on hover
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
            </ScrollArea>
           )}
        </CardContent>
      </Card>


      {/* My Files Section (Placeholder) - Simplified */}
       <Card className={cn("animate-fade-in opacity-0 [--fade-in-delay:450ms] shadow-sm hover:shadow-md transition-shadow duration-200", isLoading && "opacity-100")}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Folder className="h-5 w-5 text-orange-400" /> My Files
            </CardTitle>
             <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-primary" disabled={isLoading}>Manage</Button>
        </CardHeader>
        <CardContent>
             {isLoading ? (
                 <>
                    <Skeleton className="h-4 w-4/5 mb-3 rounded" />
                    <Skeleton className="h-9 w-full rounded-md" />
                 </>
             ) : (
                 <>
                    <p className="text-sm text-muted-foreground mb-3">Access your saved files and game data.</p>
                    <Button variant="outline" className="w-full h-9 text-sm interactive-hover">Browse Files</Button>
                 </>
             )}
        </CardContent>
      </Card>
    </div>
  );
}
