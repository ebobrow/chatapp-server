import { Pool, QueryArrayResult } from 'pg';

import chalk from 'chalk';

const pool =
  process.env.NODE_ENV === 'production'
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool();

const parseLog = (sql: string) => {
  return sql
    .split(' ')
    .map(word =>
      word.startsWith('$')
        ? chalk.green(word)
        : word
            .split('')
            .map(char => (/[A-Z]/.test(char) ? chalk.blue(char) : char))
            .join('')
    )
    .join(' ');
};

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
