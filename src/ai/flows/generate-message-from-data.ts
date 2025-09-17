'use server';

/**
 * @fileOverview AI-powered message generator from student data.
 *
 * - generateMessageFromData - Generates a message to a parent based on student data.
 * - GenerateMessageFromDataInput - The input type for the generateMessageFromData function.
 * - GenerateMessageFromDataOutput - The return type for the generateMessageFromData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Student } from '@/lib/types';

const GenerateMessageFromDataInputSchema = z.object({
    student: z.any().describe("The student's data object.")
});

export type GenerateMessageFromDataInput = { student: Student };

const GenerateMessageFromDataOutputSchema = z.object({
  message: z.string().describe('The generated message to the parent.'),
});
export type GenerateMessageFromDataOutput = z.infer<typeof GenerateMessageFromDataOutputSchema>;

export async function generateMessageFromData(input: GenerateMessageFromDataInput): Promise<GenerateMessageFromDataOutput> {
  return generateMessageFromDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMessageFromDataPrompt',
  input: {schema: GenerateMessageFromDataInputSchema},
  output: {schema: GenerateMessageFromDataOutputSchema},
  prompt: `You are an AI assistant for a teacher. Your task is to generate a concise, friendly, and professional message to a student's parent based on their recent performance data.

The data provided is a JSON object representing the student.

Student Data:
{{{json student}}}

Based on this data, write a message to the parent. The message should summarize the student's performance, highlighting any areas of concern or praise. Keep the tone supportive and constructive.

Output in JSON format:
{
  "message": ""
}
`,
});

const generateMessageFromDataFlow = ai.defineFlow(
  {
    name: 'generateMessageFromDataFlow',
    inputSchema: GenerateMessageFromDataInputSchema,
    outputSchema: GenerateMessageFromDataOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
