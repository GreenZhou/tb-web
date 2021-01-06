
const state = {
  functions: [] // 当前页面授权功能
}

const mutations = {
  SET_MENU_FUNCTIONS: (state, data) => {
    state.functions = data
  }
}

const actions = {
  async setMenuFunctions ({ dispatch, commit, state }, funcIds) {
    commit('SET_MENU_FUNCTIONS', funcIds)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
