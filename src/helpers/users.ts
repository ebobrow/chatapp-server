import { Request, Response } from 'express';
import { decode, sign, verify } from 'jsonwebtoken';
import { findById } from '../db/users';
import { UserEntry } from '../types';

export const signToken = (user: UserEntry) => {
  return sign({ userId: user.id }, process.env.JWT_SESSION_SECRET!);
};

export const checkToken = async (req: Request, res: Response) => {
  try {
    const user = await extractUserFromCookie(req);

    if (!user) throw new Error();
    return res.json({ ok: true, user });
  } catch (error) {
    return res.json({ ok: false, user: null });
  }
};

export const formatDate = (date: string) => {
  const realDate = new Date(date);

  return realDate.toISOString().split('T')[0];
};

export const extractUserIdFromCookie = (req: Request): number => {
  const token = req.cookies.jid;

  const payload: any = decode(token);
  return payload.userId;
};

export const extractUserFromCookie = async (req: Request) => {
  const userId = extractUserIdFromCookie(req);

  try {
    const user = await findById(userId);
    if (!user) throw new Error('Invalid token');
    return user;
  } catch (error) {
    console.log(error);
  }
};
