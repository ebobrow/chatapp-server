import { formatDate } from '../helpers/users';
import { User, UserEntry } from '../types';
import { pool } from './postgresConfig';

export const findById = async (
  id: number
): Promise<UserEntry | null | undefined> => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    return user.rows.length === 0 ? null : user.rows[0];
  } catch (error) {
    console.log(error);
  }
};

export const findByusername = async (
  username: string
): Promise<UserEntry | null | undefined> => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [
      username
    ]);

    return user.rows.length === 0 ? null : user.rows[0];
  } catch (error) {
    console.log(error);
  }
};

export const addUser = async (user: User): Promise<UserEntry | undefined> => {
  const { username, name, password } = user;
  try {
    const res = await pool.query(
      'INSERT INTO users (name, username, password) VALUES ($1, $2, $3) RETURNING *',
      [name, username, password]
    );

    return res.rows[0];
  } catch (error) {
    console.log(error);
  }
};

export const changePassword = async (userId: number, password: string) => {
  try {
    const res = await pool.query(
      'UPDATE users SET password = $1, modified_at = $2 WHERE id = $3 RETURNING *',
      [password, formatDate(new Date().toISOString()), userId]
    );

    return res.rows[0];
  } catch (error) {
    console.log(error);
  }
};

export const addFriend = async (userId: number, friendId: number) => {
  try {
    const res = await pool.query(
      'UPDATE users SET friends = array_append(friends, CAST($1 AS BIGINT)) WHERE id = $2',
      [friendId, userId]
    );

    return res.rows;
  } catch (error) {
    console.log(error);
  }
};
