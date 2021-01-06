import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import Element from 'element-ui'
import './styles/element-variables.scss' // css：element
import '@/styles/index.scss' // css：global
import 'normalize.css/normalize.css' // css：reset

import './permission' // 路由权限判断
import permission from './utils/permission'// 全局函数：按钮权限判断;使用：v-if="checkPermission('map')"
import elDragDialog from './directive/elDragDialog'// 全局指令：element弹出框拖曳效果;使用：v-elDragDialog

import * as filters from './filters'

import './icons' // global filters
Object.keys(filters).forEach(key => { // register global utility filters.
  Vue.filter(key, filters[key])
}) // 使用图标svg-icon

// 阻止启动生产消息
// Vue.config.productionTip = false

Vue.use(permission)
Vue.use(elDragDialog)
Vue.use(Element, { size: 'small' })

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
