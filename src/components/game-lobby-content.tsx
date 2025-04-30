"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Users, Play, X, Check, Search } from 'lucide-react';
import { GameRecommender } from './game-recommender';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


// Placeholder Game type
interface Game {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode; // Use Lucide icons or SVGs
  category: string;
  maxPlayers: number;
}

// Placeholder Player type
interface Player {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'ingame';
}

const availableGames: Game[] = [
  { id: 'tic-tac-toe', name: 'Tic Tac Toe', description: 'Classic Xs and Os.', icon: <X className="h-5 w-5 group-hover:hidden" />, category: 'Classic', maxPlayers: 2 }, // Replace O with Check on hover?
  { id: 'chess', name: 'Chess', description: 'Strategic board game.', icon: <Gamepad2 />, category: 'Strategy', maxPlayers: 2 },
  { id: 'checkers', name: 'Checkers', description: 'Classic checkers game.', icon: <Gamepad2 />, category: 'Classic', maxPlayers: 2 },
  { id: 'connect-four', name: 'Connect Four', description: 'Drop discs, get four in a row.', icon: <Gamepad2 />, category: 'Classic', maxPlayers: 2 },
  // Add more games
];

const onlinePlayers: Player[] = [
    { id: 'alice', name: 'Alice', avatar: 'https://picsum.photos/seed/alice/40/40', status: 'online' },
    { id: 'charlie', name: 'Charlie', avatar: 'https://picsum.photos/seed/charlie/40/40', status: 'ingame' },
    { id: 'dave', name: 'Dave', avatar: 'https://picsum.photos/seed/dave/40/40', status: 'online' },
    { id: 'eve', name: 'Eve', avatar: 'https://picsum.photos/seed/eve/40/40', status: 'online' },
];

export function GameLobbyContent() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial content
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
      setIsClient(true);
      // Simulate loading delay for content
      const timer = setTimeout(() => setIsLoading(false), 700);
      return () => clearTimeout(timer);
  }, []);

  const handleStartGame = (game: Game) => {
    console.log(`Starting or joining ${game.name}`);
    toast({
        title: `Joining ${game.name}`,
        description: "Setting up the game lobby...",
        duration: 3000,
    });
    // Add actual game start/join logic here (e.g., navigate to game screen, API call)
  };

  const handleInvitePlayer = (player: Player) => {
      console.log(`Inviting ${player.name} to ${selectedGame?.name || 'a game'}`);
      toast({
          title: "Invite Sent",
          description: `Invited ${player.name} to play ${selectedGame?.name || 'a game'}.`,
          duration: 3000,
      });
      // Add actual invite logic here
  };


  return (
    <div className="space-y-6 p-4">
        {/* Available Games Section */}
        <Card className={cn("animate-fade-in opacity-0 [--fade-in-delay:100ms]", isLoading && "opacity-100")}>
            <CardHeader>
                <CardTitle className="text-md font-semibold flex items-center gap-2 text-accent-foreground">
                    <Gamepad2 className="h-5 w-5" /> Available Games
                </CardTitle>
                <CardDescription>Choose a game to play or browse recommendations.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={`game-skel-${i}`} className="h-36 rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableGames.map((game) => (
                            <Card
                                key={game.id}
                                className={cn(
                                    `p-3 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 hover:shadow-md group`,
                                    `border-2 border-transparent hover:border-secondary`, // Subtle border on hover
                                    selectedGame?.id === game.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background bg-card/90 shadow-lg scale-105' : 'bg-muted/30 hover:bg-muted/50 hover:scale-[1.02]'
                                )}
                                onClick={() => setSelectedGame(game)}
                                role="button"
                                tabIndex={0}
                                aria-pressed={selectedGame?.id === game.id}
                                aria-label={`Select ${game.name}`}
                            >
                                <div className="flex flex-col items-center flex-1 mb-2">
                                    <div className="mb-2 text-primary h-6 w-6 flex items-center justify-center">{game.icon}</div>
                                    <h4 className="font-medium text-sm leading-tight">{game.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{game.description}</p>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="mt-2 retro-glow w-full h-8 text-xs"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click when clicking button
                                        handleStartGame(game);
                                    }}
                                    aria-label={`Play ${game.name}`}
                                >
                                    <Play className="mr-1 h-3 w-3" /> Play
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* AI Recommender Section */}
         <div className={cn("animate-fade-in opacity-0 [--fade-in-delay:250ms]", isLoading && "opacity-100")}>
            <GameRecommender />
        </div>

         {/* Find Players Section */}
         <Card className={cn("animate-fade-in opacity-0 [--fade-in-delay:400ms]", isLoading && "opacity-100")}>
            <CardHeader>
                <CardTitle className="text-md font-semibold flex items-center gap-2 text-accent-foreground">
                    <Users className="h-5 w-5" /> Online Players
                </CardTitle>
                 <div className="relative mt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search players..." className="pl-8 h-9 bg-muted/50" />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={`player-skel-${i}`} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-md" />
                            </div>
                         ))}
                    </div>
                ) : onlinePlayers.length > 0 ? (
                     <div className="space-y-3 max-h-48 overflow-y-auto pr-1"> {/* Limit height and add scroll */}
                        {onlinePlayers.map((player) => (
                            <div key={player.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={player.avatar} alt={player.name} />
                                            <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                         <span className={cn(
                                            "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-card",
                                            player.status === 'online' ? 'bg-green-500' :
                                            player.status === 'ingame' ? 'bg-blue-500' : 'bg-gray-400'
                                         )}></span>
                                    </div>
                                    <span className="text-sm font-medium">{player.name}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-7 text-xs px-2 opacity-0 group-hover:opacity-100 transition-opacity",
                                        player.status === 'online' ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground cursor-not-allowed'
                                    )}
                                    onClick={() => player.status === 'online' && handleInvitePlayer(player)}
                                    disabled={player.status !== 'online'}
                                    aria-label={`Invite ${player.name} to game`}
                                >
                                    Invite
                                </Button>
                                {/* Show status badge when not hovering */}
                                 <Badge
                                      variant={player.status === 'online' ? 'secondary' : player.status === 'ingame' ? 'default' : 'outline'}
                                      className={cn(
                                          "h-5 px-1.5 text-[10px] group-hover:opacity-0 transition-opacity capitalize pointer-events-none",
                                          player.status === 'online' && 'bg-green-500/10 text-green-600 border-green-500/20',
                                          player.status === 'ingame' && 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                      )}
                                    >
                                     {player.status}
                                 </Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                     <p className="text-sm text-muted-foreground text-center py-4">No players online right now.</p>
                )}
                <Button variant="outline" className="mt-4 w-full h-9 text-sm">
                    Browse All Players & Lobbies
                </Button>
            </CardContent>
         </Card>
    </div>
  );
}
