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

router.get('/', getChats);
router.get('/messages/:id', getChatMessages);
router.get('/participants/:id', getParticipantNames);
router.get('/notifications', getNotifications);
router.get('/name/:id', getChatName);

router.post('/', createChatEndpoint);

router.put('/lastseen', openChat);
router.put('/name/:id', setChatName);

export default router;
