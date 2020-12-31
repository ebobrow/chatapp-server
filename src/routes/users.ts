import { Router } from 'express';
import {
  addUserFriend,
  getFriendNames,
  loginUser,
  password,
  registerUser,
  token
} from '../controllers/users';

const router = Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/token', token);
router.post('/password', password);
router.post('/friends/getnames', getFriendNames);
router.post('/friends/add', addUserFriend);

export default router;
