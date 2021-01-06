import elDragDialog from './drag'

const install = function (Vue) {
  Vue.directive('elDragDialog', elDragDialog)
}

if (window.Vue) {
  window.elDragDialog = elDragDialog
  Vue.use(install); // eslint-disable-line
}

elDragDialog.install = install
export default elDragDialog
