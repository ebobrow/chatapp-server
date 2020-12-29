import { Request, Response } from 'express';
import { getChatsByUser } from '../db/chat';
import { findByEmail, findById } from '../db/users';

export const getChats = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const data = await getChatsByUser(id);

    if (!data) return res.json({ chats: null });

    const chats = data.map(async row => {
      const chat = row.participants.map(async (id: string) => {
        const user = await findById(parseInt(id));
        return user?.name;
      });
      return { ...row, participants: await Promise.all(chat) };
    });

    const resolved = await Promise.all(chats);

    res.json({ chats: resolved });
  } catch (error) {
    console.log(error);
  }
};

export const findUser = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await findByEmail(email);
    res.json({ user });
  } catch (error) {
    console.log(error);
  }
};
