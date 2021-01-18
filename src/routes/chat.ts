import { Router } from 'express';
import {
  createChatEndpoint,
  findUser,
  getChats,
  getChatMessages,
  getParticipantNames,
  openChat,
  getNotifications
} from '../controllers/chat';

const router = Router();

router.get('/chats', getChats);
router.post('/finduser', findUser);
router.post('/createchat', createChatEndpoint);
router.post('/getmessages', getChatMessages);
router.post('/getparticipants', getParticipantNames);
router.post('/setopen', openChat);
router.get('/notifications', getNotifications);

export default router;
