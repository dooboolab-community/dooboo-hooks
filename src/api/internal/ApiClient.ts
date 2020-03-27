import 'abortcontroller-polyfill';

import convertObjectKeysCamelCaseFromSnakeCase, { JSONCandidate } from './convertObjectKeysCamelCaseFromSnakeCase';

import { constructUriWithQueryParams } from './constructUriWithQueryParams';
import isPromise from './isPromise';

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

type RequestOptionsInterceptor = (
  request: RequestOptions,
  url: string,
  method: RestMethod,
) => RequestOptions | Promise<RequestOptions>;
type ResponseDataInterceptor<ResponseData extends JSONCandidate> = (
  responseData: ResponseData,
) => ResponseData | Promise<ResponseData>;
type Settings<ResponseData extends JSONCandidate> = {
  headers: Header;
  baseUrl: string;
  timeout: number;
  requestInterceptor: RequestOptionsInterceptor;
  responseInterceptor: ResponseDataInterceptor<ResponseData>;
  responseCodeWhiteListRange: { minInclude: number; maxExclude: number };
  responseCodeWhiteList: number[];
  responseCodeBlackList: number[];
};
const initialSettings: Settings<{}> = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  baseUrl: '',
  timeout: 5000,
  requestInterceptor: (request) => request,
  responseInterceptor: (response) => response,
  responseCodeWhiteListRange: { minInclude: 200, maxExclude: 300 },
  responseCodeWhiteList: [],
  responseCodeBlackList: [],
};
let defaultSettings = initialSettings;
export function setApiDefaultSettings(options: Partial<typeof defaultSettings>): void {
  defaultSettings = { ...initialSettings, ...options };
}
export function clearApiDefaultSettings(): void {
  defaultSettings = initialSettings;
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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
  url: string,
  options: RequestOptions = { headers: defaultSettings.headers },
): ApiResult<ResponseData> {
  const abortController = new AbortController();
  const abortSignal = abortController.signal;

  const callPromise: CallPromise<ResponseData> = () =>
    withTimeout(
      defaultSettings.timeout,
      new Promise<ResponseData>((resolve, reject): void => {
        // Intercept Request Options
        let optionsPromise: RequestOptions | Promise<RequestOptions> = defaultSettings.requestInterceptor(
          options,
          url,
          method,
        );
        if (!isPromise(optionsPromise)) {
          optionsPromise = Promise.resolve(optionsPromise);
        }

        optionsPromise.then(
          async (options): Promise<void> => {
            try {
              const { queryParams, body, files, headers } = options;

              const constructedUri = constructUriWithQueryParams(url, queryParams, defaultSettings.baseUrl);

              const requestInitWithoutBody: RequestInit = {
                headers: headers || defaultSettings.headers,
                method: method,
                signal: abortSignal,
              };

              let responsePromise: Promise<Response>;

              // TODO remove console
              console.log(`🌈[${method}] - [${constructedUri}] - ${JSON.stringify(body, null, 2)}`);

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

              const response = await responsePromise;

              const { status: statusCode } = response;
              const { minInclude: min, maxExclude: max } = defaultSettings.responseCodeWhiteListRange;
              const whiteList = defaultSettings.responseCodeWhiteList;
              const blackList = defaultSettings.responseCodeBlackList;
              if ((statusCode < min || statusCode >= max) && !whiteList.includes(statusCode)) {
                reject(
                  new Error(
                    // eslint-disable-next-line max-len
                    `Status Code [${statusCode}] doesn't exist in responseCodeWhiteListRange [${min}, ${max}). If you want to include ${statusCode} to white list, use responseCodeWhiteList settings in setApiDefaultSettings()`,
                  ),
                );
                return;
              } else if (blackList.includes(statusCode)) {
                reject(new Error(`Status Code [${statusCode}] exists in responseCodeBlackList [${blackList}]`));
                return;
              }

              let responseData: ResponseData = {} as ResponseData;
              try {
                // TODO currently, only return response as json
                let json = await response.json();
                // TODO remove console
                console.log(`🌈Api Response Body - ${JSON.stringify(json, null, 2)}`);

                const responseDataOrPromise = defaultSettings.responseInterceptor(json);
                if (isPromise(responseDataOrPromise)) {
                  json = await responseDataOrPromise;
                } else {
                  json = responseDataOrPromise;
                }

                responseData = (convertObjectKeysCamelCaseFromSnakeCase(json) as unknown) as ResponseData;
              } catch (e) {
                // Ignore empty body parsing or not json body
                // console.log(`🌈Api Response Body JSON parse Fail - ${e}`);
                // reject(e);
              } finally {
                resolve(responseData);
              }
            } catch (e) {
              // TODO remove console
              console.warn(e);
              reject(e);
            }
          },
        );
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
