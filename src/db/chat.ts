import { pool } from './postgresConfig';
import { v4 as uuid } from 'uuid';

export const createChat = async (users: Array<string>) => {
  try {
    const res = await pool.query(
      "INSERT INTO chats (id, participants, messages, last_opened) VALUES ($1, $2, '[]', '{}') RETURNING *",
      [uuid(), users]
    );
    return res.rows;
  } catch (error) {
    console.log(error);
  }
};

export const getChatsByUser = async (id: string) => {
  try {
    const res = await pool.query(
      'SELECT * FROM chats WHERE participants @> ARRAY[$1]',
      [id]
    );

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
    // const newObj = { message, sender };

    const res = await pool.query(
      `UPDATE chats SET messages = messages || ('{"sender": "${sender}", "message": "${message}", "sent_at": "' || current_timestamp::text || '"}')::jsonb WHERE id = $1 RETURNING *`,
      [chatId]
    );
    return res.rows;
  } catch (error) {
    console.log(error);
  }
};

export const getChatByParticipants = async (users: Array<string>) => {
  try {
    const res = await pool.query(
      'SELECT * FROM chats WHERE participants @> $1 AND $1 @> participants',
      [users]
    );

    return res.rows;
  } catch (error) {
    console.log(error);
  }
};

export const getChatById = async (id: string) => {
  try {
    const res = await pool.query('SELECT * FROM chats WHERE id = $1', [id]);

    return res.rows[0];
  } catch (error) {
    console.log(error);
  }
};

export const setLastOpened = async (username: string, chatId: string) => {
  console.log(username, chatId);
  try {
    const res = await pool.query(
      ` UPDATE chats SET last_opened = jsonb_set(last_opened, '{"${username}"}', to_jsonb(current_timestamp)) WHERE id=$1 RETURNING *`,
      [chatId]
    );

    return res.rows[0];
  } catch (error) {
    console.log(error);
  }
};

export const getUnopened = async (username: string, chatId: string) => {
  try {
    const res = await pool.query(
      `SELECT * FROM chats, jsonb_to_recordset(chats.messages) AS sent("sent_at" text) WHERE (sent.sent_at::timestamp BETWEEN (chats.last_opened->>$1)::timestamp AND current_timestamp) AND id = $2`,
      [username, chatId]
    );

    return res.rows;
  } catch (error) {
    console.log(error);
  }
};
