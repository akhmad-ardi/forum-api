const ThreadRepository = require("../../Domains/threads/ThreadRepository");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

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
      text: "INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner",
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
          u.username,
          COALESCE(
            json_agg(
              json_build_object(
                'id', c.id,
                'username', cu.username,
                'date', to_char(c.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                'content', CASE 
                            WHEN c.is_delete THEN '**komentar telah dihapus**' 
                            ELSE c.content 
                          END
              ) ORDER BY c.created_at
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'
          ) AS comments
        FROM threads t
        JOIN users u ON u.id = t.owner
        LEFT JOIN comments c ON c.thread_id = t.id
        LEFT JOIN users cu ON cu.id = c.owner
        WHERE t.id = $1
        GROUP BY t.id, u.username
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async verifyThreadExist(threadId) {
    const query = {
      text: "SELECT id FROM threads WHERE id = $1",
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("thread not found");
    }
  }
}

module.exports = ThreadRepositoryPostgres;
