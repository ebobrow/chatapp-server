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
  logOut,
  deleteFriend
} from '../controllers/users';

const router = Router();

router.get('/token', token);
router.get('/friends/names', getFriendNames);
router.get('/friends/recievedrequests', recievedRequests);
router.get('/friends/sentrequests', sentRequests);

router.post('/logout', logOut);
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/friends/request', requestFriend);

router.put('/password', password);
router.put('/friends/accept', handleRequest);
router.put('/friends/seen', markAsSeen);

router.delete('/friends/:username', deleteFriend);

export default router;
