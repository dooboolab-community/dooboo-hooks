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
});
