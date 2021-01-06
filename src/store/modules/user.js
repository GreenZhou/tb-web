import { logout, getCurrentUser } from '@/api/system/user'
import { getToken, removeToken } from '@/utils/auth'
import { getRoleList } from '@/api/system/role'
import { getMenu } from '@/api/system/menu'
import { arrayToTree } from '@/utils'

const state = {
  token: getToken(),
  name: '',
  roles: [], // 登陆人角色列表
  menu: [], // 登陆人菜单列表
  roleList: [] // 角色列表
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_MENU: (state, menu) => {
    state.menu = menu
  },
  SET_ROLELIST: (state, roleList) => {
    state.roleList = roleList
  }
}

const actions = {

  // user login
  login ({ commit }, userInfo) {},

  logout () {
    logout().then((res) => {
      this.resetToken()
    })
  },

  // 获取并设置store：登陆人信息
  getInfo ({ dispatch, commit, state }) {
    return new Promise((resolve, reject) => {
      getCurrentUser().then(res => {
        const data = res.data
        const rowList = []
        if (data.list[0].roleList) {
          data.list[0].roleList.forEach((item) => {
            rowList.push(item.roleId)
          })
        }

        commit('SET_ROLES', rowList)

        commit('SET_NAME', data.list[0].nickname)

        let initData = data.list[0].menuList

        if (initData) {
          const index = initData.findIndex(val => {
            if (val.uniqueCode === '2') {
              return true
            }
          })
          if (index === -1) {
            initData = []
          }
        } else {
          initData = []
        }

        const treeData = arrayToTree(initData, 'menuId')

        commit('SET_MENU', treeData)

        resolve(treeData)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取并设置store：登陆人菜单列表
  getMenu ({ dispatch, commit, state }) {
    return new Promise((resolve, reject) => {
      getMenu().then(res => {
        const treeData = arrayToTree(res.data.list, 'menuId')

        commit('SET_MENU', treeData)

        resolve(treeData)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取并设置store：角色列表
  getRoleList ({ commit }, roleList) {
    return new Promise((resolve, reject) => {
      getRoleList().then(res => {
        const data = res.data.list

        data.forEach(ele => {
          ele.routes = []
          ele.id = ele.roleId
        })

        commit('SET_ROLELIST', data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken ({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
