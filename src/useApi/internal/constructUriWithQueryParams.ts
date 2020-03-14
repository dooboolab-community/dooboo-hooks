import { URL } from 'url';

export function constructUriWithQueryParams(uri: string, queryParams?: object): string {
  try {
    const url: URL = new URL(uri);
    const paramsFromUri = new URLSearchParams(url.searchParams);
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

    if (params.keys().next().done === true) {
      return encodeURI(uri);
    } else {
      return encodeURI(uri + '?' + params.toString());
    }
  } catch (e) {
    return uri;
  }
}
