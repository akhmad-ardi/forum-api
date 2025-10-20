const CommentRepository = require("../../Domains/comments/CommentRepository");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(owner, threadId, dataComment) {
    const { content } = dataComment;

    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner",
      values: [id, threadId, owner, content],
    };

    const result = await this._pool.query(query);
    return { ...result.rows[0] };
  }

  async getComments(threadId) {
    const query = {
      text: `
        SELECT 
          c.id,
          c.content,
          c.created_at AS date,
          c.is_delete,
          u.username
        FROM comments c
        JOIN users u ON u.id = c.owner
        WHERE c.thread_id = $1
        ORDER BY c.created_at ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async softDeleteComment(commentId) {
    const query = {
      text: "UPDATE comments SET is_delete = TRUE, updated_at = NOW() WHERE id = $1 RETURNING id",
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async verifyCommentExist(commentId) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("comment not found");
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1 AND owner = $2",
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthorizationError("forbidden");
    }
  }
}

module.exports = CommentRepositoryPostgres;
