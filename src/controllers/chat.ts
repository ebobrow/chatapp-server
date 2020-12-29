import { Request, Response } from 'express';
import { getChatsByUser, createChat, getChatByParticipants } from '../db/chat';
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

export const createChatEndpoint = async (req: Request, res: Response) => {
  const { users } = req.body;

  try {
    const ids: Array<string> = users.map(async (user: string) => {
      const id = await findByEmail(user);

      if (id) return id.id;
    });

    const resolvedIds = await Promise.all(ids);
    const existing = await getChatByParticipants(resolvedIds);
    if (!existing) throw new Error();
    if (existing.length) {
      return res.json({ ok: false, error: 'Chat already exists' });
    }
    createChat(resolvedIds);
    return res.json({ ok: true, error: null });
  } catch (error) {
    console.log(error);
  }
};
