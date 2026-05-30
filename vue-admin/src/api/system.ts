import request from '@/utils/request';

// 用户管理
export function listUser(params: any) {
  return request({ url: '/api/user/list', method: 'get', params });
}
export function getUser(id: number) {
  return request({ url: `/api/user/${id}`, method: 'get' });
}
export function addUser(data: any) {
  return request({ url: '/api/user', method: 'post', data });
}
export function updateUser(id: number, data: any) {
  return request({ url: `/api/user/${id}`, method: 'put', data });
}
export function deleteUser(id: number) {
  return request({ url: `/api/user/${id}`, method: 'delete' });
}
export function resetUserPwd(id: number, password: string) {
  return request({ url: `/api/user/${id}/reset-pwd`, method: 'put', data: { password } });
}

// 角色管理
export function listRole(params: any) {
  return request({ url: '/api/role/list', method: 'get', params });
}
export function getAllRole() {
  return request({ url: '/api/role/all', method: 'get' });
}
export function getRole(id: number) {
  return request({ url: `/api/role/${id}`, method: 'get' });
}
export function addRole(data: any) {
  return request({ url: '/api/role', method: 'post', data });
}
export function updateRole(id: number, data: any) {
  return request({ url: `/api/role/${id}`, method: 'put', data });
}
export function deleteRole(id: number) {
  return request({ url: `/api/role/${id}`, method: 'delete' });
}

// 菜单管理
export function listMenu(params?: any) {
  return request({ url: '/api/menu/list', method: 'get', params });
}
export function getMenuTree() {
  return request({ url: '/api/menu/tree', method: 'get' });
}
export function getMenu(id: number) {
  return request({ url: `/api/menu/${id}`, method: 'get' });
}
export function addMenu(data: any) {
  return request({ url: '/api/menu', method: 'post', data });
}
export function updateMenu(id: number, data: any) {
  return request({ url: `/api/menu/${id}`, method: 'put', data });
}
export function deleteMenu(id: number) {
  return request({ url: `/api/menu/${id}`, method: 'delete' });
}
export function sortMenu(data: any) {
  return request({ url: '/api/menu/sort', method: 'put', data });
}
export function getUserMenus() {
  return request({ url: '/api/menu/user/menus', method: 'get' });
}

// 部门管理
export function listDept(params?: any) {
  return request({ url: '/api/dept/list', method: 'get', params });
}
export function getDept(id: number) {
  return request({ url: `/api/dept/${id}`, method: 'get' });
}
export function getDeptTree() {
  return request({ url: '/api/dept/tree', method: 'get' });
}
export function addDept(data: any) {
  return request({ url: '/api/dept', method: 'post', data });
}
export function updateDept(id: number, data: any) {
  return request({ url: `/api/dept/${id}`, method: 'put', data });
}
export function deleteDept(id: number) {
  return request({ url: `/api/dept/${id}`, method: 'delete' });
}

// 岗位管理
export function listPost(params: any) {
  return request({ url: '/api/post/list', method: 'get', params });
}
export function getPost(id: number) {
  return request({ url: `/api/post/${id}`, method: 'get' });
}
export function addPost(data: any) {
  return request({ url: '/api/post', method: 'post', data });
}
export function updatePost(id: number, data: any) {
  return request({ url: `/api/post/${id}`, method: 'put', data });
}
export function deletePost(id: number) {
  return request({ url: `/api/post/${id}`, method: 'delete' });
}

// 字典管理
export function listDictType(params: any) {
  return request({ url: '/api/dict/type/list', method: 'get', params });
}
export function getDictType(id: number) {
  return request({ url: `/api/dict/type/${id}`, method: 'get' });
}
export function addDictType(data: any) {
  return request({ url: '/api/dict/type', method: 'post', data });
}
export function updateDictType(id: number, data: any) {
  return request({ url: `/api/dict/type/${id}`, method: 'put', data });
}
export function deleteDictType(id: number) {
  return request({ url: `/api/dict/type/${id}`, method: 'delete' });
}
export function listDictData(params: any) {
  return request({ url: '/api/dict/data/list', method: 'get', params });
}
export function getDictData(id: number) {
  return request({ url: `/api/dict/data/${id}`, method: 'get' });
}
export function addDictData(data: any) {
  return request({ url: '/api/dict/data', method: 'post', data });
}
export function updateDictData(id: number, data: any) {
  return request({ url: `/api/dict/data/${id}`, method: 'put', data });
}
export function deleteDictData(id: number) {
  return request({ url: `/api/dict/data/${id}`, method: 'delete' });
}

// 参数管理
export function listConfig(params: any) {
  return request({ url: '/api/config/list', method: 'get', params });
}
export function getConfig(id: number) {
  return request({ url: `/api/config/${id}`, method: 'get' });
}
export function addConfig(data: any) {
  return request({ url: '/api/config', method: 'post', data });
}
export function updateConfig(id: number, data: any) {
  return request({ url: `/api/config/${id}`, method: 'put', data });
}
export function deleteConfig(id: number) {
  return request({ url: `/api/config/${id}`, method: 'delete' });
}

// 通知公告
export function listNotice(params: any) {
  return request({ url: '/api/notice/list', method: 'get', params });
}
export function getNotice(id: number) {
  return request({ url: `/api/notice/${id}`, method: 'get' });
}
export function addNotice(data: any) {
  return request({ url: '/api/notice', method: 'post', data });
}
export function updateNotice(id: number, data: any) {
  return request({ url: `/api/notice/${id}`, method: 'put', data });
}
export function deleteNotice(id: number) {
  return request({ url: `/api/notice/${id}`, method: 'delete' });
}
