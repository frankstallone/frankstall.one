import { describe, it, expect } from 'vitest';
import { buildHierarchy } from '../index';

describe('buildHierarchy', () => {
  it('handles headings without parents gracefully', () => {
    const input = [
      { depth: 3, text: 'Child heading' }
    ];

    const result = buildHierarchy(input);
    expect(result.length).toBe(1);
    expect(result[0].text).toBe('Child heading');
  });

  it('nests headings under their parents when possible', () => {
    const input = [
      { depth: 2, text: 'Parent' },
      { depth: 3, text: 'Child' }
    ];

    const result = buildHierarchy(input);
    expect(result.length).toBe(1);
    expect(result[0].text).toBe('Parent');
    expect(result[0].subheadings[0].text).toBe('Child');
  });
});
