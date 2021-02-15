import { formatDate } from '../helpers/users';
import { User, UserEntry } from '../types';
import { query } from './postgresConfig';

export const findById = async (
  id: number
): Promise<UserEntry | null | undefined> => {
  const user = await query('SELECT * FROM users WHERE id = $1', [id]);

  return user.rows.length === 0 ? null : user.rows[0];
};

export const findByUsername = async (
  username: string
): Promise<UserEntry | null | undefined> => {
  const user = await query('SELECT * FROM users WHERE username = $1', [
    username
  ]);

  return user.rows.length === 0 ? null : user.rows[0];
};

export const addUser = async (user: User): Promise<UserEntry | undefined> => {
  const { username, name, password } = user;
  const res = await query(
    'INSERT INTO users (name, username, password) VALUES ($1, $2, $3) RETURNING *',
    [name, username, password]
  );

  return res.rows[0];
};

export const changePassword = async (userId: number, password: string) => {
  const res = await query(
    'UPDATE users SET password = $1, modified_at = $2 WHERE id = $3 RETURNING *',
    [password, formatDate(new Date().toISOString()), userId]
  );

  return res.rows[0];
};
