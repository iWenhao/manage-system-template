import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import { getToken, removeToken } from './auth'
import router from '@/router'

const service = axios.create({
  baseURL: '',
  timeout: 30000,
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      Message.error(res.message || '请求失败')
      if (res.code === 401) {
        MessageBox.confirm('登录已过期，请重新登录', '提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          removeToken()
          router.push('/login')
        })
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    if (error.response && error.response.status === 401) {
      removeToken()
      router.push('/login')
    }
    Message.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default service
