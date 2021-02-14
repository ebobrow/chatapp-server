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
  sentRequests,
  markAsSeen,
  logOut
} from '../controllers/users';

const router = Router();

router.post('/logout', logOut);
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/token', token);
router.put('/password', password);
router.get('/friends/getnames', getFriendNames);
router.post('/friends/request', requestFriend);
router.get('/friends/recievedrequests', recievedRequests);
router.get('/friends/sentrequests', sentRequests);
router.put('/friends/accept', handleRequest);
router.put('/friends/seen', markAsSeen);

export default router;
