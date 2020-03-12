import request from '../ApiClient';

describe('application/json', () => {
  it('api call should success', async () => {
    type Data = {
      resultCode: number;
      msg: string;
      data: {
        phoneNumber: string;
        email: string;
        mainTime: string;
        subTime: string;
      };
    };
    const uri = 'https://iammathking.com/policy/customer';
    const data = await request<Data>('GET', uri);
    expect(data.data.email).toBe('theminq@teamturing.com');
  });
});
