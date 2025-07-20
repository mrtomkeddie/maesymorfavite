// src/ai/flows/suggest-announcement-copy.ts
'use server';
/**
 * @fileOverview A flow that suggests announcement copy based on a short prompt.
 *
 * - suggestAnnouncementCopy - A function that handles the announcement copy suggestion process.
 * - SuggestAnnouncementCopyInput - The input type for the suggestAnnouncementCopy function.
 * - SuggestAnnouncementCopyOutput - The return type for the suggestAnnouncementCopy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAnnouncementCopyInputSchema = z.string().describe('A short prompt for the announcement.');
export type SuggestAnnouncementCopyInput = z.infer<typeof SuggestAnnouncementCopyInputSchema>;

const SuggestAnnouncementCopyOutputSchema = z.string().describe('The suggested announcement copy.');
export type SuggestAnnouncementCopyOutput = z.infer<typeof SuggestAnnouncementCopyOutputSchema>;

export async function suggestAnnouncementCopy(input: SuggestAnnouncementCopyInput): Promise<SuggestAnnouncementCopyOutput> {
  return suggestAnnouncementCopyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAnnouncementCopyPrompt',
  input: {schema: SuggestAnnouncementCopyInputSchema},
  output: {schema: SuggestAnnouncementCopyOutputSchema},
  prompt: `You are a creative copywriter specializing in school announcements. Based on the following prompt, generate engaging and informative announcement copy.

Prompt: {{{$input}}}`,
});

const suggestAnnouncementCopyFlow = ai.defineFlow(
  {
    name: 'suggestAnnouncementCopyFlow',
    inputSchema: SuggestAnnouncementCopyInputSchema,
    outputSchema: SuggestAnnouncementCopyOutputSchema,
  },
  async input => {
    const {text} = await ai.generate({
      prompt: await prompt(input),
      model: 'googleai/gemini-2.0-flash',
      config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
        ],
      },
    });
    return text!;
  }
);
