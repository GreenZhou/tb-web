import request from '@/utils/request'

export function getSubTaskList (params) {
  return request({
    url: '/tb/subTask/page',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function getEmpList (params) {
  return request({
    url: '/tb/subTask/listEmps',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function assignEmpList (data) {
  return request({
    url: '/tb/subTask/assignEmps',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function listEmpSubTasks (params) {
  return request({
    url: '/tb/subTask/listEmpSubTasks',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function getBuyerList (params) {
  return request({
    url: '/tb/subTask/listBuyersPage',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function checkBuyers (params) {
  return request({
    url: '/tb/subTask/checkBuyers',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}