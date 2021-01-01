import { pool } from './postgresConfig';

export const createRequest = async (sender: string, reciever: string) => {
  try {
    const res = await pool.query(
      'INSERT INTO friend_requests (sender, reciever) VALUES ($1, $2) RETURNING *',
      [sender, reciever]
    );

    return res.rows[0];
  } catch (error) {
    console.log(error);
  }
};

export const getRequests = async (
  username: string,
  by: 'sender' | 'reciever'
) => {
  try {
    const res = await pool.query(
      `SELECT * FROM friend_requests WHERE ${by} = $1`,
      [username]
    );
    console.log(res);

    return res.rows;
  } catch (error) {
    console.log(error);
  }
};

export const deleteRequest = async (sender: string, reciever: string) => {
  try {
    const res = await pool.query(
      'DELETE FROM friend_requests WHERE sender = $1 AND reciever = $2',
      [sender, reciever]
    );

    return res.rows[0];
  } catch (error) {
    console.log(error);
  }
};
