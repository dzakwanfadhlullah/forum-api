/* istanbul ignore file */
import { Pool } from 'pg';
import config from '../../../Commons/config.js';

const pool = process.env.DATABASE_URL
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  })
  : new Pool(config.database);

export default pool;
