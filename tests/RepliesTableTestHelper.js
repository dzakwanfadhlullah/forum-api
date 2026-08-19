/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const RepliesTableTestHelper = {
  async addReply({ id = 'reply-123', content = 'sebuah balasan', commentId = 'comment-123', owner = 'user-123', isDelete = false, date }) {
    await pool.query({
      text: `INSERT INTO replies (id, content, comment_id, owner, is_delete, created_at)
             VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP))`,
      values: [id, content, commentId, owner, isDelete, date],
    });
  },
  async findById(id) { return (await pool.query('SELECT * FROM replies WHERE id = $1', [id])).rows; },
  async cleanTable() { await pool.query('DELETE FROM replies'); },
};

export default RepliesTableTestHelper;
