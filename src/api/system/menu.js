/**
 * Created by YangLiu on 2020/5/12.
 */
import request from '@/utils/request'

// 获取匹配菜单
export function getMenu (params) {
  return request({
    url: '/sys/menu/page',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 修改菜单
export function updateMenu (data) {
  return request({
    url: '/sys/menu/update',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 删除菜单
export function deleteMenu (data) {
  return request({
    url: '/sys/menu/delete',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 添加菜单
export function addMenu (data) {
  return request({
    url: '/sys/menu/save',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 菜单角色授权
export function addMenuRoles (data) {
  return request({
    url: '/sys/menu/addRoles',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 修改菜单功能
export function updateMenuFunc (data) {
  return request({
    url: '/sys/function/update',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 删除菜单功能
export function deleteMenuFunc (data) {
  return request({
    url: '/sys/function/delete',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 添加菜单功能
export function addMenuFunc (data) {
  return request({
    url: '/sys/function/save',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 通过角色获取菜单
export function getMenusByRole (data) {
  return request({
    url: '/sys/menu/getMenusByRole',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 更改菜单列表的排序
export function updateOrderNum (data) {
  return request({
    url: '/sys/menu/updateOrderNum',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 通过菜单Id获取功能
export function getFuncsByMenuId (data) {
  return request({
    url: '/sys/menu/getFuncsByMenuId',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 修改菜单中功能的状态
export function updateMenuFuncStatus (data) {
  return request({
    url: '/sys/function/updateMenuFuncStatus',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

// 根据菜单ID获取已激活的功能列表
export function getOpenFuncsByMenuId (params) {
  return request({
    url: '/sys/menu/getOpenFuncsByMenuId',
    method: 'GET',
    params,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}

export function updateMenuStatus (data) {
  return request({
    url: '/sys/menu/updateMenuStatus',
    method: 'POST',
    data,
    baseURL: process.env.VUE_APP_BASE_API_PRO
  })
}
