const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  name: state => state.user.name,
  roles: state => state.user.roles,
  roleList: state => state.user.roleList,
  asyncRoutes: state => state.user.asyncRoutes,
  permission_routes: state => state.permission.routes,
  addRoutes: state => state.permission.addRoutes,
  dataDict: state => state.dictionary.data,
  menu_functions: state => state.menu.functions,
  index_page: state => state.permission.indexPagePath
}
export default getters
