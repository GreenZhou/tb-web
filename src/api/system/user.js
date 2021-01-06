import request from '@/utils/request'

export function changeUserPwd (params) {
  return request({
    url: '/sys/user/updatePsw',
    method: 'GET',
    params
  })
}

export function logout () {
  return request({
    url: '/logout',
    method: 'GET',
    baseURL: 'http://127.0.0.1:8080/cas'
  })
}

export function getUserList (params) {
  return request({
    url: '/sys/user/page',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// export function deleteUser (params) {
//   return request({
//     url: '/sys/user/delete',
//     method: 'GET',
//     params,
//     baseURL: process.env.VUE_APP_BASE_API_PRO
//   })
// }

export function addUser (data) {
  return request({
    url: '/sys/user/save',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function updateUser (data) {
  return request({
    url: '/sys/user/update',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function moveToDept (params) {
  return request({
    url: '/sys/user/moveToDept',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 用户信息查询
export function getUserInfo (params) {
  return request({
    url: '/sys/user/info',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 通过部门查询用户
export function getSubDeptUsers (params) {
  return request({
    url: '/sys/user/getSubDeptUsers',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function getCurrentUser () {
  return request({
    url: '/sys/user/current',
    method: 'GET',
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 查询用户是否已注册
export function getInfoByName (params) {
  return request({
    url: '/sys/user/infoByName',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 重置密码
export function resetPsw (params) {
  return request({
    url: '/sys/user/resetPsw',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 人员排序
export function userSort (params) {
  return request({
    url: '/sys/user/updateOrderNum',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}
