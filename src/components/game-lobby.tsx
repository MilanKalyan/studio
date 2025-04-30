"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Users, Play } from 'lucide-react';
import { GameRecommender } from './game-recommender'; // Assuming GameRecommender exists

// Placeholder Game type
interface Game {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode; // Can be an icon component or image path
  maxPlayers: number;
}

const availableGames: Game[] = [
  { id: 'tic-tac-toe', name: 'Tic Tac Toe', description: 'Classic Xs and Os.', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>, maxPlayers: 2 },
  { id: 'chess', name: 'Chess', description: 'Strategic board game.', icon: <Gamepad2 />, maxPlayers: 2 }, // Using Gamepad2 as placeholder
  { id: 'checkers', name: 'Checkers', description: 'Classic checkers game.', icon: <Gamepad2 />, maxPlayers: 2 }, // Using Gamepad2 as placeholder
];

export function GameLobby() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleStartGame = (game: Game) => {
    // Placeholder for starting/joining a game session
    console.log(`Starting or joining ${game.name}`);
    // This would typically involve routing to a game page or opening a game modal/component
  };

  return (
    <Card className="w-full border-secondary/50 shadow-lg shadow-secondary/10">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border p-4">
         <div className="flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <CardTitle className="text-lg font-semibold">Game Lobby</CardTitle>
         </div>
          <Button variant="ghost" size="icon">
            <Users className="h-5 w-5" />
            <span className="sr-only">Find Players</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div>
            <h3 className="text-md font-semibold mb-3 text-accent">Available Games</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableGames.map((game) => (
                <Card
                key={game.id}
                className={`p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                    selectedGame?.id === game.id ? 'ring-2 ring-accent scale-105 bg-card/90' : 'hover:bg-muted/50 hover:scale-102'
                }`}
                onClick={() => setSelectedGame(game)}
                >
                <div className="mb-2 text-accent">{game.icon}</div>
                <h4 className="font-medium text-sm">{game.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{game.description}</p>
                <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3 retro-glow"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when clicking button
                      handleStartGame(game);
                    }}
                >
                    <Play className="mr-1 h-4 w-4" /> Play
                </Button>
                </Card>
            ))}
            </div>
        </div>

        <GameRecommender />

      </CardContent>
    </Card>
  );
}
