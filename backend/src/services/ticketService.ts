import { PrismaClient, TicketStatus, Priority, Category, Role, EnrichmentStatus } from '@prisma/client';
import axios from 'axios';
import { CreateTicketInput, UpdateTicketInput, QueryTicketInput } from '../schemas/ticketSchema';
import { CustomError } from '../middlewares/errorHandler';

const prisma = new PrismaClient();

export class TicketService {
  async createTicket(createdById: number, data: CreateTicketInput) {
    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority as Priority,
        category: data.category as Category,
        tags: data.tags || [],
        createdById: createdById,
        assignedToId: data.assignedToId || null,
        enrichmentStatus: EnrichmentStatus.pending,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      axios.post(n8nWebhookUrl, ticket, { timeout: 10000 })
        .catch(async (error: any) => {
          console.error('Failed to trigger n8n enrichment webhook:', error.message);
          try {
            await prisma.ticket.update({
              where: { id: ticket.id },
              data: { enrichmentStatus: EnrichmentStatus.failed },
            });
          } catch (updateError: any) {
            console.error('Failed to update ticket enrichment status to failed:', updateError.message);
          }
        });
    }

    return ticket;
  }

  async getTickets(userId: number, userRole: Role, query: QueryTicketInput) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const andConditions: any[] = [];

    if (userRole === Role.agent) {
      andConditions.push({
        OR: [
          { createdById: userId },
          { assignedToId: userId },
        ],
      });
    }

    if (query.status) {
      andConditions.push({ status: query.status as TicketStatus });
    }

    if (query.priority) {
      andConditions.push({ priority: query.priority as Priority });
    }

    if (query.category) {
      andConditions.push({ category: query.category as Category });
    }

    if (query.search) {
      andConditions.push({
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          createdBy: { select: { id: true, name: true, email: true, role: true } },
          assignedTo: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTicketById(ticketId: number, userId: number, userRole: Role) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!ticket) {
      throw new CustomError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    if (userRole === Role.agent) {
      if (ticket.createdById !== userId && ticket.assignedToId !== userId) {
        throw new CustomError('Forbidden access to ticket', 403, 'FORBIDDEN');
      }
    }

    return ticket;
  }

  async updateTicket(ticketId: number, userId: number, userRole: Role, data: UpdateTicketInput) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new CustomError('Ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    if (userRole === Role.agent) {
      if (ticket.createdById !== userId && ticket.assignedToId !== userId) {
        throw new CustomError('Forbidden access to ticket', 403, 'FORBIDDEN');
      }
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status as TicketStatus,
        priority: data.priority as Priority,
        category: data.category as Category,
        tags: data.tags,
        assignedToId: data.assignedToId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return updatedTicket;
  }
}


