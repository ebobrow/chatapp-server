import { Request, Response } from 'express';
import { findById } from '../db/users';

export const getName = async (req: Request, res: Response) => {
  const { ids } = req.body;

  try {
    const friends = await ids.map(async (id: number) => {
      const friend = await findById(id);

      return { name: friend?.name, email: friend?.email };
    });
    const resolvedFriends = await Promise.all(friends);

    return res.json({ names: resolvedFriends });
  } catch (error) {
    console.log(error);
  }
};
