import { Request, Response } from 'express';
import { decode, sign } from 'jsonwebtoken';
import { findById } from '../db/users';
import { UserEntry } from '../types';

export const signToken = (user: UserEntry) => {
  return sign({ userId: user.id }, process.env.JWT_SESSION_SECRET!);
};

export const formatDate = (date: string) => {
  const realDate = new Date(date);

  return realDate.toISOString().split('T')[0];
};

export const extractUserIdFromCookie = (req: Request): number => {
  const token = req.cookies.jid;

  const payload: any = decode(token);
  return payload && payload.userId ? payload.userId : null;
};

export const extractUserFromCookie = async (req: Request) => {
  const userId = extractUserIdFromCookie(req);
  if (!userId) return;

  try {
    const user = await findById(userId);
    return user;
  } catch (error) {
    console.log(error);
  }
};
