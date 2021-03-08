import { Pool, QueryArrayResult } from 'pg';

import chalk from 'chalk';

let retries = 5;
let pool: Pool;

(async () => {
  while (retries) {
    try {
      pool = new Pool();
      await pool.query('SELECT * FROM users');
      console.log('Db connected!');
      break;
    } catch (error) {
      console.log(error);
      await new Promise(res => setTimeout(res, 1000));
      retries--;
    }
  }
})();

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
