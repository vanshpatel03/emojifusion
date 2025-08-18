// Implemented GenerateEmojiFusion flow using Gemini 2.0 Flash to generate a new emoji from two existing emojis.

'use server';

/**
 * @fileOverview Generates a new emoji by fusing two existing emojis using AI.
 *
 * - generateEmojiFusion - A function that handles the emoji fusion process.
 * - GenerateEmojiFusionInput - The input type for the generateEmojiFusion function.
 * - GenerateEmojiFusionOutput - The return type for the generateEmojiFusion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmojiFusionInputSchema = z.object({
  emoji1: z
    .string()
    .describe('The first emoji to fuse.'),
  emoji2: z
    .string()
    .describe('The second emoji to fuse.'),
});
export type GenerateEmojiFusionInput = z.infer<typeof GenerateEmojiFusionInputSchema>;

const GenerateEmojiFusionOutputSchema = z.object({
  fusedEmojiDataUri: z
    .string()
    .describe(
      "The data URI of the generated emoji image, that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateEmojiFusionOutput = z.infer<typeof GenerateEmojiFusionOutputSchema>;

export async function generateEmojiFusion(input: GenerateEmojiFusionInput): Promise<GenerateEmojiFusionOutput> {
  return generateEmojiFusionFlow(input);
}

const fusionPrompt = ai.definePrompt({
  name: 'generateEmojiFusionPrompt',
  input: {schema: GenerateEmojiFusionInputSchema},
  prompt: `You are an AI that can fuse two emojis together to create a new emoji.

  The first emoji is: {{{emoji1}}}
  The second emoji is: {{{emoji2}}}

  Create a new emoji that is a fusion of the two emojis.  The output should be an image of the new emoji.  It should still look like an emoji - a small, simple image with a transparent background. Do not include a border.
  `,
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

const generateEmojiFusionFlow = ai.defineFlow(
  {
    name: 'generateEmojiFusionFlow',
    inputSchema: GenerateEmojiFusionInputSchema,
    outputSchema: GenerateEmojiFusionOutputSchema,
  },
  async input => {
    const filledPrompt = await fusionPrompt.render(input);
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: filledPrompt.messages,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {fusedEmojiDataUri: media!.url!};
  }
);
