import Vue from 'vue'
import VueRouter from 'vue-router'

/* Layout,异步加载，解决Layout组件不复用的问题 */
// const Layout = () => import('@/layout')
import Layout from '@/layout'

Vue.use(VueRouter)

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/apps',
    component: () => import('@/views/apps'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    redirect: '/setting/organization'
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/setting',
    component: Layout,
    redirect: '/setting/organization',
    alwaysShow: true,
    name: 'Setting',
    meta: { title: '系统管理', icon: 'setting', uniqCode: '1', path: '/setting/organization' },
    children: [
      {
        path: 'organization',
        // component: () => import(/* webpackChunkName: "system" */ '@/views/system/organization')
        component: () => import('@/views/system/organization'),
        name: 'SettingOrganization',
        meta: { title: '机构用户管理', uniqCode: '2', path: '/setting/organization' }
      },
      {
        path: 'role',
        component: () => import('@/views/system/role'),
        name: 'SettingRole',
        meta: { title: '角色权限管理', uniqCode: '3', path: '/setting/role' }
      },
      {
        path: 'menu',
        component: () => import('@/views/system/menu'),
        name: 'SettingMenu',
        meta: { title: '系统菜单管理', uniqCode: '4', path: '/setting/menu' }
      },
      {
        path: 'dictionary',
        component: () => import('@/views/system/dictionary'),
        name: 'SettingDictionary',
        meta: { title: '数据字典管理', uniqCode: '5', path: '/setting/dictionary' }
      },
      {
        path: 'log',
        component: () => import('@/views/system/log'),
        name: 'SettingLog',
        meta: { title: '系统操作日志', uniqCode: '6', path: '/setting/log' }
      },
      {
        path: 'icon',
        component: () => import('@/views/svg-icons'),
        name: 'Icons',
        meta: { title: '系统内置图标', uniqCode: '7', path: '/setting/icon' }
      }
    ]
  },
  {
    path: '/data',
    component: Layout,
    redirect: '/data/source',
    alwaysShow: true,
    name: 'Data',
    meta: { title: '数据管理', icon: 'chart', uniqCode: '8', path: '/data/source' },
    children: [
      {
        path: 'source',
        component: () => import('@/views/data/source'),
        name: 'DataSource',
        meta: { title: '数据源管理', uniqCode: '9', path: '/data/source' }
      },
      {
        path: 'menu',
        component: () => import('@/views/data/menu'),
        name: 'DataMenu',
        meta: { title: '数据目录管理', uniqCode: '10', path: '/data/menu' }
      },
      {
        path: 'base',
        component: () => import('@/views/data/base'),
        name: 'DataBase',
        meta: { title: '基础数据管理', uniqCode: '11', path: '/data/base' }
      }
    ]
  },
  {
    path: '/task',
    component: Layout,
    redirect: '/task/task-history',
    alwaysShow: true,
    name: 'Task',
    meta: { title: '任务管理', icon: 'map', uniqCode: '12', path: '/task/task-history' },
    children: [
      {
        path: 'task-publish',
        component: () => import('@/views/task/task-publish'),
        name: 'TaskPublish',
        meta: { title: '任务发布', uniqCode: '15', path: '/task/task-publish' }
      },
      {
        path: 'task-allocate',
        component: () => import('@/views/task/task-allocate'),
        name: 'TaskAllocate',
        meta: { title: '任务分配', noCache: true, uniqCode: '16', path: '/task/task-allocate' }
      },
      {
        path: 'task-check',
        component: () => import('@/views/task/task-check'),
        name: 'TaskCheck',
        meta: { title: '任务核查', noCache: true, uniqCode: '17', path: '/task/task-check' }
      },
      {
        path: 'task-history',
        component: () => import('@/views/task/task-history'),
        name: 'TaskHistory',
        meta: { title: '任务清单', noCache: true, uniqCode: '18', path: '/task/task-history' }
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    redirect: '/order/order-hisotry',
    alwaysShow: true,
    name: 'Order',
    meta: { title: '任务管理', icon: 'map', uniqCode: '25', path: '/order/order-history' },
    children: [
      {
        path: 'order-allocate',
        component: () => import('@/views/order/order-allocate'),
        name: 'OrderAllocate',
        meta: { title: '订单分配', noCache: true, uniqCode: '26', path: '/order/order-allocate' }
      },
      {
        path: 'order-check',
        component: () => import('@/views/order/order-check'),
        name: 'OrderCheck',
        meta: { title: '订单核查', noCache: true, uniqCode: '27', path: '/order/order-check' }
      },
      {
        path: 'order-history',
        component: () => import('@/views/order/order-history'),
        name: 'OrderHistory',
        meta: { title: '订单清单', noCache: true, uniqCode: '28', path: '/order/order-history' }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true, meta: { title: '404', uniqCode: '100' } }
]

const createRouter = (paramConstantRoutes) => new VueRouter({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: paramConstantRoutes || constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter (constantRoutes) {
  const newRouter = createRouter(constantRoutes)
  router.matcher = newRouter.matcher // reset router
  // router = newRouter // reset router
}

export default router
