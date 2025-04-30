"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Users, Play } from 'lucide-react';
import { GameRecommender } from './game-recommender';
import { Skeleton } from '@/components/ui/skeleton';

// Placeholder Game type
interface Game {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  maxPlayers: number;
}

const availableGames: Game[] = [
  { id: 'tic-tac-toe', name: 'Tic Tac Toe', description: 'Classic Xs and Os.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>, maxPlayers: 2 },
  { id: 'chess', name: 'Chess', description: 'Strategic board game.', icon: <Gamepad2 />, maxPlayers: 2 },
  { id: 'checkers', name: 'Checkers', description: 'Classic checkers game.', icon: <Gamepad2 />, maxPlayers: 2 },
  // Add more games if needed
];

export function GameLobbyContent() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  // No need for isClient check here if BottomNavigation handles client-side rendering

  const handleStartGame = (game: Game) => {
    console.log(`Starting or joining ${game.name}`);
    // Add game start logic here
  };

  return (
    <div className="space-y-6 p-4">
        <div>
            <h3 className="text-md font-semibold mb-3 text-accent-foreground">Available Games</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableGames.map((game) => (
                    <Card
                    key={game.id}
                    className={`p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:shadow-md hover:border-accent ${
                        selectedGame?.id === game.id ? 'ring-2 ring-primary scale-105 bg-card/90 shadow-lg' : 'bg-muted/30 hover:bg-muted/60 hover:scale-102'
                    }`}
                    onClick={() => setSelectedGame(game)}
                    >
                    <div className="mb-2 text-primary animate-pulse">{game.icon}</div>
                    <h4 className="font-medium text-sm">{game.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{game.description}</p>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="mt-3 retro-glow w-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStartGame(game);
                        }}
                        aria-label={`Play ${game.name}`}
                    >
                        <Play className="mr-1 h-4 w-4" /> Play
                    </Button>
                    </Card>
                ))}
            </div>
        </div>
        <GameRecommender />
         {/* Placeholder for Find Players functionality */}
         <Card className="mt-6 border-dashed border-muted-foreground/50">
            <CardHeader>
                <CardTitle className="text-md flex items-center gap-2 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    Find Players
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Looking for someone to play with? Browse available players or create a public lobby.</p>
                <Button variant="outline" className="mt-4 w-full">Browse Players & Lobbies</Button>
            </CardContent>
         </Card>
    </div>
  );
}
