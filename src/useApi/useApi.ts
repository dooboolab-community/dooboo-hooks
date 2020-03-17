import { ApiResult, Call, Unsubscribe } from './internal/ApiClient';
import { useEffect, useReducer, useRef, useState } from 'react';

import { JSONCandidate } from './internal/convertObjectKeysCamelCaseFromSnakeCase';

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

type State<ResponseData = JSONCandidate> = {
  success: boolean;
  loading: boolean;
  error: Error | null;
  unsubscribe: (() => void) | null;
  call: () => void;
} & {
  [P in keyof ResponseData]?: ResponseData[P];
};

type ActionTypes = 'SetUnsubscribe' | 'SetCall' | 'CallStart' | 'CallSuccess' | 'CallFail';
type Action<Payload = any> = { type: ActionTypes; payload?: Payload };
type ActionCreator<Payload = undefined> = (...args) => Action<Payload>;

const reducer = <ResponseData>(state: State<ResponseData>, { type, payload }: Action): State<ResponseData> => {
  switch (type) {
    case 'SetUnsubscribe':
      return { ...state, unsubscribe: payload };
    case 'SetCall':
      return { ...state, call: payload };
    case 'CallStart':
      return {
        ...state,
        error: null,
        loading: true,
        success: false,
      };
    case 'CallSuccess':
      return {
        ...state,
        error: null,
        loading: false,
        success: true,
        ...(payload as object),
      };
    case 'CallFail':
      return {
        ...state,
        error: payload,
        loading: false,
        success: false,
      };
  }
  return state;
};

const setUnsubscribe1: ActionCreator<Unsubscribe> = (unsubscribe: Unsubscribe) => ({
  type: 'SetUnsubscribe',
  payload: unsubscribe,
});
const setCall1: ActionCreator<Call> = (call: Call) => ({
  type: 'SetCall',
  payload: call,
});
const callStart1: ActionCreator = () => ({
  type: 'CallStart',
});
const callSuccess1: ActionCreator<JSONCandidate> = (data: JSONCandidate) => ({
  type: 'CallSuccess',
  payload: data,
});
const callFail1: ActionCreator<Error> = (error: Error) => ({
  type: 'CallFail',
  payload: error,
});

const initialState: State = {
  call: null,
  error: null,
  loading: false,
  success: false,
  unsubscribe: undefined,
};

const useApi = <ResponseData>(
  api: ApiResult<ResponseData>,
  dependencies: any[] = [],
  cold = false,
): State<ResponseData> => {
  const [state, dispatch] = useReducer<(prevState: State<ResponseData>, action: Action) => State<ResponseData>>(
    reducer,
    initialState,
  );

  const previousDependencies = useRef<any[]>();

  useEffect(() => {
    if (isDirtyDependencies(dependencies, previousDependencies.current)) {
      previousDependencies.current = dependencies;

      const callApi = async (): Promise<void> => {
        const [call, cancel] = api;

        dispatch(
          setUnsubscribe1(() => (): void => {
            cancel();
          }),
        );

        if (cold) {
          dispatch(
            setCall1(() => async (): Promise<void> => {
              try {
                dispatch(callStart1());
                const data = await call();
                dispatch(callSuccess1(data));
              } catch (e) {
                dispatch(callFail1(e));
              }
            }),
          );
        } else {
          try {
            dispatch(callStart1());
            const data = await call();
            dispatch(callSuccess1(data));
          } catch (e) {
            dispatch(callFail1(e));
          }
        }
      };

      callApi().then();
    }
    return (): void => {
      state.unsubscribe && state.unsubscribe();
    };
  }, [api, cold, dependencies, state]);

  return { ...state };
};

export default useApi;
