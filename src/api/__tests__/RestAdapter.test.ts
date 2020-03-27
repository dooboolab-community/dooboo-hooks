import { clearApiDefaultSettings, setApiDefaultSettings } from '..';

import { FetchMock } from 'jest-fetch-mock';
import RestClient from '../RestAdapter';

jest.useRealTimers();

declare const fetchMock: FetchMock;
function mockSimpleResponseOnce(uri?: string | RegExp, body?: object): void {
  const simpleBody = body ? JSON.stringify(body) : JSON.stringify({ success: true });

  if (uri) {
    fetchMock.mockIf(uri, async () => {
      return { status: 200, body: simpleBody };
    });
  } else {
    fetchMock.once(async () => {
      return { status: 200, body: simpleBody };
    });
  }
}

describe('Call - ', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    mockSimpleResponseOnce();
  });

  it('[GIVEN] network response status code = 400 & defaultSettings [THEN] call fail', () => {
    fetchMock.resetMocks();
    fetchMock.once(async () => {
      return { status: 400, body: JSON.stringify({}) };
    });
    const [dataPromise] = RestClient.GET('');

    expect.assertions(2);

    return dataPromise()
      .then()
      .catch((e) => {
        expect(e.name).toBe('Error');
        expect(e.message).toBe(
          "Status Code [400] doesn't exist in responseCodeWhiteListRange [200, 300). If you want to include 400 to white list, use responseCodeWhiteList settings in setApiDefaultSettings()",
        );
      });
  });

  it('[GIVEN] network response status code = 400 & responseCodeWhiteListRange [200, 500) [THEN] call success', async () => {
    setApiDefaultSettings({ responseCodeWhiteListRange: { minInclude: 200, maxExclude: 500 } });

    fetchMock.resetMocks();
    fetchMock.once(async () => {
      return { status: 400, body: JSON.stringify({ name: 'mj' }) };
    });
    const [dataPromise] = RestClient.GET<{ name: string }>('');

    const data = await dataPromise();
    expect(data.name).toBe('mj');

    clearApiDefaultSettings();
  });

  it('[GIVEN] network response status code = 400 & 400 in white list [THEN] call success', async () => {
    setApiDefaultSettings({ responseCodeWhiteList: [400] });

    fetchMock.resetMocks();
    fetchMock.once(async () => {
      return { status: 400, body: JSON.stringify({ name: 'mj' }) };
    });
    const [dataPromise] = RestClient.GET<{ name: string }>('');

    const data = await dataPromise();
    expect(data.name).toBe('mj');

    clearApiDefaultSettings();
  });

  it('[GIVEN] network response status code = 200 & 200 in black list [THEN] call success', async () => {
    setApiDefaultSettings({ responseCodeBlackList: [200, 100] });

    fetchMock.resetMocks();
    fetchMock.once(async () => {
      return { status: 200, body: JSON.stringify({ name: 'mj' }) };
    });
    const [dataPromise] = RestClient.GET<{ name: string }>('');

    expect.assertions(2);
    try {
      const data = await dataPromise();
    } catch (e) {
      expect(e.name).toBe('Error');
      expect(e.message).toBe('Status Code [200] exists in responseCodeBlackList [200,100]');
    }

    clearApiDefaultSettings();
  });

  it('[WHEN] unsubscribe [THEN] abort function of AbortController will be invoked', () => {
    const [, unsubscribe] = RestClient.GET('');
    unsubscribe();
  });

  it('[GIVEN] Network Error [WHEN] request api [THEN] promise will be rejected', () => {
    fetchMock.resetMocks();
    fetchMock.mockRejectOnce(new Error('Network Fail!'));

    const [dataPromise] = RestClient.GET('');

    expect.assertions(2);

    return dataPromise()
      .then()
      .catch((e) => {
        expect(e.name).toBe('Error');
        expect(e.message).toBe('Network Fail!');
      });
  });

  it('[GIVEN] Timeout [WHEN] request api [THEN] promise will be rejected', async (done) => {
    fetchMock.resetMocks();
    fetchMock.once(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5400));
      return { status: 200 };
    });

    const [dataPromise] = RestClient.GET('');

    try {
      await dataPromise();
    } catch (e) {
      done();
    }
  }, 10000);

  it('[GIVEN] requestInterceptor is a Promise [THEN] call success', async () => {
    setApiDefaultSettings({ requestInterceptor: (request) => Promise.resolve(request) });
    const [dataPromise] = RestClient.GET('');
    await dataPromise();
    clearApiDefaultSettings();
  });
  it('[GIVEN] responseInterceptor is a Promise [THEN] call success', async () => {
    setApiDefaultSettings({ responseInterceptor: (response) => Promise.resolve(response) });
    const [dataPromise] = RestClient.GET('');
    await dataPromise();
    clearApiDefaultSettings();
  });

  describe.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])('RestAdapter[%p] - ', (restMethod): void => {
    it('[GIVEN] application/json [THEN] should be success', async () => {
      const [dataPromise] = RestClient[restMethod]<{ success: boolean }>('');
      const { success } = await dataPromise();
      expect(success).toBe(true);
    });

    it('[GIVEN] application/json [WHEN] with object body [THEN] should be success without GET', async () => {
      const [dataPromise] = RestClient[restMethod]<{ success: boolean }>('', {
        body: { name: 'dooboo' },
      });

      if (restMethod !== 'GET') {
        const { success } = await dataPromise();
        expect(success).toBe(true);
      } else {
        try {
          await dataPromise();
        } catch (e) {
          expect(e.name).toBe('TypeError');
          expect(e.message).toBe('Request with GET/HEAD method cannot have body');
        }
      }
    });

    it('[GIVEN] application/x-www-form-urlencoded;charset=UTF-8 [WHEN] by specify header [THEN] should be success', async () => {
      const [dataPromise] = RestClient[restMethod]<{ success: boolean }>('', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      });
      const { success } = await dataPromise();
      expect(success).toBe(true);
    });

    it('[GIVEN] application/x-www-form-urlencoded;charset=UTF-8 [WHEN] by URLSearchParams body [THEN] should be success', async () => {
      const body = new URLSearchParams();
      body.set('name', 'dooboo');
      const [dataPromise] = RestClient[restMethod]<{ success: boolean }>('', {
        body,
      });
      const { success } = await dataPromise();
      expect(success).toBe(true);
    });

    it('[GIVEN] application/x-www-form-urlencoded;charset=UTF-8 [WHEN] by specify header with object body [THEN] should be success without GET', async () => {
      const body = { name: 'dooboo' };
      const [dataPromise] = RestClient[restMethod]<{ success: boolean }>('', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body,
      });

      if (restMethod !== 'GET') {
        const { success } = await dataPromise();
        expect(success).toBe(true);
      } else {
        try {
          await dataPromise();
        } catch (e) {
          expect(e.name).toBe('TypeError');
          expect(e.message).toBe('Request with GET/HEAD method cannot have body');
        }
      }
    });

    it('[GIVEN] multipart/form-data [WHEN] by header [THEN] should be success without GET', async () => {
      const [dataPromise] = RestClient[restMethod]<{ success: boolean }>('', {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (restMethod !== 'GET') {
        const { success } = await dataPromise();
        expect(success).toBe(true);
      } else {
        try {
          await dataPromise();
        } catch (e) {
          expect(e.name).toBe('TypeError');
          expect(e.message).toBe('Request with GET/HEAD method cannot have body');
        }
      }
    });

    it('[GIVEN] multipart/form-data [WHEN] by file [THEN] should be success without GET', async () => {
      const [dataPromise] = RestClient[restMethod]<{ success: boolean }>('', {
        files: [{ key: 'thumbnail', file: { uri: 'file://my/video/file/path.mp4', name: 'video', type: 'video/*' } }],
      });

      if (restMethod !== 'GET') {
        const { success } = await dataPromise();
        expect(success).toBe(true);
      } else {
        try {
          await dataPromise();
        } catch (e) {
          expect(e.name).toBe('TypeError');
          expect(e.message).toBe('Request with GET/HEAD method cannot have body');
        }
      }
    });

    it('[GIVEN] multipart/form-data [WHEN] by header with object body [THEN] should be success without GET', async () => {
      const [dataPromise] = RestClient[restMethod]<{ success: boolean }>('', {
        headers: { 'Content-Type': 'multipart/form-data' },
        body: { name: 'dooboo' },
      });

      if (restMethod !== 'GET') {
        const { success } = await dataPromise();
        expect(success).toBe(true);
      } else {
        try {
          await dataPromise();
        } catch (e) {
          expect(e.name).toBe('TypeError');
          expect(e.message).toBe('Request with GET/HEAD method cannot have body');
        }
      }
    });
  });
});
