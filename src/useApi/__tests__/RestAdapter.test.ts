import RestClient from '../RestAdapter';
import { RestMethod } from '../internal/ApiClient';

function mockSimpleResponseOnce(uri?: string | RegExp, body?: object) {
  const simpleBody = body ? JSON.stringify(body) : JSON.stringify({ success: true });

  if (uri) {
    fetchMock.mockIf(uri, async (req) => {
      return { status: 200, body: simpleBody };
    });
  } else {
    fetchMock.once(async (req) => {
      return { status: 200, body: simpleBody };
    });
  }
}

describe('Call - ', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    mockSimpleResponseOnce();
  });

  // For coverage
  it('[WHEN] unsubscribe [THEN] abort function of AbortController will be invoked', () => {
    const [dataPromise, unsubscribe] = RestClient['GET']('');
    unsubscribe();
  });

  it('[GIVEN] Network Error [WHEN] request api [THEN] promise will be rejected', () => {
    fetchMock.resetMocks();
    fetchMock.mockRejectOnce(new Error('Network Fail!'));

    const [dataPromise, unsubscribe] = RestClient['GET']('');

    expect.assertions(2);

    return dataPromise()
      .then()
      .catch((e) => {
        expect(e.name).toBe('Error');
        expect(e.message).toBe('Network Fail!');
      });
  });

  describe.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])('RestAdapter[%p] - ', (restMethod: RestMethod) => {
    it('[GIVEN] application/json [THEN] should be success', async () => {
      const [dataPromise, unsubscribe] = RestClient[restMethod]<{ success: boolean }>('');
      const { success } = await dataPromise();
      expect(success).toBe(true);
    });

    it('[GIVEN] application/json [WHEN] with object body [THEN] should be success without GET', async () => {
      const [dataPromise, unsubscribe] = RestClient[restMethod]<{ success: boolean }>('', {
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
      const [dataPromise, unsubscribe] = RestClient[restMethod]<{ success: boolean }>('', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      });
      const { success } = await dataPromise();
      expect(success).toBe(true);
    });

    it('[GIVEN] application/x-www-form-urlencoded;charset=UTF-8 [WHEN] by URLSearchParams body [THEN] should be success', async () => {
      const body = new URLSearchParams();
      body.set('name', 'dooboo');
      const [dataPromise, unsubscribe] = RestClient[restMethod]<{ success: boolean }>('', {
        body,
      });
      const { success } = await dataPromise();
      expect(success).toBe(true);
    });

    it('[GIVEN] application/x-www-form-urlencoded;charset=UTF-8 [WHEN] by specify header with object body [THEN] should be success without GET', async () => {
      const body = { name: 'dooboo' };
      const [dataPromise, unsubscribe] = RestClient[restMethod]<{ success: boolean }>('', {
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
      const [dataPromise, unsubscribe] = RestClient[restMethod]<{ success: boolean }>('', {
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
      const [dataPromise, unsubscribe] = RestClient[restMethod]<{ success: boolean }>('', {
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
      const [dataPromise, unsubscribe] = RestClient[restMethod]<{ success: boolean }>('', {
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
