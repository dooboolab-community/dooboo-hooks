import convertObjectKeysCamelCaseFromSnakeCase from "./convertObjectKeysCamelCaseFromSnakeCase";

type RestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type Header = {[P in string]: string} & {'Content-Type'?: ContentType; Accept: ContentType; Authorization?: string;};

interface FormData{
  uri: string;
  fileName: string;

}

type AnyObject = {[P in string]: any};

type ReactNativeFile = {
  key: string;
  file: {
    name: string;
    uri: string;
    type: string;
  }
}

type ContentType = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data'

const defaultTimeoutMs = 5000;
const defaultRetryCount = 3;

async function upload<ResponseBody>(
  method: RestMethod,
                                    uri: string, body?: AnyObject,
                                    files?: ReactNativeFile[], headers?: HeadersInit_, signal?: AbortSignal) {
  const formData = new FormData();

  body && Object.entries(body).forEach(([key, value]) => {
    formData.append(key, JSON.stringify(value))
  });

  files && Object.entries(files).forEach(([key, file]) => {
    formData.append(key, file)
  })


}

async function request<ResponseBody = undefined>(
  method: RestMethod,
  uri: string,
  contentType: ContentType,
  queryParams?: AnyObject,
  body?: AnyObject,
  files?: ReactNativeFile[],
  headers?: HeadersInit_,
  signal?: AbortSignal
): Promise<ResponseBody & {cancel: () => void}> {

  const abortController = new AbortController();
  const abortSignal = abortController.signal;

  const encodedUri = encodeURI(uri);

  const requestInit: RequestInit = {
    headers: headers,
    body: body,
    method: method,
    signal: signal
  };

  try {
    const res = await fetch(encodedUri, requestInit)
    const responseBody: ResponseBody = await res.json();
    if(responseBody) {
      // @ts-ignore
      return convertObjectKeysCamelCaseFromSnakeCase(responseBody);
    }
    return undefined;
  }catch(e) {
    throw e;
  }

}

