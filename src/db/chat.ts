import { query } from './postgresConfig';
import { v4 as uuid } from 'uuid';
import { MESSAGES_QUERY_BATCH_SIZE } from '../constants';

export const createChat = async (users: number[]) => {
  const id = uuid();

  await query('INSERT INTO chats (id) VALUES ($1)', [id]);

  users.forEach(async userId => {
    await query('INSERT INTO chat_to_user (user_id, chat_id) VALUES ($1, $2)', [
      userId,
      id
    ]);
  });

  return id;
};

export const getChatsByUser = async (id: number) => {
  const res = await query(
    `SELECT c.id, participants, c.name
    FROM chats c
    INNER JOIN chat_to_user ctu ON ctu.chat_id = c.id
      LEFT JOIN (
      	SELECT
          ARRAY_AGG(u.name) AS participants,
          ctu2.chat_id 
      	FROM chat_to_user ctu2
      	LEFT JOIN users u ON u.id = ctu2.user_id 
      	GROUP BY ctu2.chat_id 
      ) AS u2 ON u2.chat_id = c.id
      WHERE ctu.user_id = $1
      ORDER BY ctu.last_opened DESC
      `,
    [id]
  );

  return res.rows;
};

export const addMessageToChat = async (
  message: string,
  sender: number,
  chatId: string
) => {
  const res = await query(
    'INSERT INTO messages (sender, message, chat_id) VALUES ($1, $2, $3) RETURNING *',
    [sender, message, chatId]
  );
  return res.rows;
};

export const getChatByParticipants = async (users: number[]) => {
  const res = await query(
    `SELECT DISTINCT ctu.chat_id AS id
    FROM chat_to_user ctu
    INNER JOIN (
	    SELECT ARRAY_AGG(u.id) AS participants, chat_id FROM users u
	    INNER JOIN chat_to_user ctu2 ON ctu2.user_id = u.id
	    GROUP BY ctu2.chat_id
    ) AS u2 ON u2.chat_id = ctu.chat_id
    WHERE participants @> $1 AND $1 @> participants`,
    [users]
  );

  return res.rows[0] ? res.rows[0].id : undefined;
};

export const getNumMessages = async (id: string) => {
  const res = await query('SELECT COUNT(*) FROM messages WHERE chat_id = $1', [
    id
  ]);

  return res.rows[0].count;
};

export const getChatMessagesById = async (id: string, cursor: number) => {
  const start = cursor - MESSAGES_QUERY_BATCH_SIZE;

  const res = await query(
    `SELECT ctu.chat_id AS id, messages
    FROM chat_to_user ctu
      INNER JOIN (
      	SELECT
          m.chat_id,
          (ARRAY_AGG(JSON_BUILD_OBJECT(
              'message', m.message,
              'sender', u.username,
              'sent_at', m.sent_at)
            ORDER BY m.sent_at))[${start}:${cursor}]
          AS messages
      	FROM messages m
        LEFT JOIN users u ON u.id = m.sender
      	GROUP BY m.chat_id
      ) AS m2 on m2.chat_id = ctu.chat_id
    WHERE ctu.chat_id = $1`,
    [id]
  );

  return res.rows[0];
};

export const setLastOpened = async (userId: number, chatId: string) => {
  const res = await query(
    'UPDATE chat_to_user SET last_opened = CURRENT_TIMESTAMP WHERE user_id = $1 AND chat_id = $2',
    [userId, chatId]
  );

  return res.rows[0];
};

export const getUnopened = async (id: number) => {
  const res = await query(
    `SELECT ctu.chat_id AS id, COUNT(m) AS amount FROM chat_to_user ctu
    INNER JOIN messages m ON m.chat_id = ctu.chat_id
      AND m.sent_at BETWEEN ctu.last_opened AND CURRENT_TIMESTAMP
    WHERE ctu.user_id = $1
    GROUP BY ctu.chat_id`,
    [id]
  );

  return res.rows;
};

export const getParticipantNamesByChatId = async (id: string) => {
  const res = await query(
    `SELECT u.username, u."name" FROM chats c
    LEFT JOIN chat_to_user ctu ON ctu.chat_id = c.id
    LEFT JOIN users u ON u.id = ctu.user_id
    WHERE c.id = $1`,
    [id]
  );

  return res.rows;
};

export const getChatNameById = async (id: string) => {
  const res = await query('SELECT name FROM chats WHERE id = $1', [id]);

  return res.rows[0];
};

export const setChatNameById = async (id: string, name: string) => {
  const res = await query('UPDATE chats SET name = $1 WHERE id = $2', [
    name,
    id
  ]);

  return res.rows;
};
