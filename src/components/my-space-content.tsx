"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Star, Users, Clock } from "lucide-react";
import Image from 'next/image'; // Import next/image

export function MySpaceContent() {
  // Placeholder data - replace with actual user data fetching
  const recentActivities = [
    { id: 1, type: "game", name: "Tic Tac Toe", time: "5 minutes ago" },
    { id: 2, type: "chat", name: "Global Chat", time: "1 hour ago" },
    { id: 3, type: "profile", name: "Updated bio", time: "Yesterday" },
  ];

  const favoriteGames = [
    { id: 'tic-tac-toe', name: 'Tic Tac Toe', img: 'https://picsum.photos/seed/tictactoe/100/100' },
    { id: 'chess', name: 'Chess', img: 'https://picsum.photos/seed/chess/100/100' },
  ];

  const friends = [
     { id: 'alice', name: 'Alice', avatar: 'https://picsum.photos/seed/alice/40/40', status: 'online'},
     { id: 'charlie', name: 'Charlie', avatar: 'https://picsum.photos/seed/charlie/40/40', status: 'offline'},
     { id: 'dave', name: 'Dave', avatar: 'https://picsum.photos/seed/dave/40/40', status: 'ingame'},
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Profile Summary (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Space</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Welcome back, User!</p>
          {/* Add more profile details here */}
        </CardContent>
      </Card>

       {/* Favorite Games */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" /> Favorite Games
            </CardTitle>
             <Button variant="ghost" size="sm">See All</Button>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-3 gap-4">
                 {favoriteGames.map(game => (
                    <div key={game.id} className="flex flex-col items-center text-center">
                         <Image
                            src={game.img}
                            alt={game.name}
                            width={80}
                            height={80}
                            className="rounded-lg mb-2 shadow-md hover:scale-105 transition-transform"
                         />
                         <span className="text-xs font-medium">{game.name}</span>
                    </div>
                 ))}
            </div>
        </CardContent>
      </Card>


      {/* Recent Activity */}
      <Card>
         <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" /> Recent Activity
            </CardTitle>
             <Button variant="ghost" size="sm">Clear</Button>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="flex justify-between items-center">
                <span>{activity.name} ({activity.type})</span>
                <span className="text-xs">{activity.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

       {/* Friends List */}
      <Card>
         <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" /> Friends
            </CardTitle>
             <Button variant="ghost" size="sm">Manage</Button>
        </CardHeader>
        <CardContent>
           <div className="space-y-3">
             {friends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                             <Image src={friend.avatar} alt={friend.name} width={32} height={32} className="rounded-full" />
                             <span className={cn(
                                "absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-card",
                                friend.status === 'online' ? 'bg-green-500' :
                                friend.status === 'ingame' ? 'bg-blue-500' : 'bg-gray-400'
                             )}></span>
                        </div>
                        <span className="text-sm font-medium">{friend.name}</span>
                    </div>
                    <span className={cn(
                        "text-xs capitalize",
                         friend.status === 'online' ? 'text-green-500' :
                         friend.status === 'ingame' ? 'text-blue-500' : 'text-muted-foreground'
                    )}>{friend.status}</span>
                </div>
             ))}
           </div>
        </CardContent>
      </Card>


      {/* Add more sections like Documents, Saved Items etc. */}
       <Card>
        <CardHeader>
            <CardTitle className="text-md font-medium flex items-center gap-2">
                <Folder className="h-5 w-5 text-orange-500" /> My Files (Placeholder)
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">Organize your documents, images, and saved game states here.</p>
            <Button variant="outline" className="mt-4 w-full">Browse Files</Button>
        </CardContent>
      </Card>
    </div>
  );
}
