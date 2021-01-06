import { asyncRoutes, constantRoutes } from '@/router'

let path = ''
let hasManiPage = false

const state = {
  routes: [],
  addRoutes: [],
  indexPagePath: ''
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
    state.indexPagePath = path
  }
}

const actions = {

  // 通过从服务器返回的 menu 动态加载路由
  setRoutes ({ commit }, data) {
    return new Promise(resolve => {
      const { menu = [] } = data
      // 标记异步路由
      try {
        markrAsyncRoutes(menu, asyncRoutes)
      } catch (e) {
        console.log(e)
      }
      // 最终生成拥有改权限的路由表
      clearAsyncRoutes(asyncRoutes)
      sortRoute(asyncRoutes)

      if (!hasManiPage) {
        path = asyncRoutes[0].path + '/' + asyncRoutes[0].children[0].path
      }

      commit('SET_ROUTES', asyncRoutes)
      resolve({ asyncRoutes, constantRoutes })
    })
  }
}

// 通过对比服务器路由表来标记异步路由表
export function markrAsyncRoutes (serverRoutes, asyncRoutes) {
  const result = []
  // eslint-disable-next-line no-unused-vars

  serverRoutes.forEach(item => {
    const index = asyncRoutes.findIndex(val => {
      if (val.path === '*') { return -1 }
      if (val.meta.uniqCode === item.uniqueCode) {
        result.push(val)
      }
      return val.meta.uniqCode === item.uniqueCode
    })
    if (index > -1 && item.status) {
      // 判断是有默认在菜单，默认菜单唯一码 2
      if (asyncRoutes[index].meta.uniqCode === '2') {
        hasManiPage = true
      }
      asyncRoutes[index].NoHas = true
      asyncRoutes[index].meta.title = item.name
      asyncRoutes[index].orderNum = item.orderNum
      asyncRoutes[index].meta.funcUniqueCodes = item.funcUniqueCodes ? item.funcUniqueCodes.split(',') : []
    }
    if (item.children && item.children.length && asyncRoutes[index]) {
      markrAsyncRoutes(item.children, asyncRoutes[index].children)
    }
  })
}

// 递归异步路由表，删除没有权限的路由
export function clearAsyncRoutes (allRoutes) {
  for (let i = allRoutes.length - 1; i > -1; i--) {
    if (allRoutes[i].path === '*') {
      continue
    } else if (!allRoutes[i].NoHas) {
      allRoutes.splice(i, 1)
    } else if (allRoutes[i].children) {
      clearAsyncRoutes(allRoutes[i].children)
    }
  }
}

// 路由排序
function sortRoute (asyncRoutes) {
  asyncRoutes.sort(function (a, b) {
    if (a.orderNum < b.orderNum) {
      return -1
    } else if (a.orderNum === b.orderNum) {
      return 0
    } else {
      return 1
    }
  })

  asyncRoutes.forEach((item) => {
    if (item.children && item.children.length) {
      sortRoute(item.children)
    }
  })
}

// 路由排序

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
