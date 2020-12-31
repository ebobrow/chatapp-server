import { Router } from 'express';
import { getName } from '../controllers/friends';

const router = Router();

router.post('/getnames', getName);

export default router;
