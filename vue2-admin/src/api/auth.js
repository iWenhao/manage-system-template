import request from '@/utils/request'

// 登录
export function login(data) {
  return request({ url: '/api/auth/login', method: 'post', data })
}

// 登出
export function logout() {
  return request({ url: '/api/auth/logout', method: 'post' })
}

// 刷新 Token
export function refreshToken(refreshToken) {
  return request({ url: '/api/auth/refresh', method: 'post', data: { refreshToken } })
}

// 获取用户信息
export function getUserInfo() {
  return request({ url: '/api/auth/info', method: 'get' })
}
