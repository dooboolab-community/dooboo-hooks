import { ApiResult } from '../internal/ApiClient';
import { renderHook } from '@testing-library/react-hooks';
import useApi from '../useApi';

type ResponseType = {
  name: string;
  age: number;
};
const responseData: ResponseType = { name: 'dooboo', age: 24 };
let mockUnsubscribe = jest.fn();
let mockCall = jest.fn();
let apiResult: ApiResult<ResponseType>;

describe('useApi', () => {
  beforeEach(() => {
    apiResult = [mockCall, mockUnsubscribe];
    mockUnsubscribe.mockReset();
    mockCall.mockReset();
    mockCall.mockResolvedValueOnce(responseData);
  });

  it('render success', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useApi(apiResult, [], true));
    await waitForNextUpdate();
    expect(result.current).toBeTruthy();
  });

  it('hot api call should be success and states have right values', async () => {
    const {
      result: {
        current: { name, age, call, error, loading, success, unsubscribe },
      },
      waitForNextUpdate,
      waitForValueToChange,
    } = renderHook(() => useApi(apiResult, []));

    expect(name).toBeUndefined();
    expect(age).toBeUndefined();

    expect(call).toBeNull();
    expect(error).toBeNull();
    expect(loading).toBe(true);
    expect(success).toBe(false);
    expect(unsubscribe).toBeTruthy();

    while (true) {
      console.log(name, age, call, error, loading, success, unsubscribe);
      await waitForNextUpdate();
      console.log(name, age, call, error, loading, success, unsubscribe);
    }

    expect(name).toBe('dooboo');
    expect(age).toBe(24);
  });
});
