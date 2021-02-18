import { Request, Response } from 'express';
import { addUser, changePassword, findByUsername, findById } from '../db/users';
import {
  checkToken,
  extractUserFromCookie,
  extractUserIdFromCookie,
  signToken
} from '../helpers/users';
import { compare, hash } from 'bcrypt';
import {
  acceptRequest,
  createRequest,
  deleteRequest,
  getRequestBySenderAndReceiver,
  getRequests,
  getUserFriendNames,
  setRequestsAsSeen
} from '../db/friends';
import { PG_DUP_ENTRY_CODE } from '../constants';

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // User exists?
  try {
    const user = await findByUsername(username);
    if (!user) {
      return res.json({ errors: ['User not found'] });
    }

    if (!(await compare(password, (user as any).password))) {
      return res.json({ errors: ['Password incorrect'] });
    }
    res.cookie('jid', signToken(user), { httpOnly: true });
    return res.json({ errors: null, token: signToken(user!) });
  } catch (error) {
    res.status(500).send(error.message);
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
    return res.json({ errors: null, token: signToken(user) });
  } catch (error) {
    if (error.code === PG_DUP_ENTRY_CODE) {
      return res.json({ errors: ['Username already in use'] });
    }
    res.status(500).send(error.message);
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
    if (!userCheck) return res.json({ errors: ['User does not exist'] });

    if (!(await compare(oldPassword, userCheck.password))) {
      return res.json({ errors: ['Password incorrect'] });
    }

    const newUser = await changePassword(user.id, await hash(newPassword, 10));

    if (!newUser) throw new Error('Failure changing password');

    return res.json({ errors: null });
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error);
  }
};

export const getFriendNames = async (req: Request, res: Response) => {
  try {
    const id = extractUserIdFromCookie(req);
    if (!id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const friends = await getUserFriendNames(id);

    return res.json({ friends });
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error);
  }
};

export const requestFriend = async (req: Request, res: Response) => {
  const { reciever } = req.body;

  try {
    const id = extractUserIdFromCookie(req);
    if (!id) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const friend = await findByUsername(reciever);
    if (!friend) return res.json({ ok: false, error: 'User not found' });

    const existing = await getRequestBySenderAndReceiver(friend.id, id);

    if (existing.length) {
      return res.json({ ok: false, error: 'Friend already requested' });
    }

    await createRequest(id, friend.id);
    res.json({ ok: true });
  } catch (error) {
    if (error.code === PG_DUP_ENTRY_CODE) {
      return res.json({ ok: false, error: 'Friend already requested' });
    }
    res.status(500).send(error.message);
    console.log(error);
  }
};

export const handleRequest = async (req: Request, res: Response) => {
  const { sender, accept } = req.body;

  try {
    const id = extractUserIdFromCookie(req);
    if (!id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const friend = await findByUsername(sender);
    if (!friend) {
      throw new Error('Invalid request');
    }

    if (!accept) {
      await deleteRequest(friend.id, id);
      return res.json({ ok: true });
    }

    await acceptRequest(friend.id, id);
    return res.json({ ok: true });
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error);
  }
};

export const recievedRequests = async (req: Request, res: Response) => {
  try {
    const id = extractUserIdFromCookie(req);
    if (!id) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const requests = await getRequests(id, 'reciever');

    res.json({ requests });
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error);
  }
};

export const sentRequests = async (req: Request, res: Response) => {
  try {
    const id = extractUserIdFromCookie(req);
    if (!id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const requests = await getRequests(id, 'sender');

    res.json({ requests });
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error);
  }
};

export const markAsSeen = async (req: Request, res: Response) => {
  try {
    const id = extractUserIdFromCookie(req);
    if (!id) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const set = await setRequestsAsSeen(id);

    return res.json({ ok: true, set });
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error);
  }
};

export const logOut = (_: Request, res: Response) => {
  res.clearCookie('jid', { httpOnly: true });
  return res.json({ ok: true });
};
