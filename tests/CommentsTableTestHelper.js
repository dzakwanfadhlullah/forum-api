/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const CommentsTableTestHelper = {
  async addComment({ id = 'comment-123', content = 'sebuah komentar', threadId = 'thread-123', owner = 'user-123', isDelete = false, date }) {
    await pool.query({
      text: `INSERT INTO comments (id, content, thread_id, owner, is_delete, created_at)
             VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP))`,
      values: [id, content, threadId, owner, isDelete, date],
    });
  },
  async findById(id) { return (await pool.query('SELECT * FROM comments WHERE id = $1', [id])).rows; },
  async cleanTable() { await pool.query('DELETE FROM comments'); },
};

export default CommentsTableTestHelper;
