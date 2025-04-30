"use client";

import { useState, useEffect } from 'react'; // Import useEffect
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { recommendGame } from '@/ai/flows/game-recommendation'; // Import the server action
import type { RecommendGameInput, RecommendGameOutput } from '@/ai/flows/game-recommendation';
import { Loader2, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

export function GameRecommender() {
  const [recommendations, setRecommendations] = useState<RecommendGameOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // State to track client-side mount

  useEffect(() => {
    // Set isClient to true after component mounts
    setIsClient(true);
  }, []);


  // Placeholder user data - replace with actual data fetching
  const userProfile = "Loves retro arcade games and puzzle games. Prefers cooperative play.";
  const playHistory = "Played Tic Tac Toe (5 times), Chess (2 times).";
  const socialConnections = "Friends Alice and Charlie enjoy Chess.";

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    const input: RecommendGameInput = {
      userProfile,
      playHistory,
      socialConnections,
    };

    try {
      const result = await recommendGame(input);
      setRecommendations(result);
    } catch (err) {
      console.error("Error getting recommendations:", err);
      setError("Failed to get game recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-accent/50 bg-background/60 shadow-md shadow-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-md">
            <Lightbulb className="h-5 w-5 text-accent" />
            AI Game Recommender
        </CardTitle>
        <CardDescription>Get personalized game suggestions based on your profile and history.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         {/* Only render button and results on client to prevent hydration mismatch */}
         {isClient ? (
            <>
                <Button
                    onClick={handleGetRecommendations}
                    disabled={isLoading}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Getting Recommendations...
                        </>
                    ) : (
                        'Recommend Games For Me'
                    )}
                </Button>

                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {recommendations && (
                    <div className="mt-4 space-y-3 p-3 rounded-md border border-primary/30 bg-card/50">
                        <h4 className="font-semibold text-sm text-secondary">Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                            {recommendations.gameRecommendations.map((game, index) => (
                                <li key={index}>{game}</li>
                            ))}
                        </ul>
                        <div className="pt-2 border-t border-border/50 mt-3">
                            <h5 className="font-semibold text-xs text-muted-foreground mb-1">Reasoning:</h5>
                            <p className="text-xs text-muted-foreground">{recommendations.reasoning}</p>
                        </div>
                    </div>
                )}
            </>
         ) : (
            <>
                <Skeleton className="h-10 w-full" /> {/* Skeleton for the button */}
                {/* Optional: Skeleton for potential result area */}
                {/* <Skeleton className="h-24 w-full mt-4" /> */}
            </>
         )}
      </CardContent>
    </Card>
  );
}
