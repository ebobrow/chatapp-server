import { Router } from 'express';
import {
  getFriendNames,
  recievedRequests,
  handleRequest,
  requestFriend,
  sentRequests,
  markAsSeen,
  deleteFriend
} from '../controllers/friends';

const router = Router();

router.get('/names', getFriendNames);
router.get('/recievedrequests', recievedRequests);
router.get('/sentrequests', sentRequests);

router.post('/request', requestFriend);

router.put('/accept', handleRequest);
router.put('/seen', markAsSeen);

router.delete('/:username', deleteFriend);

export default router;
