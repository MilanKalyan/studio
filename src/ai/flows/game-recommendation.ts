'use server';
/**
 * @fileOverview An AI agent for recommending games to users.
 *
 * - recommendGame - A function that recommends games based on user profile, play history, and connections.
 * - RecommendGameInput - The input type for the recommendGame function.
 * - RecommendGameOutput - The return type for the recommendGame function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RecommendGameInputSchema = z.object({
  userProfile: z
    .string()
    .describe('A description of the user profile, including preferences.'),
  playHistory: z.string().describe('The user play history.'),
  socialConnections: z
    .string()
    .describe('The user social connections and their game preferences.'),
});
export type RecommendGameInput = z.infer<typeof RecommendGameInputSchema>;

const RecommendGameOutputSchema = z.object({
  gameRecommendations: z
    .array(z.string())
    .describe('A list of game recommendations for the user.'),
  reasoning: z.string().describe('The reasoning behind the game recommendations.'),
});
export type RecommendGameOutput = z.infer<typeof RecommendGameOutputSchema>;

export async function recommendGame(input: RecommendGameInput): Promise<RecommendGameOutput> {
  return recommendGameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendGamePrompt',
  input: {
    schema: z.object({
      userProfile: z
        .string()
        .describe('A description of the user profile, including preferences.'),
      playHistory: z.string().describe('The user play history.'),
      socialConnections: z
        .string()
        .describe('The user social connections and their game preferences.'),
    }),
  },
  output: {
    schema: z.object({
      gameRecommendations: z
        .array(z.string())
        .describe('A list of game recommendations for the user.'),
      reasoning: z.string().describe('The reasoning behind the game recommendations.'),
    }),
  },
  prompt: `You are an expert game recommender. Based on the user profile, play history, and social connections, you will recommend games that the user might enjoy.

User Profile: {{{userProfile}}}
Play History: {{{playHistory}}}
Social Connections: {{{socialConnections}}}

Please provide a list of game recommendations and the reasoning behind them.
`,
});

const recommendGameFlow = ai.defineFlow<
  typeof RecommendGameInputSchema,
  typeof RecommendGameOutputSchema
>(
  {
    name: 'recommendGameFlow',
    inputSchema: RecommendGameInputSchema,
    outputSchema: RecommendGameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
