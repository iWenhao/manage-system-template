import Cookies from 'js-cookie'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export function getToken() {
  return Cookies.get(ACCESS_TOKEN_KEY)
}

export function setToken(token) {
  Cookies.set(ACCESS_TOKEN_KEY, token, { expires: 1 })
}

export function removeToken() {
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
}

export function getRefreshToken() {
  return Cookies.get(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token) {
  Cookies.set(REFRESH_TOKEN_KEY, token, { expires: 7 })
}
