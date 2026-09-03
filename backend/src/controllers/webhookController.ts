import { Request, Response, NextFunction } from 'express';
import { WebhookService } from '../services/webhookService';
import { n8nEnrichmentSchema } from '../schemas/webhookSchema';

const webhookService = new WebhookService();

export class WebhookController {
  async enrichment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const webhookSecret = req.headers['x-webhook-secret'];
      const expectedSecret = process.env.N8N_WEBHOOK_SECRET || 'super_secret_n8n_key';

      if (!webhookSecret || webhookSecret !== expectedSecret) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing webhook secret',
          },
        });
        return;
      }

      const validatedData = n8nEnrichmentSchema.parse(req.body);
      const updatedTicket = await webhookService.processEnrichment(validatedData);

      res.status(200).json(updatedTicket);
    } catch (error) {
      next(error);
    }
  }
}
