export const up = (pgm) => {
  pgm.createTable('comments', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    content: { type: 'TEXT', notNull: true },
    'thread_id': { type: 'VARCHAR(50)', notNull: true, references: 'threads(id)', onDelete: 'CASCADE' },
    owner: { type: 'VARCHAR(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    'is_delete': { type: 'BOOLEAN', notNull: true, default: false },
    'created_at': { type: 'TIMESTAMPTZ', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });
};

export const down = (pgm) => pgm.dropTable('comments');
