import router, { resetRouter } from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  // const hasToken = await getToken()
  const hasToken = true

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // const hasRoles = store.getters.roles && store.getters.roles.length > 0
      const hasRoles = store.getters.name
      if (hasRoles) {
        await store.dispatch('menu/setMenuFunctions', to.meta.funcUniqueCodes)
        next()
      } else {
        try {
          const menu = await store.dispatch('user/getInfo')
          await store.dispatch('dictionary/getDictData')
          const { asyncRoutes, constantRoutes } = await store.dispatch('permission/setRoutes', { menu })
          resetRouter(constantRoutes)
          // 动态添加可访问的路由
          router.addRoutes(asyncRoutes)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          if (store.getters.index_page !== '' && from.path === '/') {
            next({ path: store.getters.index_page })
          } else {
            next({ ...to, replace: true })
          }
        } catch (error) {
          await store.dispatch('user/resetToken')
          Message.error(error || '错误')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    // 白名单
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
