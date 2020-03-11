import toCamelCase from '../convertObjectKeysCamelCaseFromSnakeCase'

describe('camelCase function test', (): void => {
  it('change object to camelCase in nested object', (): void => {
    const obj = { a_b_c: { c_c_c: 1, b_b_b: [{ d_d_d: 1 }, 2, 3] } };

    expect(toCamelCase(obj)).toEqual({
      aBC: { cCC: 1, bBB: [{ dDD: 1 }, 2, 3] },
    });
  });

  it('change array to camelCase', (): void => {
    const obj = { a_b_c: { c_c_c: 1, b_b_b: [{ d_d_d: 1 }, 2, 3] } };
    const arr = [obj, obj, obj];

    expect(toCamelCase(arr)).toEqual([
      { aBC: { cCC: 1, bBB: [{ dDD: 1 }, 2, 3] } },
      { aBC: { cCC: 1, bBB: [{ dDD: 1 }, 2, 3] } },
      { aBC: { cCC: 1, bBB: [{ dDD: 1 }, 2, 3] } },
    ]);
  });

  it('change object containing non-plain-object to camelCase', (): void => {

    class Class{
      constructor(public name: string,private birth: number) {}

      sayMyName(){
        console.error('My name is '+ this.name);
      }
    }
    const instance = new Class('mj', 1997);

    const obj = { a_b_c: instance };

    expect(toCamelCase(obj)).toEqual({
      aBC: instance
    });
  });
});