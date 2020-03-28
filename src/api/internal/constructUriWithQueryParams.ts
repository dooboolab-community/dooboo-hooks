import { URL } from 'url';

export function constructUriWithQueryParams(uri: string, queryParams?: object, baseUrl = ''): string {
  try {
    const url: URL = new URL(baseUrl + uri);

    const paramsFromUri = url.searchParams;
    const params = new URLSearchParams();

    queryParams &&
      Object.entries(queryParams).forEach(([key, value]) => {
        params.append(key, value + '');
      });

    paramsFromUri.forEach((value, key) => {
      if (!params.has(key)) {
        params.set(key, value);
      }
    });

    const questionMarkIndex = uri.indexOf('?');
    if (questionMarkIndex !== -1) {
      uri = uri.substring(0, questionMarkIndex);
    }

    if (params[Symbol.iterator]().next().done) {
      return encodeURI(baseUrl + uri);
    } else {
      return encodeURI(baseUrl + uri + '?' + params.toString());
    }
  } catch (e) {
    return uri;
  }
}
