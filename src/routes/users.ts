import { Router } from 'express';
import { loginUser, password, registerUser, token } from '../controllers/users';

const router = Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/token', token);
router.post('/password', password);

export default router;
