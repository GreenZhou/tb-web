import variables from '@/styles/element-variables.scss'
import defaultSettings from '@/settings'

const { showSettings } = defaultSettings

const state = {
  theme: variables.theme,
  showSettings: showSettings
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (Object.prototype.hasOwnProperty.call(state, key)) {
      state[key] = value
    }
  }
}

const actions = {
  changeSetting ({ commit }, data) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
