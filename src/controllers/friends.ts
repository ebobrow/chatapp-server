import { Request, Response } from 'express';
import { PG_DUP_ENTRY_CODE } from '../constants';
import {
  getUserFriendNames,
  getRequestBySenderAndReceiver,
  createRequest,
  deleteRequest,
  acceptRequest,
  getRequests,
  setRequestsAsSeen,
  removeFriend
} from '../db/friends';
import { findByUsername } from '../db/users';
import {
  extractUserIdFromCookie,
  extractUserFromCookie
} from '../helpers/users';

export const getFriendNames = async (req: Request, res: Response) => {
  try {
    const id = extractUserIdFromCookie(req);
    if (!id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const friends = await getUserFriendNames(id);

    return res.json({ friends });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    if (!friend) return res.status(400).json({ error: 'User not found' });

    const existing = await getRequestBySenderAndReceiver(friend.id, id);

    if (existing.length) {
      return res.status(400).json({ error: 'Friend already requested' });
    }

    await createRequest(id, friend.id);
    res.json({ ok: true });
  } catch (error) {
    if (error.code === PG_DUP_ENTRY_CODE) {
      return res.status(400).json({ error: 'Friend already requested' });
    }
    res.status(500).json({ error: error.message });
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
      return res.status(400).json({ error: 'Friend not found' });
    }

    if (!accept) {
      await deleteRequest(friend.id, id);
      return res.json({ ok: true });
    }

    await acceptRequest(friend.id, id);
    return res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

export const deleteFriend = async (req: Request, res: Response) => {
  const { username } = req.params;

  try {
    const userId = extractUserIdFromCookie(req);

    const friend = await findByUsername(username);
    if (!friend) throw new Error('Friend not found');

    await removeFriend(userId, friend.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};
