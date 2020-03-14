import { FetchMock } from 'jest-fetch-mock';
import request from '../ApiClient';

const fetchMock = fetch as FetchMock;

describe('application/json', () => {
  beforeEach(fetchMock.resetMocks);

  it('[GET] should success', async () => {
    const mockedResult = JSON.stringify({
      success: true,
    });
    fetchMock.mockIf(/https:\/\/dooboolab.com/i, mockedResult);
    const uri = 'https://dooboolab.com/';
    const { success } = await request<{ success: boolean }>('GET', uri);
    expect(success).toBe(true);
  });

  it('[GET] snake_case response should convert camelCase', async () => {
    const mockedResult = JSON.stringify({
      result_code: 200,
      my_message: 'This is real?',
      data: {
        people: [
          {
            first_name: 'dooboo',
            last_name: 'obo',
          },
          {
            first_name: 'first',
            last_name: 'last',
          },
        ],
      },
    });
    fetchMock.mockResponseOnce(mockedResult);
    const data: any = await request('GET', '');
    expect(data['result_code']).toBeFalsy();
    expect(data['resultCode']).toBe(200);
    expect(data).toEqual({
      cancel: expect.any(Function),
      resultCode: 200,
      myMessage: 'This is real?',
      data: {
        people: [
          {
            firstName: 'dooboo',
            lastName: 'obo',
          },
          {
            firstName: 'first',
            lastName: 'last',
          },
        ],
      },
    });
  });
});

describe('application/x-www-form-urlencoded;charset=UTF-8', () => {
  beforeEach(fetchMock.resetMocks);

  it('[GET] should success', async () => {
    const mockedResult = JSON.stringify({
      success: true,
    });
    fetchMock.mockIf(/https:\/\/dooboolab.com/i, mockedResult);
    const uri = 'https://dooboolab.com/';
    const { success } = await request<{ success: boolean }>('GET', uri, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    });
    expect(success).toBe(true);
  });

  it('[GET] with URLSearchParams', async () => {
    const mockedResult = JSON.stringify({
      success: true,
    });
    fetchMock.mockIf(/https:\/\/dooboolab.com/i, mockedResult);

    const body = new URLSearchParams();
    body.append('name', 'dooboo hooks');
    const uri = 'https://dooboolab.com/';
    const { success } = await request<{ success: boolean }>('GET', uri, {
      body: body,
    });
    expect(success).toBe(true);
  });

  it('[GET] with general body should success api call', async () => {
    fetchMock.mockIf(/https:\/\/dooboolab.com/i, async (req) => {
      return { status: 400, body: JSON.stringify({ success: true }) };
    });

    const uri = 'https://dooboolab.com/';
    const { success } = await request<{ success: boolean }>('GET', uri, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: { name: 'dooboo hooks' },
    });
    expect(success).toBe(true);
  });
});

describe('multipart/form-data', () => {
  beforeEach(fetchMock.resetMocks);

  it('[POST] should success', async () => {
    const mockedResult = JSON.stringify({
      success: true,
    });
    fetchMock.mockIf(/https:\/\/dooboolab.com/i, mockedResult);
    const uri = 'https://dooboolab.com/';
    const { success } = await request<{ success: boolean }>('POST', uri, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(success).toBe(true);
  });

  it('[POST] with body, file', async () => {
    const mockedResult = JSON.stringify({
      success: true,
    });
    fetchMock.mockResponseOnce(mockedResult);
    const data = await request('POST', '', {
      body: { name: 'dooboo' },
      files: [{ key: 'image', file: { name: 'image.jpg', uri: 'uri', type: 'image/*' } }],
    });
  });
});
