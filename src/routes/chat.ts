import { Router, json } from 'express';
import { findUser, getChats } from '../controllers/chat';

const router = Router();

router.use(json());

router.post('/chats', getChats);
router.post('/finduser', findUser);

export default router;
