import { pool } from './postgresConfig';
import { v4 as uuid } from 'uuid';

export const createChat = async (users: Array<number>) => {
  const id = uuid();

  await pool.query('INSERT INTO chats (id) VALUES ($1)', [id]);

  users.forEach(async userId => {
    await pool.query(
      'INSERT INTO chat_to_user (user_id, chat_id) VALUES ($1, $2)',
      [userId, id]
    );
  });

  return id;
};

export const getChatsByUser = async (id: number) => {
  const res = await pool.query(
    `SELECT c.id, participants
    FROM chats c
      INNER JOIN chat_to_user conn ON conn.user_id = $1
      LEFT JOIN (
      	SELECT
          ARRAY_AGG(u.username) AS participants,
          ctu.chat_id 
      	FROM chat_to_user ctu 
      	LEFT JOIN users u ON u.id = ctu.user_id 
      	GROUP BY ctu.chat_id 
      ) AS u2 ON u2.chat_id = conn.chat_id 
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
  const res = await pool.query(
    'INSERT INTO messages (sender, message, chat_id) VALUES ($1, $2, $3) RETURNING *',
    [sender, message, chatId]
  );
  return res.rows;
};

export const getChatByParticipants = async (users: Array<number>) => {
  const res = await pool.query(
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

export const getChatById = async (id: number) => {
  // Is there a way to order by date in the sql query?
  const res = await pool.query(
    `SELECT c.id, messages
    FROM chats c
      INNER JOIN chat_to_user conn ON conn.chat_id = $1
      LEFT JOIN (
      	SELECT
          m.chat_id,
          ARRAY_AGG(JSON_BUILD_OBJECT('message', m.message,
                                      'sender', u.username,
                                      'sent_at', m.sent_at)) AS messages
      	FROM messages m
        LEFT JOIN users u ON u.id = m.sender
      	GROUP BY m.chat_id
      ) AS m2 on m2.chat_id = conn.chat_id`,
    [id]
  );

  return res.rows[0];
};

export const setLastOpened = async (userId: number, chatId: string) => {
  const res = await pool.query(
    'UPDATE chat_to_user SET last_opened = CURRENT_TIMESTAMP WHERE user_id = $1 AND chat_id = $2',
    [userId, chatId]
  );

  return res.rows[0];
};

export const getUnopened = async (id: number) => {
  const res = await pool.query(
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
  const res = await pool.query(
    `SELECT u.username, u."name" FROM chats c
    LEFT JOIN chat_to_user ctu ON ctu.chat_id = c.id
    LEFT JOIN users u ON u.id = ctu.user_id
    WHERE c.id = $1`,
    [id]
  );

  return res.rows;
};
