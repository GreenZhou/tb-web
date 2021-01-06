import { Message } from 'element-ui'

// 多选框验证--是否选中数据
export function isSelectValidate (selection) {
  // 未选中数据
  if (selection.length === 0) {
    Message({
      showClose: true,
      message: '未选中任何数据，请先选择一行数据',
      type: 'warning'
    })
    return false
  }
  return true
}
