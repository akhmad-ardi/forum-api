const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(owner, dataThread) {
    const { title, body } = dataThread;

    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    const thread = result.rows[0];

    return {
      id: thread.id,
      title: thread.title,
      owner: thread.owner,
    };
  }

  async getThread(threadId) {
    const query = {
      text: `
      SELECT 
        t.id, 
        t.title, 
        t.body, 
        t.created_at AS date,
        u.username
      FROM threads t
      JOIN users u ON u.id = t.owner
      WHERE t.id = $1
    `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async verifyThreadExist(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('thread not found');
    }
  }
}

module.exports = ThreadRepositoryPostgres;
