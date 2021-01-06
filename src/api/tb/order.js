import request from '@/utils/request'

export function getOrderList (params) {
  return request({
    url: '/tb/order/page',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function getOrderBuyerList (params) {
  return request({
    url: '/tb/order/listOrderBuyersPage',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}