import { ApiResult, Unsubscribe } from './internal/ApiClient';
import { useEffect, useRef, useState } from 'react';

function isDirtyDependencies(dep1: any[] | undefined, dep2: any[] | undefined): boolean {
  if (!dep1 || !dep2) return true;
  if (dep1.length !== dep2.length) return true;

  for (let i = 0; i < dep1.length; i++) {
    if (typeof dep1[i] !== typeof dep2[i]) {
      return true;
    }
    if (!Object.is(dep1[i], dep2[i])) {
      return true;
    }
  }

  return false;
}

type UseApi<ResponseData> = {
  loading: boolean;
  error: Error | null;
  unsubscribe: (() => void) | null;
  call: () => Promise<ResponseData>;
} & {
  [P in keyof ResponseData]?: ResponseData[P];
};
const useApi = <ResponseData>(api: ApiResult<ResponseData>, dependencies = [], cold = false): UseApi<ResponseData> => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ResponseData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | null>(null);
  const [call, setCall] = useState<(() => Promise<ResponseData>) | null>(null);

  const previousDependencies = useRef<any[]>();

  useEffect(() => {
    if (isDirtyDependencies(dependencies, previousDependencies.current)) {
      previousDependencies.current = dependencies;

      const callApi = async (): Promise<void> => {
        const [call, cancel] = api;

        setCall(() => (): Promise<ResponseData> => {
          return call();
        });

        setUnsubscribe(() => (): void => {
          cancel();
        });

        if (!cold) {
          try {
            setLoading(true);
            setData(await call());
          } catch (e) {
            setError(e);
          } finally {
            setLoading(false);
          }
        }
      };

      callApi().then();
    }
    return (): void => {
      // eslint-disable-next-line no-unused-expressions
      unsubscribe?.();
    };
  }, [unsubscribe, api, cold, dependencies, previousDependencies]);

  return { ...data, error, loading, unsubscribe, call } as UseApi<ResponseData>;
};

export default useApi;
