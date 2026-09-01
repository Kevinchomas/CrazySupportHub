import { Router } from 'express';
import { TicketController } from '../controllers/ticketController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();
const ticketController = new TicketController();

router.use(authenticateJWT);

router.post('/', (req, res, next) => ticketController.createTicket(req, res, next));
router.get('/', (req, res, next) => ticketController.getTickets(req, res, next));
router.get('/:id', (req, res, next) => ticketController.getTicketById(req, res, next));
router.patch('/:id', (req, res, next) => ticketController.updateTicket(req, res, next));

export default router;
