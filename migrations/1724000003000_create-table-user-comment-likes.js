export const up = (pgm) => {
  pgm.createTable('user_comment_likes', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    'comment_id': { type: 'VARCHAR(50)', notNull: true, references: 'comments(id)', onDelete: 'CASCADE' },
    'user_id': { type: 'VARCHAR(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
  });
  pgm.addConstraint('user_comment_likes', 'unique_comment_id_and_user_id', {
    unique: ['comment_id', 'user_id'],
  });
};

export const down = (pgm) => pgm.dropTable('user_comment_likes');
