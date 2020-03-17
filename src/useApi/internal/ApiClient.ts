import 'abortcontroller-polyfill';

import { constructUriWithQueryParams } from './constructUriWithQueryParams';
import convertObjectKeysCamelCaseFromSnakeCase from './convertObjectKeysCamelCaseFromSnakeCase';

declare const global;
const AbortController = global.AbortController;

export type RestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type Header = { [P in string]: string } & {
  'Content-Type'?: ContentType;
  Accept?: ContentType;
  Authorization?: string;
};

export type ReactNativeFile = {
  key: string;
  file: {
    name: string;
    uri: string;
    type: string;
  };
};

export type ContentType =
  | 'application/json'
  | 'application/x-www-form-urlencoded;charset=UTF-8'
  | 'multipart/form-data';

export type RequestOptions = {
  queryParams?: object;
  body?: object | URLSearchParams;
  files?: ReactNativeFile[];
  headers?: Header;
};

export type Call = () => void;
export type CallPromise<ResponseData> = () => Promise<ResponseData>;
export type Unsubscribe = () => void;
export type ApiResult<ResponseData = {}> = [CallPromise<ResponseData>, Unsubscribe];

const defaultHeader: Header = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
const defaultRequestOptions: RequestOptions = {
  headers: defaultHeader,
};

const defaultTimeout = 5000; /* ms */
function withTimeout<T>(ms, promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise((resolve, reject) =>
      setTimeout(() => {
        reject(new Error('Timeout Error'));
      }, ms),
    ),
  ]) as Promise<T>;
}

/**
 * The method for uploading files to api server.
 * This method won't be used from external modules
 *
 * Note: **the properties in body object will be casted to string**
 * because of Content-Type is fixed with multipart/form-data
 *
 * @see https://dev.to/getd/x-www-form-urlencoded-or-form-data-explained-in-2-mins-5hk6
 */
function upload(
  uri: string,
  requestInit: RequestInit,
  files: ReactNativeFile[] = [],
  body: object = {},
): Promise<Response> {
  const formData = new FormData();

  Object.entries(body).forEach(([key, value]) => {
    formData.append(key, JSON.stringify(value));
  });

  Object.entries(files).forEach(([key, file]) => {
    formData.append(key, file);
  });

  requestInit.headers && (requestInit.headers['Content-Type'] = 'multipart/form-data');
  requestInit.body = formData;

  return fetch(uri, requestInit);
}

function requestFormUrlEncoded(
  uri: string,
  requestInit: RequestInit,
  body?: object | URLSearchParams,
): Promise<Response> {
  let encodedBody = new URLSearchParams();

  if (body instanceof URLSearchParams) {
    encodedBody = body;
  } else if (body) {
    Object.entries(body).forEach(([key, value]) => {
      encodedBody.set(encodeURIComponent(key), encodeURIComponent(value));
    });
  }

  requestInit.headers && (requestInit.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8');
  if (!/GET/i.test(requestInit.method!)) requestInit.body = encodedBody;
  return fetch(uri, requestInit);
}

function requestJson(uri: string, requestInit: RequestInit, body?: object): Promise<Response> {
  requestInit.headers && (requestInit.headers['Content-Type'] = 'application/json');
  body && (requestInit.body = JSON.stringify(body));
  return fetch(uri, requestInit);
}

function request<ResponseData = {}>(
  method: RestMethod,
  uri: string,
  options: RequestOptions = defaultRequestOptions,
): ApiResult<ResponseData> {
  const abortController = new AbortController();
  const abortSignal = abortController.signal;

  const callPromise: CallPromise<ResponseData> = () =>
    withTimeout(
      defaultTimeout,
      new Promise<ResponseData>((resolve, reject) => {
        const { queryParams, body, files, headers } = options;

        const constructedUri = constructUriWithQueryParams(uri, queryParams);

        const requestInitWithoutBody: RequestInit = {
          headers: headers || defaultHeader,
          method: method,
          signal: abortSignal,
        };

        let responsePromise: Promise<Response>;

        if (headers?.['Content-Type'] === 'multipart/form-data' || (method === 'POST' && files)) {
          responsePromise = upload(constructedUri, requestInitWithoutBody, files, body);
        } else if (
          headers?.['Content-Type'] === 'application/x-www-form-urlencoded;charset=UTF-8' ||
          body instanceof URLSearchParams
        ) {
          responsePromise = requestFormUrlEncoded(constructedUri, requestInitWithoutBody, body);
        } else {
          responsePromise = requestJson(constructedUri, requestInitWithoutBody, body);
        }

        responsePromise
          .then(
            async (response: Response): Promise<void> => {
              let responseData: ResponseData = {} as ResponseData;
              try {
                // TODO currently, only return response as json
                const json = await response.json();
                responseData = (convertObjectKeysCamelCaseFromSnakeCase(json) as unknown) as ResponseData;
              } catch (e) {}
              resolve(responseData);
            },
          )
          .catch((e) => {
            reject(e);
          });
      }),
    );

  return [
    callPromise,
    (): void => {
      abortController.abort();
    },
  ];
}

export default request;
