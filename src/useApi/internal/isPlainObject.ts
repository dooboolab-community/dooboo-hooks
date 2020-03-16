function isObject(any): any is object {
  return typeof any === 'object';
}

/**
 * check any varaible is an javascript plain object
 *
 * [isPlainObject.js](https://github.com/lodash/lodash/blob/master/isPlainObject.js)
 * @param value
 */
function isPlainObject(value): value is object {
  if (!value || !isObject(value)) return false;

  if (Object.getPrototypeOf(value) === null) {
    return true;
  }
  let proto = value;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(value) === proto;
}

export default isPlainObject;
