import request from '@/utils/request'

// 获取系统日志列表
export function getLogs (params) {
  return request({
    url: '/sys/log/page',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 获取系统日志操作类型
export function getLogOperation (params) {
  return request({
    url: '/sys/log/operation',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}
