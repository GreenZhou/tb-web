<template>
  <el-select
    :value="valueTitle"
    :clearable="clearable"
    :placeholder="selectPlaceholder"
    @clear="clearHandle"
  >
    <el-input v-model="filterText" class="selectInput" :placeholder="placeholder" />

    <el-option :value="valueTitle" :label="valueTitle" class="options">
      <el-tree
        id="tree-option"
        ref="selectTree"
        :accordion="accordion"
        :data="options"
        :props="props"
        :node-key="props.value"
        :default-expanded-keys="defaultExpandedKey"
        :filter-node-method="filterNode"
        @node-click="handleNodeClick"
      />
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: 'ElTreeSelect',
  props: {
    /* 配置项 */
    props: {
      type: Object,
      default: () => {
        return {
          value: 'id', // ID字段名
          label: 'name', // 显示名称
          children: 'children' // 子级字段名
        }
      }
    },
    /* 选项列表数据(树形结构的对象数组) */
    options: {
      type: Array,
      default: () => {
        return []
      }
    },
    /* 初始值 */
    value: {
      type: null,
      default: () => {
        return null
      }
    },
    /* 可清空选项 */
    clearable: {
      type: Boolean,
      default: () => {
        return true
      }
    },
    /* 自动收起 */
    accordion: {
      type: Boolean,
      default: () => {
        return true
      }
    },
    placeholder: {
      type: String,
      default: () => {
        return '检索关键字'
      }
    },
    selectPlaceholder: {
      type: String,
      default: () => {
        return '请选择'
      }
    }
  },
  data () {
    return {
      filterText: '',
      valueId: this.value, // 初始值
      valueTitle: '',
      defaultExpandedKey: []
    }
  },
  watch: {
    value () {
      if (this.value === 0) {
        this.valueId = 0
      } else {
        this.valueId = this.value || null
      }
      this.initHandle()
    },
    filterText (val) {
      this.$refs.selectTree.filter(val)
    }
  },
  mounted () {
    this.initHandle()
  },
  methods: {
    // 初始化值
    initHandle () {
      if (this.valueId || this.valueId === 0) {
        this.valueTitle = this.$refs.selectTree.getNode(this.valueId).data[
          this.props.label
        ] // 初始化显示
        this.$refs.selectTree.setCurrentKey(this.valueId) // 设置默认选中
        this.defaultExpandedKey = [this.valueId] // 设置默认展开
      } else {
        this.clearHandle()
      }
      this.initScroll()
    },
    // 初始化滚动条
    initScroll () {
      this.$nextTick(() => {
        const scrollWrap = document.querySelectorAll(
          '.el-scrollbar .el-select-dropdown__wrap'
        )[0]
        const scrollBar = document.querySelectorAll(
          '.el-scrollbar .el-scrollbar__bar'
        )
        scrollWrap.style.cssText =
          'margin: 0px; max-height: none; overflow: hidden;'
        scrollBar.forEach(ele => (ele.style.width = 0))
      })
    },
    // 切换选项
    handleNodeClick (node) {
      this.valueTitle = node[this.props.label]
      this.valueId = node[this.props.value]
      this.$emit('treeSelectChange', node)
      this.defaultExpandedKey = []
    },
    // 清除选中
    clearHandle () {
      this.valueTitle = ''
      this.valueId = null
      this.defaultExpandedKey = []
      this.clearSelected()
      this.$emit('treeSelectChange', '')
    },
    /* 清空选中样式 */
    clearSelected () {
      const allNode = document.querySelectorAll('#tree-option .el-tree-node')
      allNode.forEach(element => element.classList.remove('is-current'))
    },
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    }
  }
}
</script>

<style scoped>
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  max-height: 274px;
  padding: 0;
  overflow: hidden;
  overflow-y: auto;
}
.el-select-dropdown__item.selected {
  font-weight: normal;
}
ul li ::v-deep .el-tree .el-tree-node__content {
  height: auto;
  padding: 0 20px;
}
.el-tree-node__label {
  font-weight: normal;
}
.el-tree ::v-deep .is-current .el-tree-node__label {
  color: #409eff;
  font-weight: 700;
}
.el-tree ::v-deep .is-current .el-tree-node__children .el-tree-node__label {
  color: #606266;
  font-weight: normal;
}
.selectInput {
  padding: 0 5px;
  box-sizing: border-box;
}
</style>
