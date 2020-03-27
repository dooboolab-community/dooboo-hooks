import { constructUriWithQueryParams } from '../constructUriWithQueryParams';


it('without params should be same', () => {
  const uri = 'https://www.google.com/';

  expect(constructUriWithQueryParams(uri)).toBe(uri);
});

it('with params should be added params to uri', () => {
  const uri = 'https://www.google.com/';
  expect(constructUriWithQueryParams(uri, { name: 'dooboo', password: 'idk' })).toBe(
    'https://www.google.com/?name=dooboo&password=idk',
  );
});

it('with params in uri should be same', () => {
  const uri = 'https://www.google.com/?name=dooboo&password=awdaksjdlk';

  expect(constructUriWithQueryParams(uri)).toBe(encodeURI(uri));
});

it('same params should be merged with second argument data', () => {
  const uri = 'https://www.google.com/?name=dooboo';
  const queryParams = { name: 'mym0404' };

  expect(constructUriWithQueryParams(uri, queryParams)).toBe('https://www.google.com/?name=mym0404');
});

it('invoke error should be same', () => {
  const errorUri = 'kalj2lkdalkwd';
  expect(constructUriWithQueryParams(errorUri)).toBe(errorUri);
});
