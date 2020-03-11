import isPlainObject from "../isPlainObject";
import getPrototypeOf = Reflect.getPrototypeOf;

describe('test isPlainObject', () => {
  it('return value with non-object should be false', () => {
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject(1)).toBe(false);
    expect(isPlainObject('')).toBe(false);
    expect(isPlainObject(Symbol('nono'))).toBe(false);
    expect(isPlainObject([1,2,3,4])).toBe(false);
  });

  it('return value with object literal should be true', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({a: 1})).toBe(true);
    expect(isPlainObject({b: {c: [1,2,3,4]}})).toBe(true);
  });

  it('return value with object instantiated with prototype of Object constructor should be true(branch cover)', () => {
    expect(isPlainObject(getPrototypeOf(new Object()))).toBe(true);
  })

  it('return value with class instance should be false', () => {
    function FunctionClassConstructor(name: string){
      this.name = name;
    }
    class Class{
      constructor(public name: string) {
      }
    }

    expect(isPlainObject(new FunctionClassConstructor('doo'))).toBe(false);
    expect(isPlainObject(new Class('boo'))).toBe(false);
  });
});