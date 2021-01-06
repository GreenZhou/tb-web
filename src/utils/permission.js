import store from '@/store'
/**
 * @param 'string' value
 * @returns {Boolean}
 */
export default {
  install (Vue) {
    // 检测路径访问权限
    Vue.prototype.checkPermission = function (value) {
      let NoHas = false
      const routes = store.getters.addRoutes
      if (value && routes) {
        checkPath(routes)
        // 递归判断是否拥有该权限
        // eslint-disable-next-line no-inner-declarations
        function checkPath (routes) {
          if (NoHas) return
          for (var i = 0; i < routes.length; i++) {
            if (routes[i].path === value) {
              NoHas = true
              return
            } else if (routes[i].children) {
              checkPath(routes[i].children)
            }
          }
        }
      }
      return NoHas
    }
  }
}
