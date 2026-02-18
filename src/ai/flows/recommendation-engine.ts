'use server';
/**
 * @fileOverview This file implements a Genkit flow for providing personalized yield and farmer recommendations.
 *
 * - yieldAndFarmerRecommendations - A function that handles the recommendation process.
 * - YieldAndFarmerRecommendationsInput - The input type for the yieldAndFarmerRecommendations function.
 * - YieldAndFarmerRecommendationsOutput - The return type for the yieldAndFarmerRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const YieldAndFarmerRecommendationsInputSchema = z.object({
  userId: z.string().describe('The unique identifier of the user.'),
  purchaseHistory: z.array(
    z.object({
      yieldId: z.string().describe('The ID of the purchased yield.'),
      yieldName: z.string().describe('The name of the purchased yield.'),
      farmerId: z.string().describe('The ID of the farmer who sold the yield.'),
      farmerName: z.string().describe('The name of the farmer who sold the yield.'),
      category: z.string().describe('The category of the purchased yield (e.g., "fruits", "vegetables").'),
      quantity: z.number().describe('The quantity of the purchased yield.'),
    })
  ).describe('A list of the user\'s past purchases, including details about the yield and farmer.').default([]),
  browsingHistory: z.array(
    z.object({
      yieldId: z.string().describe('The ID of the browsed yield.'),
      yieldName: z.string().describe('The name of the browsed yield.'),
      category: z.string().describe('The category of the browsed yield (e.g., "fruits", "vegetables").'),
    })
  ).describe('A list of yields the user has recently viewed.').default([]),
  preferences: z.array(z.string()).describe('A list of the user\'s stated preferences (e.g., "organic", "local produce", "berries").').default([]),
});
export type YieldAndFarmerRecommendationsInput = z.infer<typeof YieldAndFarmerRecommendationsInputSchema>;

const YieldAndFarmerRecommendationsOutputSchema = z.object({
  recommendedYields: z.array(
    z.object({
      yieldId: z.string().describe('The ID of the recommended yield.'),
      yieldName: z.string().describe('The name of the recommended yield.'),
      category: z.string().describe('The category of the recommended yield.'),
      reason: z.string().describe('A brief explanation for why this yield is recommended.'),
    })
  ).describe('A list of recommended farm yields based on user data.').default([]),
  recommendedFarmers: z.array(
    z.object({
      farmerId: z.string().describe('The ID of the recommended farmer.'),
      farmerName: z.string().describe('The name of the recommended farmer.'),
      specialty: z.string().describe('The primary types of yields this farmer specializes in (e.g., "organic vegetables", "dairy products").'),
      reason: z.string().describe('A brief explanation for why this farmer is recommended.'),
    })
  ).describe('A list of recommended farmers based on user data.').default([]),
});
export type YieldAndFarmerRecommendationsOutput = z.infer<typeof YieldAndFarmerRecommendationsOutputSchema>;

export async function yieldAndFarmerRecommendations(input: YieldAndFarmerRecommendationsInput): Promise<YieldAndFarmerRecommendationsOutput> {
  return yieldAndFarmerRecommendationsFlow(input);
}

const recommendationPrompt = ai.definePrompt({
  name: 'yieldAndFarmerRecommendationsPrompt',
  input: { schema: YieldAndFarmerRecommendationsInputSchema },
  output: { schema: YieldAndFarmerRecommendationsOutputSchema },
  prompt: `You are an AI-powered recommendation engine for FarmConnect, a platform connecting farmers and buyers. Your goal is to provide personalized recommendations for farm yields and farmers to a user.

Consider the user's past purchase history, browsing history, and explicit preferences to generate relevant and appealing recommendations.

User ID: {{{userId}}}

Purchase History:
{{#if purchaseHistory}}
  {{#each purchaseHistory}}
    - Yield: {{{yieldName}}} (ID: {{{yieldId}}}), Category: {{{category}}}, Farmer: {{{farmerName}}} (ID: {{{farmerId}}}), Quantity: {{{quantity}}}
  {{/each}}
{{else}}
  No purchase history available.
{{/if}}

Browsing History:
{{#if browsingHistory}}
  {{#each browsingHistory}}
    - Yield: {{{yieldName}}} (ID: {{{yieldId}}}), Category: {{{category}}}
  {{/each}}
{{else}}
  No browsing history available.
{{/if}}

User Preferences:
{{#if preferences}}
  {{#each preferences}}
    - {{{this}}}
  {{/each}}
{{else}}
  No specific preferences stated.
{{/if}}

Based on the provided information, recommend up to 5 farm yields and up to 3 farmers that the user might be interested in. For each recommendation, provide a brief, clear reason. Ensure the recommendations are diverse but relevant.`,
});

const yieldAndFarmerRecommendationsFlow = ai.defineFlow(
  {
    name: 'yieldAndFarmerRecommendationsFlow',
    inputSchema: YieldAndFarmerRecommendationsInputSchema,
    outputSchema: YieldAndFarmerRecommendationsOutputSchema,
  },
  async (input) => {
    const { output } = await recommendationPrompt(input);
    return output!;
  }
);
