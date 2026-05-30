import request from '@/utils/request'

// ==================== 用户管理 ====================
export function listUser(params) {
  return request({ url: '/api/user/list', method: 'get', params })
}
export function getUser(id) {
  return request({ url: `/api/user/${id}`, method: 'get' })
}
export function addUser(data) {
  return request({ url: '/api/user', method: 'post', data })
}
export function updateUser(id, data) {
  return request({ url: `/api/user/${id}`, method: 'put', data })
}
export function deleteUser(id) {
  return request({ url: `/api/user/${id}`, method: 'delete' })
}
export function resetUserPwd(id, password) {
  return request({ url: `/api/user/${id}/reset-pwd`, method: 'put', data: { password } })
}

// ==================== 角色管理 ====================
export function listRole(params) {
  return request({ url: '/api/role/list', method: 'get', params })
}
export function getAllRole() {
  return request({ url: '/api/role/all', method: 'get' })
}
export function getRole(id) {
  return request({ url: `/api/role/${id}`, method: 'get' })
}
export function addRole(data) {
  return request({ url: '/api/role', method: 'post', data })
}
export function updateRole(id, data) {
  return request({ url: `/api/role/${id}`, method: 'put', data })
}
export function deleteRole(id) {
  return request({ url: `/api/role/${id}`, method: 'delete' })
}

// ==================== 菜单管理 ====================
export function listMenu(params) {
  return request({ url: '/api/menu/list', method: 'get', params })
}
export function getMenuTree() {
  return request({ url: '/api/menu/tree', method: 'get' })
}
export function getMenu(id) {
  return request({ url: `/api/menu/${id}`, method: 'get' })
}
export function addMenu(data) {
  return request({ url: '/api/menu', method: 'post', data })
}
export function updateMenu(id, data) {
  return request({ url: `/api/menu/${id}`, method: 'put', data })
}
export function deleteMenu(id) {
  return request({ url: `/api/menu/${id}`, method: 'delete' })
}
export function getUserMenus() {
  return request({ url: '/api/menu/user/menus', method: 'get' })
}

// ==================== 部门管理 ====================
export function listDept(params) {
  return request({ url: '/api/dept/list', method: 'get', params })
}
export function getDept(id) {
  return request({ url: `/api/dept/${id}`, method: 'get' })
}
export function addDept(data) {
  return request({ url: '/api/dept', method: 'post', data })
}
export function updateDept(id, data) {
  return request({ url: `/api/dept/${id}`, method: 'put', data })
}
export function deleteDept(id) {
  return request({ url: `/api/dept/${id}`, method: 'delete' })
}

// ==================== 岗位管理 ====================
export function listPost(params) {
  return request({ url: '/api/post/list', method: 'get', params })
}
export function getPost(id) {
  return request({ url: `/api/post/${id}`, method: 'get' })
}
export function addPost(data) {
  return request({ url: '/api/post', method: 'post', data })
}
export function updatePost(id, data) {
  return request({ url: `/api/post/${id}`, method: 'put', data })
}
export function deletePost(id) {
  return request({ url: `/api/post/${id}`, method: 'delete' })
}

// ==================== 字典管理 ====================
export function listDictType(params) {
  return request({ url: '/api/dict/type/list', method: 'get', params })
}
export function getDictType(id) {
  return request({ url: `/api/dict/type/${id}`, method: 'get' })
}
export function addDictType(data) {
  return request({ url: '/api/dict/type', method: 'post', data })
}
export function updateDictType(id, data) {
  return request({ url: `/api/dict/type/${id}`, method: 'put', data })
}
export function deleteDictType(id) {
  return request({ url: `/api/dict/type/${id}`, method: 'delete' })
}
export function listDictData(params) {
  return request({ url: '/api/dict/data/list', method: 'get', params })
}
export function getDictData(id) {
  return request({ url: `/api/dict/data/${id}`, method: 'get' })
}
export function addDictData(data) {
  return request({ url: '/api/dict/data', method: 'post', data })
}
export function updateDictData(id, data) {
  return request({ url: `/api/dict/data/${id}`, method: 'put', data })
}
export function deleteDictData(id) {
  return request({ url: `/api/dict/data/${id}`, method: 'delete' })
}

// ==================== 参数管理 ====================
export function listConfig(params) {
  return request({ url: '/api/config/list', method: 'get', params })
}
export function getConfig(id) {
  return request({ url: `/api/config/${id}`, method: 'get' })
}
export function addConfig(data) {
  return request({ url: '/api/config', method: 'post', data })
}
export function updateConfig(id, data) {
  return request({ url: `/api/config/${id}`, method: 'put', data })
}
export function deleteConfig(id) {
  return request({ url: `/api/config/${id}`, method: 'delete' })
}

// ==================== 通知公告 ====================
export function listNotice(params) {
  return request({ url: '/api/notice/list', method: 'get', params })
}
export function getNotice(id) {
  return request({ url: `/api/notice/${id}`, method: 'get' })
}
export function addNotice(data) {
  return request({ url: '/api/notice', method: 'post', data })
}
export function updateNotice(id, data) {
  return request({ url: `/api/notice/${id}`, method: 'put', data })
}
export function deleteNotice(id) {
  return request({ url: `/api/notice/${id}`, method: 'delete' })
}
