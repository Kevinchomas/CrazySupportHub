import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateJWT);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
