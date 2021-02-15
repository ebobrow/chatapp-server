import { Pool, QueryArrayResult } from 'pg';

const pool = new Pool();

export const query = async (
  query: string,
  params: any[]
): Promise<QueryArrayResult<any>> => {
  const res = await pool.query(query, params);

  if (process.env.NODE_ENV !== 'production') {
    console.log(query, params);
  }

  return res;
};
