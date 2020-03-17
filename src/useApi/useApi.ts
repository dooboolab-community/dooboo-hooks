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
  success: boolean;
  loading: boolean;
  error: Error | null;
  unsubscribe: (() => void) | null;
  call: () => void;
} & {
  [P in keyof ResponseData]?: ResponseData[P];
};
const useApi = <ResponseData>(
  api: ApiResult<ResponseData>,
  dependencies: any[] = [],
  cold = false,
): UseApi<ResponseData> => {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ResponseData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | null>(null);
  const [call, setCall] = useState<(() => void) | null>(null);

  const previousDependencies = useRef<any[]>();

  useEffect(() => {
    if (isDirtyDependencies(dependencies, previousDependencies.current)) {
      previousDependencies.current = dependencies;

      const callApi = async (): Promise<void> => {
        const [call, cancel] = api;

        setUnsubscribe(() => (): void => {
          cancel();
        });

        if (cold) {
          setCall(() => async (): Promise<void> => {
            try {
              setSuccess(false);
              setLoading(true);
              setData(await call());
              setLoading(false);
              setSuccess(true);
            } catch (e) {
              setLoading(false);
              setError(e);
            }
          });
        } else {
          try {
            setSuccess(false);
            setLoading(true);
            setData(await call());
            setLoading(false);
            setSuccess(true);
          } catch (e) {
            setLoading(false);
            setError(e);
          }
        }
      };

      callApi().then();
    }
    return (): void => {
      unsubscribe && unsubscribe();
    };
  }, [unsubscribe, api, cold, dependencies, previousDependencies]);

  return { ...data, error, success, loading, unsubscribe, call };
};

export default useApi;
