import { Request, Response } from 'express';
import { addUser, changePassword, findByUsername, findById } from '../db/users';
import { checkToken, extractUserFromCookie, signToken } from '../helpers/users';
import { compare, hash } from 'bcrypt';
import { PG_DUP_ENTRY_CODE } from '../constants';

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await findByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (!(await compare(password, (user as any).password))) {
      return res.status(400).json({ error: 'Password incorrect' });
    }
    res.cookie('jid', signToken(user), { httpOnly: true });
    return res.json({ errors: null, token: signToken(user!) });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, username, password } = req.body;

  try {
    const encryptedPassword = await hash(password, 10);
    const user = await addUser({ name, username, password: encryptedPassword });
    if (!user) throw new Error('Failure adding user');

    res.cookie('jid', signToken(user), { httpOnly: true });
    return res.json({ ok: true });
  } catch (error) {
    if (error.code === PG_DUP_ENTRY_CODE) {
      return res.status(400).json({ error: 'Username already in use' });
    }
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const token = checkToken;

export const password = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await extractUserFromCookie(req);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const userCheck = await findById(user.id);
    if (!userCheck)
      return res.status(400).json({ error: 'User does not exist' });

    if (!(await compare(oldPassword, userCheck.password))) {
      return res.status(400).json({ error: 'Password incorrect' });
    }

    const newUser = await changePassword(user.id, await hash(newPassword, 10));

    if (!newUser) throw new Error('Failure changing password');

    return res.json({ errors: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const logOut = (_: Request, res: Response) => {
  res.clearCookie('jid', { httpOnly: true });
  return res.json({ ok: true });
};
