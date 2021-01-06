import request from '@/utils/request'

// 获取数据源列表
export function getDataSource (params) {
  return request({
    url: '/sys/dataSource/list',
    method: 'GET',
    params
  })
}

// 检查网络连接
export function checkNetwork (params) {
  return request({
    url: '/sys/dataSource/link',
    method: 'GET',
    params
  })
}
// 删除数据
export function deleteDataSource (params) {
  return request({
    url: '/sys/dataSource/delete',
    method: 'POST',
    params
  })
}

// 更新数据源
export function updateDataSource (params) {
  return request({
    url: '/sys/dataSource/update',
    method: 'POST',
    params
  })
}

// 新增数据源
export function addDataSource (params) {
  return request({
    url: '/sys/dataSource/save',
    method: 'POST',
    params
  })
}
