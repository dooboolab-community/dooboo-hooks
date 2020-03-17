import { ApiResult } from '../internal/ApiClient';

let mockApi = jest.fn();
let mockUnsubscribe = jest.fn();
let mockCall = jest.fn();

describe('useApi Test', () => {
  beforeEach(() => {
    mockUnsubscribe.mockReset();
    mockCall.mockReset();
    mockApi.mockReset();
    mockApi.mockReturnValueOnce([mockCall, mockUnsubscribe]);
  });

  it('render success', () => {});
});
