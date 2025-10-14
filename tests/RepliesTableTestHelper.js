/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    comment_id = 'comment-123',
    owner = 'user-123',
    content = 'test content reply',
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES ($1, $2, $3, $4)',
      values: [id, comment_id, owner, content],
    };

    await pool.query(query);
  },

  async findById(reply_id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [reply_id],
    };

    const result = await pool.query(query);

    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies');
  },
};

module.exports = RepliesTableTestHelper;
