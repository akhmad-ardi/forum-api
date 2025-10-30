const CommentLikeRepository = require('../../Domains/comment_likes/CommentLikeRepository');

class CommentLikeRepositoryPostgre extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addCommentLike(userId, commentId) {
    const id = `comment_like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comment_likes (id, comment_id, owner) VALUES ($1, $2, $3) RETURNING id',
      values: [id, commentId, userId],
    };

    await this._pool.query(query);
  }

  async deleteCommentLike(userId, commentId) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE owner = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async getCommentLike(userId, commentId) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE owner = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getCommentLikeCount(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return +result.rows[0].count;
  }
}

module.exports = CommentLikeRepositoryPostgre;
