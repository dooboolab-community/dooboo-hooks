import request, { RestBody, RestMethod } from './RxApiClient';

import { Observable } from 'rxjs';

type RestAdapter = {
  [P in RestMethod]: <DataType>(path: string, body?: RestBody) => Observable<DataType>;
};

const restClient: RestAdapter = {
  GET: <DataType>(path: string, body?: RestBody) => request<DataType>('GET', path, body),
  POST: <DataType>(path: string, body?: RestBody) => request<DataType>('POST', path, body),
  PUT: <DataType>(path: string, body?: RestBody) => request<DataType>('PUT', path, body),
  DELETE: <DataType>(path: string, body?: RestBody) => request<DataType>('DELETE', path, body),
};

export const { GET, POST, PUT, DELETE } = restClient;
export default restClient;
