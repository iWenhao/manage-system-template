import Vue from 'vue'
import Vuex from 'vuex'
import { getToken, setToken, setRefreshToken, removeToken } from '@/utils/auth'
import { login as loginApi, logout as logoutApi, getUserInfo } from '@/api/auth'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    token: getToken() || '',
    userInfo: null,
    roles: [],
    permissions: [],
  },

  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
    },
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
    },
    SET_ROLES(state, roles) {
      state.roles = roles
    },
    SET_PERMISSIONS(state, permissions) {
      state.permissions = permissions
    },
  },

  actions: {
    // 登录
    async login({ commit }, loginForm) {
      const res = await loginApi(loginForm)
      const { accessToken, refreshToken, user } = res.data
      setToken(accessToken)
      setRefreshToken(refreshToken)
      commit('SET_TOKEN', accessToken)
      commit('SET_USER_INFO', user)
      commit('SET_ROLES', user.roles)
      commit('SET_PERMISSIONS', user.permissions)
      return res
    },

    // 获取用户信息
    async getInfo({ commit }) {
      const res = await getUserInfo()
      const user = res.data
      commit('SET_USER_INFO', user)
      commit('SET_ROLES', user.roles)
      commit('SET_PERMISSIONS', user.permissions)
      return res
    },

    // 登出
    async logout({ commit }) {
      try {
        await logoutApi()
      } finally {
        commit('SET_TOKEN', '')
        commit('SET_USER_INFO', null)
        commit('SET_ROLES', [])
        commit('SET_PERMISSIONS', [])
        removeToken()
      }
    },

    // 重置状态
    resetState({ commit }) {
      commit('SET_TOKEN', '')
      commit('SET_USER_INFO', null)
      commit('SET_ROLES', [])
      commit('SET_PERMISSIONS', [])
      removeToken()
    },
  },

  getters: {
    hasRole: state => role => {
      return state.roles.includes('admin') || state.roles.includes(role)
    },
    hasPermission: state => permission => {
      return state.roles.includes('admin') || state.permissions.includes('*:*:*') || state.permissions.includes(permission)
    },
  },
})

export default store
