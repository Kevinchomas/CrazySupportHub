import { z } from 'zod';

export const n8nEnrichmentSchema = z.object({
  ticketId: z.number().int().positive('Ticket ID is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.enum(['billing', 'technical', 'account', 'other']).optional(),
  tags: z.array(z.string()).optional(),
  suggestedReply: z.string().optional(),
});

export type N8nEnrichmentInput = z.infer<typeof n8nEnrichmentSchema>;
