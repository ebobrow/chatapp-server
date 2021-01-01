import { Request, Response } from 'express';
import {
  addUser,
  changePassword,
  findByUsername,
  findById,
  addFriend
} from '../db/users';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  validateSchema
} from '../helpers/schemaValidation';
import { checkToken, signToken } from '../helpers/users';
import { compare, hash } from 'bcrypt';
import { createRequest, deleteRequest, getRequests } from '../db/friends';

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const errors = validateSchema(loginSchema, { username, password }) || [];
  // if (errors) return res.json({ error: errors });

  // User exists?
  try {
    const user = await findByUsername(username);
    if (!user) {
      // return res.json({ error: ['User not found'] });
      errors.push({ message: 'User not found' });
    }
    if (errors.length > 0) {
      return res.json({ errors });
    }

    if (!(await compare(password, (user as any).password))) {
      return res.json({ errors: [{ message: 'Password incorrect' }] });
    }
    return res.json({ errors: null, token: signToken(user!) });
  } catch (error) {
    console.log(error);
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, username, password, passwordVerify } = req.body;

  const errors =
    validateSchema(registerSchema, {
      name,
      username,
      password,
      passwordVerify
    }) || [];
  // if (error) return res.json({ error });

  try {
    const userCheck = await findByUsername(username);
    if (userCheck) {
      // return res.json({ error: ['username already in use'] });
      errors.push({ message: 'username already in use' });
    }
    if (errors.length > 0) {
      return res.json({ errors });
    }

    const encryptedPassword = await hash(password, 10);
    const user = await addUser({ name, username, password: encryptedPassword });
    if (!user) throw new Error('Failure adding user');
    return res.json({ errors: null, token: signToken(user) });
  } catch (error) {
    console.log(error);
  }
};

export const token = (req: Request, res: Response) => {
  checkToken(req, res);
};

export const password = async (req: Request, res: Response) => {
  const { id, oldPassword, newPassword, newPasswordVerify } = req.body;
  const numId = parseInt(id);

  const errors = validateSchema(changePasswordSchema, {
    oldPassword,
    newPassword,
    newPasswordVerify
  });

  if (errors) return res.json({ errors });

  try {
    const userCheck = await findById(numId);
    if (!userCheck)
      return res.json({ errors: [{ message: 'User does not exist' }] });

    if (!(await compare(oldPassword, userCheck.password))) {
      return res.json({ errors: [{ message: 'Password incorrect' }] });
    }

    const newUser = await changePassword(numId, await hash(newPassword, 10));

    if (!newUser) throw new Error('Failure changing password');

    return res.json({ errors: null, token: signToken(newUser) });
  } catch (error) {
    console.log(error);
  }
};

export const getFriendNames = async (req: Request, res: Response) => {
  const { ids } = req.body;

  try {
    const friends = await ids.map(async (id: number) => {
      const friend = await findById(id);

      return { name: friend?.name, username: friend?.username };
    });
    const resolvedFriends = await Promise.all(friends);

    return res.json({ names: resolvedFriends });
  } catch (error) {
    console.log(error);
  }
};

export const requestFriend = async (req: Request, res: Response) => {
  const { sender, reciever } = req.body;

  try {
    const friend = await findByUsername(reciever);
    if (!friend) return res.json({ ok: false, error: 'User not found' });

    if (friend.friends.find(f => f === sender)) {
      return res.json({ ok: false, error: 'You are already friends' });
    }

    const existing = await getRequests(reciever, 'reciever');

    if (existing && existing.find(request => request.sender === sender)) {
      return res.json({ ok: false, error: 'Friend already requested' });
    }

    await createRequest(sender, reciever);
    res.json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};

export const recievedRequests = async (req: Request, res: Response) => {
  const { username } = req.body;

  try {
    const requests = await getRequests(username, 'reciever');

    res.json({ requests });
  } catch (error) {
    console.log(error);
  }
};

export const handleRequest = async (req: Request, res: Response) => {
  const { sender, reciever, accept } = req.body;

  try {
    await deleteRequest(sender, reciever);

    if (!accept) {
      return res.json({ ok: true });
    }

    const senderId = (await findByUsername(sender))?.id;
    const recieverUser = await findByUsername(reciever);
    const recieverId = recieverUser?.id;

    if (!senderId || !recieverId) {
      return res.json({ ok: false, error: 'User not found' });
    }
    await addFriend(senderId, recieverId);
    await addFriend(recieverId, senderId);

    return res.json({ ok: true, name: recieverUser?.name });
  } catch (error) {
    console.log(error);
  }
};

export const sentRequests = async (req: Request, res: Response) => {
  const { username } = req.body;

  try {
    const requests = await getRequests(username, 'sender');

    res.json({ requests });
  } catch (error) {
    console.log(error);
  }
};
