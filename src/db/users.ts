import { formatDate } from '../helpers/users';
import { User, UserEntry } from '../types';
import { pool } from './postgresConfig';

export const findById = async (id: number): Promise<UserEntry | null | undefined> => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    return user.rows.length === 0 ? null : user.rows[0];
  } catch (error) {
    console.log(error);
  }
};

export const findByEmail = async (
  email: string
): Promise<UserEntry | null | undefined> => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    return user.rows.length === 0 ? null : user.rows[0];
  } catch (error) {
    console.log(error);
  }
};

export const addUser = async (user: User): Promise<UserEntry | undefined> => {
  const { email, name, password } = user;
  try {
    const res = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password]
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
