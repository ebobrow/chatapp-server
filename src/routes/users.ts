import { Router } from 'express';
import {
  getFriendNames,
  loginUser,
  password,
  registerUser,
  token,
  recievedRequests,
  handleRequest,
  requestFriend,
  sentRequests
} from '../controllers/users';

const router = Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/token', token);
router.post('/password', password);
router.post('/friends/getnames', getFriendNames);
router.post('/friends/request', requestFriend);
router.post('/friends/recievedrequests', recievedRequests);
router.post('/friends/sentrequests', sentRequests);
router.post('/friends/accept', handleRequest);

export default router;
