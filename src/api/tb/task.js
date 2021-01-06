import request from '@/utils/request'

export function getTaskList (params) {
  return request({
    url: '/tb/task/page',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function addTask (data) {
  return request({
    url: '/tb/task/save',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function deleteTask (params) {
  return request({
    url: '/tb/task/delete',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function publishTask (data) {
  return request({
    url: '/tb/task/publish',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}
