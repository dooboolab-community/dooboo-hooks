import convertObjectKeysCamelCaseFromSnakeCase from '../.internal/convertObjectKeysCamelCaseFromSnakeCase';

describe('camelCase function test', () => {
  it('change object to camelCase in nested object', () => {
    // eslint-disable-next-line @typescript-eslint/camelcase
    const obj = { a_b_c: { c_c_c: 1, b_b_b: [{ d_d_d: 1 }, 2, 3] } };

    expect(convertObjectKeysCamelCaseFromSnakeCase(obj)).toEqual({
      aBC: { cCC: 1, bBB: [{ dDD: 1 }, 2, 3] },
    });
  });

  it('change array to camelCase', () => {
    // eslint-disable-next-line @typescript-eslint/camelcase
    const obj = { a_b_c: { c_c_c: 1, b_b_b: [{ d_d_d: 1 }, 2, 3] } };
    const arr = [obj, obj, obj];

    expect(convertObjectKeysCamelCaseFromSnakeCase(arr)).toEqual([
      { aBC: { cCC: 1, bBB: [{ dDD: 1 }, 2, 3] } },
      { aBC: { cCC: 1, bBB: [{ dDD: 1 }, 2, 3] } },
      { aBC: { cCC: 1, bBB: [{ dDD: 1 }, 2, 3] } },
    ]);
  });
});
