import { z } from 'zod';
import { APP_CONFIG } from './constants';

export const chatRequestSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  conversationId: z.string().uuid().nullable().optional(),
  personaId: z.string().optional(),
  personaSlug: z.string().optional(),
  personaPrompt: z.string().max(2000).optional(),
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(APP_CONFIG.MAX_MESSAGE_LENGTH, `Message must be less than ${APP_CONFIG.MAX_MESSAGE_LENGTH} characters`),
});

export const feedbackRequestSchema = z.object({
  messageId: z.string().uuid(),
  type: z.enum(['thumbs_up', 'thumbs_down', 'rating']),
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().max(500).optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
export type FeedbackRequestInput = z.infer<typeof feedbackRequestSchema>;

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '');
}
