const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgre extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(owner, commentId, dataReply) {
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies (id, comment_id, owner, content) VALUES ($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, commentId, owner, dataReply.content],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }

  async getReplies(commentId) {
    const query = {
      text: `
        SELECT 
          r.id,
          r.content,
          r.created_at AS date,
          r.is_delete,
          u.username
        FROM replies r
        JOIN users u ON u.id = r.owner
        WHERE r.comment_id = $1
        ORDER BY r.created_at ASC
      `,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async softDeleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE, updated_at = NOW() WHERE id = $1 RETURNING id',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async verifyReplyExist(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('reply not found');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError('forbidden');
    }
  }
}

module.exports = ReplyRepositoryPostgre;
