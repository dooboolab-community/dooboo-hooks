import camelize from "../camelize";

describe('convert strings to camelCase!', () => {
  it('white space strings to camelCase', () => {
    expect(camelize('')).toBe('')
  });
});