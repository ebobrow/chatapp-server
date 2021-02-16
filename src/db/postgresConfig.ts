import { Pool, QueryArrayResult } from 'pg';
import chalk from 'chalk';

const pool = new Pool();

const parseLog = (sql: string) =>
  sql
    .split(' ')
    .map(word =>
      word.startsWith('$') // Params are green, to match strings in array
        ? chalk.green(word)
        : word === word.toUpperCase() && word !== '=' // Assuming all sql is uppercase
        ? chalk.blue(word)
        : word
    )
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
