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

router.post('/chats', getChats);
router.post('/finduser', findUser);
router.post('/createchat', createChatEndpoint);
router.post('/getmessages', getChatMessages);
router.post('/getparticipants', getParticipantNames);
router.post('/setopen', openChat);
router.post('/notifications', getNotifications);

export default router;
