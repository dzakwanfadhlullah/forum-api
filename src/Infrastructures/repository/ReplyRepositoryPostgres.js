import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AddedReply from '../../Domains/replies/entities/AddedReply.js';
import ReplyRepository from '../../Domains/replies/ReplyRepository.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply({ content }, commentId, owner) {
    const id = `reply-${this._idGenerator()}`;
    const result = await this._pool.query({
      text: `INSERT INTO replies (id, content, comment_id, owner)
             VALUES ($1, $2, $3, $4) RETURNING id, content, owner`,
      values: [id, content, commentId, owner],
    });
    return new AddedReply(result.rows[0]);
  }

  async verifyReplyExists(replyId, commentId) {
    const result = await this._pool.query({
      text: 'SELECT id FROM replies WHERE id = $1 AND comment_id = $2', values: [replyId, commentId],
    });
    if (!result.rowCount) throw new NotFoundError('balasan tidak ditemukan');
  }

  async verifyReplyOwner(replyId, owner) {
    const result = await this._pool.query({ text: 'SELECT owner FROM replies WHERE id = $1', values: [replyId] });
    if (!result.rowCount) throw new NotFoundError('balasan tidak ditemukan');
    if (result.rows[0].owner !== owner) throw new AuthorizationError('Anda tidak berhak menghapus balasan ini');
  }

  async deleteReply(replyId) {
    await this._pool.query({ text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1', values: [replyId] });
  }

  async getRepliesByThreadId(threadId) {
    const result = await this._pool.query({
      text: `SELECT replies.id, replies.comment_id, replies.content, replies.created_at AS date,
                    replies.is_delete, users.username
             FROM replies JOIN users ON users.id = replies.owner
             JOIN comments ON comments.id = replies.comment_id
             WHERE comments.thread_id = $1 ORDER BY replies.created_at ASC, replies.id ASC`,
      values: [threadId],
    });
    return result.rows;
  }
}

export default ReplyRepositoryPostgres;
