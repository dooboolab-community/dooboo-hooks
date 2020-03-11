import camelize from "../camelize";

describe('convert strings to camelCase!', () => {
  it('white space strings to camelCase', () => {
    expect(camelize('')).toBe('')
    expect(camelize('doo boo')).toBe('dooBoo')
    expect(camelize('')).toBe('')
    expect(camelize('')).toBe('')
    expect(camelize('')).toBe('')
    expect(camelize('')).toBe('')
    expect(camelize('')).toBe('')
    expect(camelize('')).toBe('')
    expect(camelize('')).toBe('')
    expect(camelize('')).toBe('')
  });
});