
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { recommendGame } from '@/ai/flows/game-recommendation';
import type { RecommendGameInput, RecommendGameOutput } from '@/ai/flows/game-recommendation';
import { Loader2, Lightbulb, AlertCircle, ThumbsUp, Sparkles } from 'lucide-react'; // Added Sparkles
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
      await new Promise(resolve => setTimeout(resolve, 1200)); // Slightly shorter delay
      const result = await recommendGame(input);
      setRecommendations(result);
    } catch (err) {
      console.error("Error getting recommendations:", err);
      let errorMessage = "AI couldn't fetch recommendations right now. Please try again."; // More user-friendly message
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
    // Enhanced card styling with softer shadow and border
    <Card className="border-accent/30 bg-gradient-to-br from-card/95 via-card to-accent/10 shadow-lg shadow-accent/5 transition-all duration-300 hover:shadow-accent/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-md font-semibold text-accent-foreground">
            <Sparkles className="h-5 w-5 text-accent" /> {/* Use Sparkles icon */}
            AI Game Recommender
        </CardTitle>
        <CardDescription>Get personalized game suggestions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         {/* Only render button and results on client */}
         {!isClient ? (
             <>
                <Skeleton className="h-10 w-full mb-4 rounded-md" /> {/* Skeleton for button */}
                <Skeleton className="h-24 w-full rounded-lg" /> {/* Skeleton for potential result */}
             </>
         ) : (
            <>
                <Button
                    onClick={handleGetRecommendations}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-accent via-primary/20 to-accent text-accent-foreground hover:shadow-md interactive-hover" // Gradient button
                    aria-live="polite" // Announce loading state changes
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Thinking...
                        </>
                    ) : (
                       <>
                         <Lightbulb className="mr-2 h-4 w-4" /> {/* Use Lightbulb */}
                         Suggest Games
                       </>
                    )}
                </Button>

                {/* Use skeleton for loading state inside results area */}
                {isLoading && !error && (
                    <div className="mt-4 space-y-3 p-4 rounded-lg border border-border/30 bg-muted/20 animate-pulse">
                         <Skeleton className="h-5 w-32 mb-2 rounded" /> {/* Title Skeleton */}
                         <Skeleton className="h-4 w-full rounded" />
                         <Skeleton className="h-4 w-5/6 rounded" />
                         <Skeleton className="h-3 w-20 mt-4 pt-2 border-t border-border/30 rounded" /> {/* Reasoning Title Skeleton */}
                         <Skeleton className="h-3 w-full rounded" />
                         <Skeleton className="h-3 w-full rounded" />
                    </div>
                )}

                {error && !isLoading && (
                    <Alert variant="destructive" className="mt-4 animate-fade-in">
                         <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Recommendation Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {recommendations && !isLoading && !error && (
                    // Enhanced results display
                    <div className="mt-4 space-y-3 p-4 rounded-lg border border-primary/40 bg-gradient-to-tr from-card/60 to-primary/10 animate-fade-in">
                        <h4 className="font-semibold text-sm text-primary flex items-center gap-1.5">
                           <ThumbsUp className="h-4 w-4" /> Here are your recommendations:
                        </h4>
                        <ul className="list-disc list-outside ml-5 space-y-1.5 text-sm text-foreground/90 marker:text-primary marker:text-xs">
                            {recommendations.gameRecommendations.map((game, index) => (
                                <li key={index} className="pl-1">{game}</li>
                            ))}
                            {recommendations.gameRecommendations.length === 0 && (
                                <li className="text-muted-foreground italic">No specific recommendations found based on input.</li>
                            )}
                        </ul>
                        {recommendations.reasoning && (
                            <div className="pt-3 border-t border-border/50 mt-3">
                                <h5 className="font-semibold text-xs text-muted-foreground mb-1.5">Reasoning:</h5>
                                <p className="text-xs text-muted-foreground/80 italic">{recommendations.reasoning}</p>
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
