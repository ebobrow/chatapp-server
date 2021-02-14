import { pool } from './db/postgresConfig';

async () => {
  try {
    const res = await pool.query(
      'INSERT INTO friends (sender, reciever) VALUES (2, 1)'
    );
    console.log(res);
  } catch (error) {
    console.log(error);
  }
};
