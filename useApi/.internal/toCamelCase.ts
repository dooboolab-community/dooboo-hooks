import camelize from './camelize';
import isPlainObject from './isPlainObject';

type Candidates = any[] | object;

function isArray<T>(objOrArray: Candidates): boolean {
  return Array.isArray(objOrArray);
}

function toCamelCase(objOrArr: Candidates): Candidates {
  if (isArray(objOrArr)) {
    return (objOrArr as {map: Function}).map(toCamelCase(objOrArr));
  } else {
    const camelCaseObject: object = {};

    Object.entries(objOrArr).forEach(([key, value]) => {
      if (isPlainObject(value)) {
        value = toCamelCase(value);
      } else if (isArray(value)) {
        value = value.map((v) => (isPlainObject(v) ? toCamelCase(v) : v));
      }
      camelCaseObject[camelize(key)] = value;
    });

    return camelCaseObject;
  }
}

export default toCamelCase;
