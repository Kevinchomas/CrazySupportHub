import { Request, Response, NextFunction } from 'express';
import { TicketService } from '../services/ticketService';
import { createTicketSchema, updateTicketSchema, queryTicketSchema } from '../schemas/ticketSchema';
import { Role } from '@prisma/client';

const ticketService = new TicketService();

export class TicketController {
  async createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }
      const validatedData = createTicketSchema.parse(req.body);
      const ticket = await ticketService.createTicket(req.user.id, validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      next(error);
    }
  }

  async getTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }
      const validatedQuery = queryTicketSchema.parse(req.query);
      const result = await ticketService.getTickets(req.user.id, req.user.role as Role, validatedQuery);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTicketById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Invalid ticket ID' },
        });
        return;
      }
      const ticket = await ticketService.getTicketById(ticketId, req.user.id, req.user.role as Role);
      res.status(200).json(ticket);
    } catch (error) {
      next(error);
    }
  }

  async updateTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Invalid ticket ID' },
        });
        return;
      }
      const validatedData = updateTicketSchema.parse(req.body);
      const updatedTicket = await ticketService.updateTicket(ticketId, req.user.id, req.user.role as Role, validatedData);
      res.status(200).json(updatedTicket);
    } catch (error) {
      next(error);
    }
  }

  async deleteTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        res.status(400).json({
          error: { code: 'BAD_REQUEST', message: 'Invalid ticket ID' },
        });
        return;
      }
      await ticketService.deleteTicket(ticketId, req.user.id, req.user.role as Role);
      res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
