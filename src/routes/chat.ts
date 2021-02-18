import { Router } from 'express';
import {
  createChatEndpoint,
  getChats,
  getChatMessages,
  getParticipantNames,
  openChat,
  getNotifications,
  getChatName,
  setChatName
} from '../controllers/chat';

const router = Router();

router.get('/chats', getChats);
router.post('/createchat', createChatEndpoint);
router.post('/getmessages', getChatMessages);
router.post('/getparticipants', getParticipantNames);
router.post('/setopen', openChat);
router.get('/notifications', getNotifications);
router.get('/name/:id', getChatName);
router.put('/name/:id', setChatName);

export default router;
