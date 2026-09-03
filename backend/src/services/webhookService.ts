import { PrismaClient, Priority, Category, EnrichmentStatus } from '@prisma/client';
import { N8nEnrichmentInput } from '../schemas/webhookSchema';
import { CustomError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

export class WebhookService {
  async processEnrichment(data: N8nEnrichmentInput) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: data.ticketId },
    });

    if (!ticket) {
      throw new CustomError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: data.ticketId },
      data: {
        priority: data.priority ? (data.priority as Priority) : undefined,
        category: data.category ? (data.category as Category) : undefined,
        tags: data.tags !== undefined ? data.tags : undefined,
        suggestedReply: data.suggestedReply !== undefined ? data.suggestedReply : undefined,
        enrichmentStatus: EnrichmentStatus.done,
        enrichedAt: new Date(),
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return updatedTicket;
  }
}
