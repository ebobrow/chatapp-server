import { pool } from './postgresConfig';
import { v4 as uuid } from 'uuid';

export const createChat = async (users: Array<string>) => {
  try {
    const res = await pool.query(
      "INSERT INTO chats (id, participants, messages) VALUES ($1, $2, '[]') RETURNING *",
      [uuid(), users]
    );
    return res.rows;
  } catch (error) {
    console.log(error);
  }
};

export const getChatsByUser = async (id: string) => {
  try {
    const res = await pool.query('SELECT * FROM chats WHERE participants @> ARRAY[$1]', [
      id
    ]);

    return res.rows;
  } catch (error) {
    console.log(error);
  }
};

export const addMessageToChat = async (
  message: string,
  sender: string,
  chatId: string
) => {
  try {
    const newObj = { message, sender };

    const res = await pool.query(
      'UPDATE chats SET messages = messages || $1 WHERE id = $2 RETURNING *',
      [newObj, chatId]
    );
    return res.rows;
  } catch (error) {
    console.log(error);
  }
};
