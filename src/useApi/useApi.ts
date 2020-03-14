import { useEffect, useState } from 'react';

import { DataWithCancel } from './internal/ApiClient';

type UseApi<ResponseData> = { loading: boolean; error: Error | null; unsubscribe: () => void } & {
  [P in keyof ResponseData]?: ResponseData[P];
};
/**
 * ##<b>Note: This hooks must be used with useMemo in first Observable parameter.</b>
 *
 * The custom hooks for api calls.
 * Otherwise, every render process will refetch api from server.
 * This hooks returns loading, error state variable and variables in data type parameter(not data object itself)
 * with spread operator.
 *
 * @example
 * const api$ = useMemo(() => myApi(apiParam), [apiParam]);
 * const { loading, error, dataFromApi1, dataFromApi2 } = useApi(api$);
 *
 * @param api Observable instance in RxJs for fetch api
 * @return an object containing any variables in data type parameter and error, loading state
 */
const useApi = <ResponseData>(api: Promise<DataWithCancel<ResponseData>>): UseApi<ResponseData> => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ResponseData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const [unsubscribe, setUnsubscribe] = useState<() => void>(() => (): void => {});

  useEffect(() => {
    api
      .then(({ cancel, ...data }: DataWithCancel<ResponseData>): void => {
        setUnsubscribe(cancel);
        setData((data as unknown) as ResponseData);
        setLoading(false);
      })
      .catch((e): void => {
        setError(e);
      });

    return unsubscribe;
  }, [api, unsubscribe]);

  return { ...data, error, loading, unsubscribe } as UseApi<ResponseData>;
};

export default useApi;
