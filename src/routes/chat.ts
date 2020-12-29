import { Router, json } from 'express';
import { createChatEndpoint, findUser, getChats } from '../controllers/chat';

const router = Router();

router.use(json());

router.post('/chats', getChats);
router.post('/finduser', findUser);
router.post('/createchat', createChatEndpoint);

export default router;
