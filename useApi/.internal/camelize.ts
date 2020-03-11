/**
 * chagen any string to camelCase
 *
 * [Stack Overflow](https://stackoverflow.com/a/2970667/10199138)
 * @param str string to camelize
 */
function camelize(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

export default camelize;