'use server';

/**
 * @fileOverview A GenAI-powered tool that suggests improvements to package itineraries based on current travel conditions and user preferences.
 *
 * - enhancePackageItinerary - A function that enhances the package itinerary.
 * - PackageItineraryEnhancementInput - The input type for the enhancePackageItinerary function.
 * - PackageItineraryEnhancementOutput - The return type for the enhancePackageItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PackageItineraryEnhancementInputSchema = z.object({
  itinerary: z.string().describe('The current itinerary of the travel package.'),
  travelConditions: z.string().describe('Current travel conditions and alerts for the destinations in the itinerary.'),
  userPreferences: z.string().describe('User preferences for the travel package.'),
});
export type PackageItineraryEnhancementInput = z.infer<
  typeof PackageItineraryEnhancementInputSchema
>;

const PackageItineraryEnhancementOutputSchema = z.object({
  enhancedItinerary: z
    .string()
    .describe('The enhanced itinerary of the travel package.'),
  reasoning: z.string().describe('The reasoning behind the suggested enhancements.'),
});
export type PackageItineraryEnhancementOutput = z.infer<
  typeof PackageItineraryEnhancementOutputSchema
>;

export async function enhancePackageItinerary(
  input: PackageItineraryEnhancementInput
): Promise<PackageItineraryEnhancementOutput> {
  return enhancePackageItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'packageItineraryEnhancementPrompt',
  input: {schema: PackageItineraryEnhancementInputSchema},
  output: {schema: PackageItineraryEnhancementOutputSchema},
  prompt: `You are an expert travel consultant. Given the current itinerary, travel conditions, and user preferences, suggest improvements to the itinerary.

Itinerary:
{{itinerary}}

Travel Conditions:
{{travelConditions}}

User Preferences:
{{userPreferences}}

Provide an enhanced itinerary and explain the reasoning behind the changes.

Enhanced Itinerary:`, // Ensure the model continues from here
});

const enhancePackageItineraryFlow = ai.defineFlow(
  {
    name: 'enhancePackageItineraryFlow',
    inputSchema: PackageItineraryEnhancementInputSchema,
    outputSchema: PackageItineraryEnhancementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
