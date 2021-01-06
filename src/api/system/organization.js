import request from '@/utils/request'

export function getOrgList () {
  return request({
    url: '/sys/dept/page',
    method: 'GET',
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 修改组织
export function updateOrg (data) {
  return request({
    url: '/sys/dept/update',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 增加组织
export function addOrg (data) {
  return request({
    url: '/sys/dept/save',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 删除组织
export function deleteOrg (params) {
  return request({
    url: '/sys/dept/delete',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 组织id获取用户
export function getSubUsers (params) {
  return request({
    url: '/sys/dept/subUsers',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 移除组织用户
export function deleteDeptUser (params) {
  return request({
    url: '/sys/dept/deleteUserDept',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 组织排序
export function deptSort (params) {
  return request({
    url: '/sys/dept/updateOrderNum',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}
