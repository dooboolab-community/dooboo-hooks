export default function isPromise<T>(value): value is Promise<T> {
  return Boolean(value && typeof value.then === 'function');
}
