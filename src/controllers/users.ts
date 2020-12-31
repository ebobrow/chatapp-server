import { Request, Response } from 'express';
import {
  addFriend,
  addUser,
  changePassword,
  findByusername,
  findById
} from '../db/users';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  validateSchema
} from '../helpers/schemaValidation';
import { checkToken, signToken } from '../helpers/users';
import { compare, hash } from 'bcrypt';

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const errors = validateSchema(loginSchema, { username, password }) || [];
  // if (errors) return res.json({ error: errors });

  // User exists?
  try {
    const user = await findByusername(username);
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
    const userCheck = await findByusername(username);
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

export const addUserFriend = async (req: Request, res: Response) => {
  const { username, id } = req.body;

  try {
    const friend = await findByusername(username);
    if (!friend) return res.json({ ok: false, error: 'User not found' });

    const user = await findById(id);

    if (!user?.friends) {
      await addFriend(id, friend.id);
      return res.json({ ok: true, friend });
    }
    if (user?.friends.find(frnd => frnd === friend.id)) {
      return res.json({ ok: false, error: 'Friend already exists' });
    }
    const newFriend = await addFriend(id, friend.id);
    res.json({ ok: true, friend });
  } catch (error) {
    console.log(error);
  }
};
