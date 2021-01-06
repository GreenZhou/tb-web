import request from '@/utils/request'

// 获取字典列表
export function getDataDic (params) {
  return request({
    url: '/sys/dict/page',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 新增字典
export function addDicType (data) {
  return request({
    url: '/sys/dict/save',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 删除字典
export function removeDicType (params) {
  return request({
    url: '/sys/dict/delete',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 修改字典
export function updateDicType (data) {
  return request({
    url: '/sys/dict/update',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}
