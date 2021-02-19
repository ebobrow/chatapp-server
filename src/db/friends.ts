import { query } from './postgresConfig';

export const createRequest = async (sender: number, reciever: number) => {
  const res = await query(
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

  const res = await query(
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
  const res = await query(
    'SELECT * FROM friends WHERE sender = $1 AND reciever = $2',
    [sender, reciever]
  );

  return res.rows;
};

export const getUserFriendNames = async (id: number) => {
  const res = await query(
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
  const res = await query(
    'DELETE FROM friends WHERE sender = $1 AND reciever = $2',
    [sender, reciever]
  );

  return res.rows[0];
};

export const acceptRequest = async (sender: number, reciever: number) => {
  await query(
    'UPDATE friends SET accepted = TRUE WHERE sender = $1 AND reciever = $2',
    [sender, reciever]
  );

  return true;
};

export const setRequestsAsSeen = async (recieverId: number) => {
  const res = await query(
    'UPDATE friends SET seen = TRUE WHERE reciever = $1',
    [recieverId]
  );

  return res.rows;
};

export const removeFriend = async (user: string, friend: string) => {
  // Bad?
  const reqToDelete = await query(
    `SELECT sender, reciever FROM friends f
    INNER JOIN users u1 ON u1.id = f.sender
    INNER JOIN users u2 ON u2.id = f.reciever
    WHERE (u1.username = $1 AND u2.username = $2)
      OR (u1.username = $2 AND u2.username = $1)`,
    [user, friend]
  );

  if (!reqToDelete.rows.length) throw new Error('Request not found');
  console.log(reqToDelete.rows);

  const { sender, reciever } = reqToDelete.rows[0];

  const res = await query(
    'DELETE FROM friends WHERE sender = $1 AND reciever = $2',
    [sender, reciever]
  );

  return res.rows;
};
