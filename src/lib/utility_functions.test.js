import { decodedQueryParameter } from './utility_functions';


test('Unencoded string is unchanged', () => {
  expect(decodedQueryParameter('hello')).toBe('hello');
});

test('String with spaces is unchanged', () => {
  expect(decodedQueryParameter('hello there everyone!')).toBe('hello there everyone!');
});

test('String with encoded " " characters are decoded', () => {
  expect(decodedQueryParameter('warp+factor+five+scotty')).toBe('warp factor five scotty');
});

test('String with url-encoded characters are decoded', () => {
  expect(decodedQueryParameter('airplanes and spaceships cost %24%24%24')).toBe('airplanes and spaceships cost $$$');
});

test('String with encoded " " characters and url-encoded characters are decoded', () => {
  expect(decodedQueryParameter('airplanes %26 spaceships cost %24%24%24')).toBe('airplanes & spaceships cost $$$');
});

test('String with url-encoded "+" and form-encoded " " characters are decoded', () => {
  expect(decodedQueryParameter('two%20%2b%20two%20equals%20four')).toBe('two + two equals four');
});
