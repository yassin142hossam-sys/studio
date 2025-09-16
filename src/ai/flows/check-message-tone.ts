'use server';

/**
 * @fileOverview AI-powered emotional tone checker for messages.
 *
 * - checkMessageTone - Analyzes the emotional tone of a given message.
 * - CheckMessageToneInput - The input type for the checkMessageTone function.
 * - CheckMessageToneOutput - The return type for the checkMessageTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckMessageToneInputSchema = z.object({
  message: z
    .string()
    .describe('The message to be sent to the parent.'),
});
export type CheckMessageToneInput = z.infer<typeof CheckMessageToneInputSchema>;

const CheckMessageToneOutputSchema = z.object({
  tone: z.string().describe('The emotional tone of the message (e.g., positive, negative, neutral).'),
  appropriateness: z.string().describe('An assessment of the message appropriateness for parental communication.'),
  suggestions: z.string().describe('Suggestions for improving the message tone and appropriateness.'),
});
export type CheckMessageToneOutput = z.infer<typeof CheckMessageToneOutputSchema>;

export async function checkMessageTone(input: CheckMessageToneInput): Promise<CheckMessageToneOutput> {
  return checkMessageToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkMessageTonePrompt',
  input: {schema: CheckMessageToneInputSchema},
  output: {schema: CheckMessageToneOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing the emotional tone and appropriateness of messages for parental communication. The goal is to ensure that the messages are professional, respectful, and convey the intended information effectively.

Analyze the following message and determine its tone, appropriateness, and provide suggestions for improvement.

Message: {{{message}}}

Consider the following aspects:
- Emotional Tone: Is the message positive, negative, neutral, or mixed?
- Appropriateness: Is the message suitable for sending to a parent? Does it contain any language that could be considered offensive, disrespectful, or unprofessional?
- Clarity: Is the message clear and easy to understand?
- Conciseness: Is the message concise and to the point?

Respond with the tone, appropriateness, and suggestions for improvement.

Output in JSON format:
{
  "tone": "",
  "appropriateness": "",
  "suggestions": ""
}
`,
});

const checkMessageToneFlow = ai.defineFlow(
  {
    name: 'checkMessageToneFlow',
    inputSchema: CheckMessageToneInputSchema,
    outputSchema: CheckMessageToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
