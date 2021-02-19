import { Router } from 'express';
import {
  loginUser,
  password,
  registerUser,
  token,
  logOut
} from '../controllers/users';

const router = Router();

router.get('/token', token);

router.post('/logout', logOut);
router.post('/login', loginUser);
router.post('/register', registerUser);

router.put('/password', password);

export default router;
