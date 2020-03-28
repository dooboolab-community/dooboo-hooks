import isPromise from '../isPromise';

it('promise is determined Promise', () => {
  expect(isPromise(new Promise((r) => r()))).toBe(true);
});
it('others are determined not Promise', () => {
  expect(isPromise({})).toBe(false);
  expect(isPromise([])).toBe(false);
  expect(isPromise(1)).toBe(false);
  expect(isPromise('mj')).toBe(false);
  expect(isPromise('promise')).toBe(false);
  expect(isPromise(() => {})).toBe(false);
});
