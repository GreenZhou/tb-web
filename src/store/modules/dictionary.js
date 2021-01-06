import { getDataDic } from '@/api/system/dictionary'

const state = {
  data: [] // 数据字典
}

const mutations = {
  SET_DICT_DATA: (state, data) => {
    state.data = data
  }
}

const actions = {
  async getDictData ({ dispatch, commit, state }) {
    await getDataDic({ parentId: 0 }).then(res => {
      const data = res.data.list
      commit('SET_DICT_DATA', data)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
