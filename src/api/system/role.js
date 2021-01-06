import request from '@/utils/request'

export function getRoleList (params) {
  return request({
    url: '/sys/role/page',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function addRole (data) {
  return request({
    url: '/sys/role/save',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function updateRole (data) {
  return request({
    url: '/sys/role/update',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function deleteRole (params) {
  return request({
    url: '/sys/role/delete',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function getUserByRole (params) {
  return request({
    url: '/sys/role/userPage',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 用户授权
export function authorize (data) {
  return request({
    url: '/sys/role/authorize',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 菜单授权
export function menuAuthorize (data) {
  return request({
    url: '/sys/role/menuAuthorize',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}
