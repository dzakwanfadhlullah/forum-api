/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const ThreadsTableTestHelper = {
  async addThread({ id = 'thread-123', title = 'sebuah thread', body = 'sebuah body', owner = 'user-123', date }) {
    await pool.query({
      text: `INSERT INTO threads (id, title, body, owner, created_at)
             VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_TIMESTAMP))`,
      values: [id, title, body, owner, date],
    });
  },
  async findById(id) { return (await pool.query('SELECT * FROM threads WHERE id = $1', [id])).rows; },
  async cleanTable() { await pool.query('DELETE FROM threads'); },
};

export default ThreadsTableTestHelper;
