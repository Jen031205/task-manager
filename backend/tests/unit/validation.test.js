'use strict';

const { validateTitle } = require('../../src/tasks/validation');

describe('validateTitle', () => {
  test('trims a valid title', () => {
    expect(validateTitle(' Plan tests ')).toBe('Plan tests');
  });

  test('rejects a blank title', () => {
    expect(() => validateTitle(' ')).toThrow('Enter a valid title.');
  });

  test('rejects a title longer than the limit', () => {
    expect(() => validateTitle('a'.repeat(121))).toThrow();
  });

  // Practice exercise: Add a unit test for a valid title at the maximum allowed length (120 chars)
  test('accepts a valid title at the maximum allowed length', () => {
    const maxTitle = 'a'.repeat(120);
    expect(validateTitle(maxTitle)).toBe(maxTitle);
  });

  test('rejects non-string input values (wrong type in API JSON)', () => {
    expect(() => validateTitle(42)).toThrow('Enter a valid title.');
    expect(() => validateTitle(null)).toThrow('Enter a valid title.');
    expect(() => validateTitle(undefined)).toThrow('Enter a valid title.');
    expect(() => validateTitle({})).toThrow('Enter a valid title.');
  });
});

