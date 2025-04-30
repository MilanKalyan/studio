"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Star, Users, Clock, UserPlus, Search, Loader2 } from "lucide-react";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

const placeholderFriends = [
     { id: 'alice', name: 'Alice', avatar: 'https://picsum.photos/seed/alice/40/40', status: 'online'},
     { id: 'charlie', name: 'Charlie', avatar: 'https://picsum.photos/seed/charlie/40/40', status: 'offline'},
     { id: 'dave', name: 'Dave', avatar: 'https://picsum.photos/seed/dave/40/40', status: 'ingame'},
     { id: 'eve', name: 'Eve', avatar: 'https://picsum.photos/seed/eve/40/40', status: 'online'},
     { id: 'frank', name: 'Frank', avatar: 'https://picsum.photos/seed/frank/40/40', status: 'offline'},
];


export function MySpaceContent() {
  const { toast } = useToast();
  const [friendIdInput, setFriendIdInput] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state for sections
  const [recentActivities, setRecentActivities] = useState<typeof placeholderRecentActivities>([]);
  const [favoriteGames, setFavoriteGames] = useState<typeof placeholderFavoriteGames>([]);
  const [friends, setFriends] = useState<typeof placeholderFriends>([]);
   const [isClient, setIsClient] = useState(false);


  useEffect(() => {
      setIsClient(true);
      // Simulate loading data
      const timer = setTimeout(() => {
          setRecentActivities(placeholderRecentActivities);
          setFavoriteGames(placeholderFavoriteGames);
          setFriends(placeholderFriends);
          setIsLoading(false);
      }, 800); // Simulate loading delay

      return () => clearTimeout(timer);
  }, []);


   const handleAddFriend = async () => {
     const trimmedId = friendIdInput.trim();
     if (trimmedId) {
         setIsAddingFriend(true);
         console.log(`Attempting to add friend with ID: ${trimmedId}`);
         // Simulate API call
         await new Promise(resolve => setTimeout(resolve, 1000));

         // Simulate success/failure
         const success = Math.random() > 0.3; // 70% success rate

         if (success) {
             toast({
                 title: "Friend Request Sent",
                 description: `Friend request sent to ${trimmedId}.`,
                 duration: 3000,
             });
             setFriendIdInput(''); // Clear input on success
         } else {
             toast({
                 variant: "destructive",
                 title: "Friend Not Found",
                 description: `Could not find a user with ID ${trimmedId}.`,
                 duration: 4000,
             });
         }
         setIsAddingFriend(false);
     } else {
         toast({
             variant: "destructive",
             title: "Invalid ID",
             description: "Please enter a valid Kinect ID.",
             duration: 3000,
         });
     }
   };

  return (
    <div className="space-y-6 p-4 pb-10">
      {/* Profile Summary (Could be enhanced) */}
      <Card className={cn("animate-fade-in opacity-0 [--fade-in-delay:50ms]", isLoading && "opacity-100")}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Your Space</CardTitle>
          <CardDescription>Quick access to your favorites and activities.</CardDescription>
        </CardHeader>
         {/* Content removed, can be added back if needed */}
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
                     {favoriteGames.slice(0, 3).map(game => ( // Show only first 3 for brevity
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
            <ul className="space-y-2 text-sm text-muted-foreground max-h-36 overflow-y-auto pr-1"> {/* Limit height */}
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
                <Users className="h-5 w-5 text-green-500" /> Friends
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
                <Button size="sm" type="submit" aria-label="Add Friend" disabled={isAddingFriend || !friendIdInput.trim() || isLoading} className="h-9 w-9 p-0">
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
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1"> {/* Limit height */}
                {friends.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between hover:bg-muted/50 px-1 -mx-1 rounded transition-colors cursor-pointer"
                         onClick={() => { /* Open chat or profile */ }}>
                        <div className="flex items-center gap-2 min-w-0"> {/* Allow truncation */}
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
