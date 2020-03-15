import convertCamelCaseFromSnakeCase from '../convertCamelCaseFromSnakeCase';

describe('convert strings to camelCase!', () => {
  it('snake_case to camelCase', () => {
    expect(convertCamelCaseFromSnakeCase('    snake_case      ')).toBe('snakeCase');
    expect(convertCamelCaseFromSnakeCase('       ______snake______case_____')).toBe('snakeCase');
    expect(convertCamelCaseFromSnakeCase('_s_n_a_k_e_       ')).toBe('sNAKE');
    expect(convertCamelCaseFromSnakeCase('_____________________   ')).toBe('');
    expect(convertCamelCaseFromSnakeCase('_________^^________mym0404 ')).toBe('^^Mym0404');
  });
});
