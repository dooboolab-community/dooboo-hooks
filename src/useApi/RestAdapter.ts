import request, { DataWithCancel, RequestOptions, RestMethod } from './internal/ApiClient';

type RestAdapter = {
  [P in RestMethod]: <ResponseData>(path: string, options: RequestOptions) => Promise<DataWithCancel<ResponseData>>;
};

const restClient: RestAdapter = {
  GET: <ResponseData>(path: string, options: RequestOptions = {}) => request<ResponseData>('GET', path, options),
  POST: <ResponseData>(path: string, options: RequestOptions = {}) => request<ResponseData>('POST', path, options),
  PUT: <ResponseData>(path: string, options: RequestOptions = {}) => request<ResponseData>('PUT', path, options),
  DELETE: <ResponseData>(path: string, options: RequestOptions = {}) => request<ResponseData>('DELETE', path, options),
  PATCH: <ResponseData>(path: string, options: RequestOptions = {}) => request<ResponseData>('DELETE', path, options),
};

export const { GET, POST, PUT, DELETE, PATCH } = restClient;
export default restClient;
