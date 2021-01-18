import { request, Request, Response } from 'express';
import {
  getChatsByUser,
  createChat,
  getChatByParticipants,
  getChatById,
  getUnopened,
  setLastOpened
} from '../db/chat';
import { getRequests } from '../db/friends';
import { findByUsername, findById } from '../db/users';
import { extractUserFromCookie } from '../helpers/users';

export const getChats = async (req: Request, res: Response) => {
  try {
    const user = await extractUserFromCookie(req);
    if (!user) {
      throw new Error('Invalid token');
    }
    const data = await getChatsByUser(user.id);

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
  try {
    const user = await extractUserFromCookie(req);
    if (!user) {
      throw new Error('Invalid token');
    }
    res.json({ user });
  } catch (error) {
    console.log(error);
  }
};

export const createChatEndpoint = async (req: Request, res: Response) => {
  const { users } = req.body;

  try {
    const user = await extractUserFromCookie(req);
    if (!user) {
      throw new Error('Invalid token');
    }
    const ids: Array<number> = users.map(async (user: string) => {
      const id = await findByUsername(user);

      if (id) return id.id;
    });

    const resolvedIds = [...(await Promise.all(ids)), user.id];
    const existing = await getChatByParticipants(resolvedIds);
    if (!existing) throw new Error();

    if (existing.length) {
      return res.json({
        error: 'Chat already exists',
        id: existing[0].id
      });
    }
    const chat = await createChat(resolvedIds);
    users.map((user: string) => {
      setLastOpened(user, chat?.id);
    });
    if (!chat) throw new Error();
    return res.json({ ok: true, error: null, id: chat[0].id });
  } catch (error) {
    console.log(error);
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const chat = await getChatById(id);
    if (!chat) return res.json({ messages: [] });

    return res.json({ messages: chat.messages });
  } catch (error) {
    console.log(error);
  }
};

export const getParticipantNames = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const chat = await getChatById(id);
    if (!chat) return res.json({ participants: [] });

    const participants = chat.participants.map(async (participant: number) => {
      const user = await findById(participant);
      return { name: user?.name, username: user?.username };
    });

    const resolvedParticipants = await Promise.all(participants);
    return res.json({ participants: resolvedParticipants });
  } catch (error) {
    console.log(error);
  }
};

export const openChat = async (req: Request, res: Response) => {
  const { chatId } = req.body;

  try {
    const user = await extractUserFromCookie(req);
    if (!user) {
      throw new Error('Invalid token');
    }
    await setLastOpened(user.username, chatId);

    res.json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const user = await extractUserFromCookie(req);
    if (!user) {
      throw new Error('Invalid token');
    }
    const chats = await getChatsByUser(user.id);
    const requests = await getRequests(user.username, 'reciever');

    if (!chats) {
      return res.json({
        notifications: [
          { name: 'Chat', new: false, chats: [] },
          { name: 'Friends', new: !!requests?.length }
        ],
        requests
      });
    }

    const unread = chats.map(async chat => {
      const unopened = await getUnopened(user.username, chat.id);
      if (!unopened || unopened.length === 0) return;
      const obj = {
        id: chat.id,
        amount: unopened.length
      };
      return obj;
    });

    const resolvedUnread = (await Promise.all(unread)).filter(
      chat => chat !== undefined
    );
    return res.json({
      notifications: {
        Chat: { new: !!resolvedUnread.length, chats: resolvedUnread },
        Friends: { new: !!requests?.length }
      },
      requests
    });
  } catch (error) {
    console.log(error);
  }
};
