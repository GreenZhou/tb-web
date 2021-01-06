import store from '@/store'

export default {
  inserted (el, binding, vnode) {
    // const { value } = binding.value.role
    const role = binding.value.role ? binding.value.role : []
    const roles = store.getters && store.getters.roles

    // 当前指令元素的授权功能
    const functions = binding.value.function ? binding.value.function : []
    // 授权功能
    const muneFuncs = store.getters && store.getters.menu_functions

    ctrlPermission(role, roles, el)

    ctrlPermission(functions, muneFuncs, el)
  }
}

function hasPermission (userPermission) {
  return userPermission && userPermission instanceof Array && userPermission.length > 0
}

function ctrlPermission (userPermission, permissionList, el) {
  if (!permissionList || !hasPermission(userPermission)) {
    return
    // throw new Error('need roles/functions! Like v-permission="{role:[\'admin\'],functions:[]}"')
  }

  const permission = userPermission

  const hasPerm = permissionList.some(perm => {
    return permission.includes(perm)
  })

  if (!hasPerm) {
    el.parentNode && el.parentNode.removeChild(el)
  }
}
