'use server';
/**
 * @fileOverview A Genkit flow that generates a compelling description for a farm yield.
 *
 * - generateYieldDescription - A function that handles the yield description generation process.
 * - GenerateYieldDescriptionInput - The input type for the generateYieldDescription function.
 * - GenerateYieldDescriptionOutput - The return type for the generateYieldDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateYieldDescriptionInputSchema = z.object({
  yieldType: z
    .string()
    .describe('The type of farm yield (e.g., Organic Apples, Fresh Milk).'),
  characteristics: z
    .array(z.string())
    .describe('Key characteristics and features of the yield (e.g., locally grown, sweet, crunchy).'),
});
export type GenerateYieldDescriptionInput = z.infer<typeof GenerateYieldDescriptionInputSchema>;

const GenerateYieldDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('A compelling and attractive description for the farm yield.'),
});
export type GenerateYieldDescriptionOutput = z.infer<typeof GenerateYieldDescriptionOutputSchema>;

export async function generateYieldDescription(
  input: GenerateYieldDescriptionInput
): Promise<GenerateYieldDescriptionOutput> {
  return generateYieldDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateYieldDescriptionPrompt',
  input: {schema: GenerateYieldDescriptionInputSchema},
  output: {schema: GenerateYieldDescriptionOutputSchema},
  prompt: `You are an AI assistant specializing in creating compelling and attractive product descriptions for farm yields.
Your goal is to help farmers write engaging listings quickly and efficiently.

Generate a compelling description for the following farm yield:

Yield Type: {{{yieldType}}}

Key Characteristics:
{{#each characteristics}}
- {{{this}}}
{{/each}}

The description should be concise, highlight the unique selling points, and evoke a sense of freshness and quality.
Do not include any greeting or conversational text; provide only the description.`,
});

const generateYieldDescriptionFlow = ai.defineFlow(
  {
    name: 'generateYieldDescriptionFlow',
    inputSchema: GenerateYieldDescriptionInputSchema,
    outputSchema: GenerateYieldDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
