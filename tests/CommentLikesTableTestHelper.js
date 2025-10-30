/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async addCommentLike({
    id = 'comment_like-123',
    userId = 'user-123',
    commentId = 'comment-123',
  }) {
    const query = {
      text: 'INSERT INTO comment_likes (id, comment_id, owner) VALUES ($1, $2, $3)',
      values: [id, commentId, userId],
    };

    await pool.query(query);
  },

  async findById(id) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findByCommentId(commentId) {
    const query = {
      text: `SELECT cl.id, cl.comment_id, cl.owner, u.username
              FROM comment_likes cl
              JOIN users u ON u.id = cl.owner
              WHERE comment_id = $1`,
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes');
  },
};

module.exports = CommentLikesTableTestHelper;
