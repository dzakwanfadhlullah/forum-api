import { describe, it, expect } from 'vitest';

describe('Intentional Failing Scenario for CI Verification', () => {
  it('should fail this test to demonstrate CI failure on PR', () => {
    expect(false).toBe(true);
  });
});
