import { Router } from 'express';
import {
  createChatEndpoint,
  findUser,
  getChats,
  getChatMessages,
  getParticipantNames
} from '../controllers/chat';

const router = Router();

router.post('/chats', getChats);
router.post('/finduser', findUser);
router.post('/createchat', createChatEndpoint);
router.post('/getmessages', getChatMessages);
router.post('/getparticipants', getParticipantNames);

export default router;
