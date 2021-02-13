import { Router } from 'express';
import {
  createChatEndpoint,
  getChats,
  getChatMessages,
  getParticipantNames,
  openChat,
  getNotifications
} from '../controllers/chat';

const router = Router();

router.get('/chats', getChats);
router.post('/createchat', createChatEndpoint);
router.post('/getmessages', getChatMessages);
router.post('/getparticipants', getParticipantNames);
router.post('/setopen', openChat);
router.get('/notifications', getNotifications);

export default router;
