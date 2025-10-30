/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'comments(id)',
      onDelete: 'CASCADE',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comment_likes');
};
