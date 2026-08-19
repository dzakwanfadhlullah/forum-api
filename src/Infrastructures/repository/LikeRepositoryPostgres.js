import LikeRepository from '../../Domains/likes/LikeRepository.js';

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async likeComment(commentId, userId) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO user_comment_likes VALUES($1, $2, $3)',
      values: [id, commentId, userId],
    };
    await this._pool.query(query);
  }

  async unlikeComment(commentId, userId) {
    const query = {
      text: 'DELETE FROM user_comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };
    await this._pool.query(query);
  }

  async verifyCommentLikeExists(commentId, userId) {
    const query = {
      text: 'SELECT 1 FROM user_comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };
    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async getLikesByThreadId(threadId) {
    const query = {
      text: `SELECT user_comment_likes.id, user_comment_likes.comment_id, user_comment_likes.user_id
             FROM user_comment_likes
             JOIN comments ON comments.id = user_comment_likes.comment_id
             WHERE comments.thread_id = $1`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default LikeRepositoryPostgres;
