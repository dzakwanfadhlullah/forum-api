import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    fileParallelism: false,
    coverage: {
      exclude: [
        'src/app.js',
        'src/Commons/config.js',
        'src/Infrastructures/container.js',
        'src/Infrastructures/database/postgres/pool.js',
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
