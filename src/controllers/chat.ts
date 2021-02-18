import e, { Request, Response } from 'express';
import { MESSAGES_QUERY_BATCH_SIZE } from '../constants';
import {
  getChatsByUser,
  createChat,
  getChatByParticipants,
  getChatMessagesById,
  getUnopened,
  setLastOpened,
  getParticipantNamesByChatId,
  getChatNameById,
  setChatNameById,
  getNumMessages
} from '../db/chat';
import { getRequests } from '../db/friends';
import { findByUsername } from '../db/users';
import { extractUserIdFromCookie } from '../helpers/users';

export const getChats = async (req: Request, res: Response) => {
  try {
    const id = extractUserIdFromCookie(req);
    if (!id) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const chats = await getChatsByUser(id);

    if (!chats) return res.json({ chats: null });

    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const createChatEndpoint = async (req: Request, res: Response) => {
  const { users } = req.body;

  try {
    const userId = extractUserIdFromCookie(req);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const ids: number[] = users.map(async (user: string) => {
      const id = await findByUsername(user);

      if (id) return id.id;
    });

    const resolvedIds = [...(await Promise.all(ids)), userId];
    const existing = await getChatByParticipants(resolvedIds);

    if (existing) {
      return res.status(400).json({
        error: 'Chat already exists',
        id: existing
      });
    }
    const chatId = await createChat(resolvedIds);
    if (!chatId) throw new Error('Failure creating chat');

    return res.json({ ok: true, error: null, id: chatId });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  const { id, cursor } = req.query;

  try {
    const offset = cursor
      ? parseInt(cursor as string)
      : await getNumMessages(id as string);
    console.log(offset);

    const chat = await getChatMessagesById(id as string, offset);
    if (!chat) return res.json({ messages: [] });

    const nextCursor = offset - MESSAGES_QUERY_BATCH_SIZE - 1;

    return res.json({
      messages: chat.messages,
      nextCursor: nextCursor >= 0 ? nextCursor : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const getParticipantNames = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const participants = await getParticipantNamesByChatId(id);

    return res.json({ participants });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const openChat = async (req: Request, res: Response) => {
  const { chatId } = req.body;

  try {
    const id = extractUserIdFromCookie(req);
    if (!id) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    await setLastOpened(id, chatId);

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const id = extractUserIdFromCookie(req);
    if (!id) {
      return res.json({
        notifications: [
          { name: 'Chat', new: false, chats: [] },
          { name: 'Friends', new: false }
        ]
      });
    }
    const chats = await getChatsByUser(id);
    const requests = await getRequests(id, 'reciever', true);

    if (!chats) {
      return res.json({
        notifications: [
          { name: 'Chat', new: false, chats: [] },
          { name: 'Friends', new: !!requests?.length }
        ],
        requests
      });
    }

    const unopened = await getUnopened(id);

    return res.json({
      notifications: {
        Chat: { new: !!unopened.length, chats: unopened },
        Friends: { new: !!requests?.length }
      },
      requests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const getChatName = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const name = await getChatNameById(id);

    if (!name) {
      return res.status(400).json({ error: 'Chat not found' });
    }

    res.send(name.name);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const setChatName = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    await setChatNameById(id, name);

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};
