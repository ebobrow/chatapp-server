import { pool } from './postgresConfig';

export const createRequest = async (sender: number, reciever: number) => {
  const res = await pool.query(
    'INSERT INTO friends (sender, reciever) VALUES ($1, $2) RETURNING *',
    [sender, reciever]
  );

  return res.rows[0];
};

export const getRequests = async (
  id: number,
  by: 'sender' | 'reciever',
  unseen = false
) => {
  const opposite = by === 'reciever' ? 'sender' : 'reciever';

  const res = await pool.query(
    `SELECT u.username
    FROM friends
    LEFT JOIN users u ON u.id = ${opposite}
    WHERE ${by} = $1 AND accepted = FALSE
    ${unseen ? 'AND seen = FALSE' : ''}`,
    [id]
  );

  return res.rows.map(row => row.username);
};

export const getRequestBySenderAndReceiver = async (
  sender: number,
  reciever: number
) => {
  const res = await pool.query(
    'SELECT * FROM friends WHERE sender = $1 AND reciever = $2',
    [sender, reciever]
  );

  return res.rows;
};

export const getUserFriendNames = async (id: number) => {
  const res = await pool.query(
    `SELECT f.username, f.name FROM users u
      INNER JOIN friends r ON r.sender = u.id
      LEFT JOIN users f ON f.id = r.reciever
      WHERE u.id = $1 AND r.accepted = TRUE
    UNION
    SELECT f.username, f.name FROM users u
      INNER JOIN friends r ON r.reciever = u.id
      LEFT JOIN users f ON f.id = r.sender
      WHERE u.id = $1 AND r.accepted = TRUE
    `,
    [id]
  );

  return res.rows;
};

export const deleteRequest = async (sender: number, reciever: number) => {
  const res = await pool.query(
    'DELETE FROM friends WHERE sender = $1 AND reciever = $2',
    [sender, reciever]
  );

  return res.rows[0];
};

export const acceptRequest = async (sender: number, reciever: number) => {
  await pool.query(
    'UPDATE friends SET accepted = TRUE WHERE sender = $1 AND reciever = $2',
    [sender, reciever]
  );

  return true;
};

export const setRequestsAsSeen = async (recieverId: number) => {
  const res = await pool.query(
    'UPDATE friends SET seen = TRUE WHERE reciever = $1',
    [recieverId]
  );

  return res.rows;
};
