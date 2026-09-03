import { Router } from 'express';
import { WebhookController } from '../controllers/webhookController';

const router = Router();
const webhookController = new WebhookController();

router.post('/enrichment', (req, res, next) => webhookController.enrichment(req, res, next));

export default router;
