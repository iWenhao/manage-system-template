import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function getToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

export function setToken(token: string): void {
  Cookies.set(ACCESS_TOKEN_KEY, token, { expires: 1 }); // 1 天
}

export function removeToken(): void {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  Cookies.set(REFRESH_TOKEN_KEY, token, { expires: 7 }); // 7 天
}
