"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { recommendGame } from '@/ai/flows/game-recommendation';
import type { RecommendGameInput, RecommendGameOutput } from '@/ai/flows/game-recommendation';
import { Loader2, Lightbulb, AlertCircle, ThumbsUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils'; // Ensure cn is imported

export function GameRecommender() {
  const [recommendations, setRecommendations] = useState<RecommendGameOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  // Placeholder user data - replace with actual data fetching
  const userProfile = "Loves retro arcade games and puzzle games. Prefers cooperative play.";
  const playHistory = "Played Tic Tac Toe (5 times), Chess (2 times).";
  const socialConnections = "Friends Alice and Charlie enjoy Chess.";

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null); // Clear previous recommendations

    const input: RecommendGameInput = {
      userProfile,
      playHistory,
      socialConnections,
    };

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      const result = await recommendGame(input);
      setRecommendations(result);
    } catch (err) {
      console.error("Error getting recommendations:", err);
      let errorMessage = "Failed to get game recommendations. Please try again.";
       if (err instanceof Error) {
           // Check for specific error messages if needed
           // errorMessage = err.message; // Be cautious about exposing raw error messages
       }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-accent/50 bg-gradient-to-br from-card via-card to-accent/5 shadow-md shadow-accent/5 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-md font-semibold text-accent-foreground">
            <Lightbulb className="h-5 w-5 text-accent" />
            AI Game Recommender
        </CardTitle>
        <CardDescription>Get personalized game suggestions based on your profile and play style.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         {/* Only render button and results on client */}
         {!isClient ? (
             <>
                <Skeleton className="h-10 w-full mb-4" /> {/* Skeleton for button */}
                <Skeleton className="h-24 w-full" /> {/* Skeleton for potential result */}
             </>
         ) : (
            <>
                <Button
                    onClick={handleGetRecommendations}
                    disabled={isLoading}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 transform hover:scale-[1.02] active:scale-100"
                    aria-live="polite" // Announce loading state changes
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Finding Your Next Game...
                        </>
                    ) : (
                       <>
                         <ThumbsUp className="mr-2 h-4 w-4" /> Recommend Games For Me
                       </>
                    )}
                </Button>

                {/* Use skeleton for loading state inside results area */}
                {isLoading && !error && (
                    <div className="mt-4 space-y-3 p-3 rounded-md border border-border/50 bg-muted/30 animate-pulse">
                         <Skeleton className="h-4 w-24 mb-2" /> {/* Title Skeleton */}
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-5/6" />
                         <Skeleton className="h-3 w-16 mt-3 pt-2 border-t border-border/50" /> {/* Reasoning Title Skeleton */}
                         <Skeleton className="h-3 w-full" />
                         <Skeleton className="h-3 w-full" />
                    </div>
                )}

                {error && !isLoading && (
                    <Alert variant="destructive" className="mt-4 animate-fade-in">
                         <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Oops!</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {recommendations && !isLoading && !error && (
                    <div className="mt-4 space-y-3 p-3 rounded-md border border-primary/30 bg-card/50 animate-fade-in">
                        <h4 className="font-semibold text-sm text-secondary">Here are some suggestions:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90 marker:text-secondary">
                            {recommendations.gameRecommendations.map((game, index) => (
                                <li key={index} className="pl-1">{game}</li>
                            ))}
                        </ul>
                        {recommendations.reasoning && (
                            <div className="pt-2 border-t border-border/50 mt-3">
                                <h5 className="font-semibold text-xs text-muted-foreground mb-1">Why these?</h5>
                                <p className="text-xs text-muted-foreground italic">{recommendations.reasoning}</p>
                            </div>
                        )}
                    </div>
                )}
            </>
         )}
      </CardContent>
    </Card>
  );
}
