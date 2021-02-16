import { Pool, QueryArrayResult } from 'pg';
import chalk from 'chalk';

const pool = new Pool();

// Probably very slow but it's only for development
const parseLog = (sql: string) =>
  sql
    .split('')
    .map(char => (/[A-Z]/.test(char) ? chalk.blue(char) : char))
    .join('')
    .split(' ')
    .map(word => (word.startsWith('$') ? chalk.green(word) : word))
    .join(' ');

export const query = async (
  query: string,
  params: any[]
): Promise<QueryArrayResult<any>> => {
  const res = await pool.query(query, params);

  if (process.env.NODE_ENV !== 'production') {
    console.log(parseLog(query), params);
  }

  return res;
};
