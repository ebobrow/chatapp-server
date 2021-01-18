import { Request, Response } from 'express';
import { decode, sign, verify } from 'jsonwebtoken';
import { findById } from '../db/users';
import { UserEntry } from '../types';

export const signToken = (user: UserEntry) => {
  return sign({ userId: user.id }, process.env.JWT_SESSION_SECRET!);
};

export const checkToken = async (req: Request, res: Response) => {
  const user = await extractUserFromCookie(req);

  if (!user) return res.json({ ok: false, user: null });
  return res.json({ ok: true, user });

  // try {
  //   const token = verify(auth as string, process.env.JWT_SESSION_SECRET!);
  //   const user = await findById((token as any).userId);

  //   if (!user) {
  //     return res.json({ ok: false, user: null });
  //   }
  //   res.json({
  //     ok: true,
  //     user: {
  //       ...user,
  //       created_at: formatDate(user.created_at),
  //       modified_at: formatDate(user.modified_at)
  //     }
  //   });
  // } catch (error) {
  //   console.log(error);
  //   res.json({ error, ok: false, user: null });
  // }
};

export const formatDate = (date: string) => {
  const realDate = new Date(date);

  return realDate.toISOString().split('T')[0];
};

export const extractUserFromCookie = async (req: Request) => {
  const token = req.cookies.jid;

  const payload: any = decode(token);
  try {
    const user = await findById(payload.userId);
    if (!user) throw new Error('Invalid token');
    return user;
  } catch (error) {
    console.log(error);
  }
};
