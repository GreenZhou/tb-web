<template>
  <el-select
    style="width: 100%"
    :value="valueTitles"
    :clearable="clearable"
    :placeholder="selectPlaceholder"
    multiple
    @remove-tag="removeTag"
    @clear="clearHandle"
  >
    <!--    <el-input v-model="filterText" class="selectInput" :placeholder="placeholder" />-->

    <el-option :value="valueTitle" :label="valueTitle" class="options">
      <div id="tree">
        <el-tree
          id="tree-option"
          ref="selectTree"
          show-checkbox
          :check-strictly="true"
          :accordion="accordion"
          :data="options"
          :props="props"
          :node-key="props.value"
          :default-expanded-keys="defaultExpandedKey"
          :default-checked-keys="defaultCheckedKey"
          :filter-node-method="filterNode"
          @check-change="handleNodeClick"
        />
      </div>
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
      valueIds: [], // 初始值
      // initData: [{ deptId: 25, name: '越秀' }],
      initData: [],

      valueTitle: '',
      valueTitles: [],
      defaultExpandedKey: [1],
      defaultCheckedKey: []
    }
  },
  watch: {
    value: {
      handler: function (newVal) {
        this.valueTitles = []
        this.valueIds = []
        this.initData = newVal
        this.initHandle(newVal)
        // if (this.value === 0) {
        //   this.valueId = 0
        // } else {
        //   this.valueId = this.value || null
        // }
      },
      immediate: true
    },
    filterText (val) {
      this.$refs.selectTree.filter(val)
    }
  },
  mounted () {
    // this.initHandle()
  },
  methods: {

    removeTag (name) {
      const index = this.valueTitles.indexOf(name)
      let key
      if (index > -1) {
        key = this.valueIds[index]
        this.valueTitles.splice(index, 1)
        this.valueIds.splice(index, 1)
      }

      this.$refs.selectTree.setChecked(key, false)

      // this.defaultCheckedKey = this.valueIds
      this.$emit('treeSelectChange', this.valueIds)
    },

    // 初始化值
    initHandle () {
      // this.valueTitles = []
      // this.valueIds = []
      // if (this.valueId || this.valueId === 0) {
      if (this.initData && this.initData.length > 0) {
        const len = this.initData.length
        this.$nextTick(() => {
          this.$refs.selectTree.setCheckedKeys([])
          for (let i = 0; i < len; i++) {
            this.valueTitles.push(this.initData[i][this.props.label])
            this.valueIds.push(this.initData[i][this.props.value])
            this.$refs.selectTree.setChecked(this.initData[i][this.props.value], true)
          }
        })
        // this.valueTitle = this.$refs.selectTree.getNode(this.valueId).data[
        //   this.props.label
        // ] // 初始化显示
        // this.$refs.selectTree.setCurrentKey(this.valueId) // 设置默认选中
        // this.defaultExpandedKey = [this.valueId] // 设置默认展开
      } else {
        this.$nextTick(() => {
          this.$refs.selectTree.setCheckedKeys([])
        })

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
    handleNodeClick (node, isSelected, node3) {
      // if (node.children.length > 0) {
      //   return
      // }

      if (isSelected && this.valueTitles.includes(node[this.props.label])) {
        this.$emit('treeSelectChange', this.valueIds)
        return
      }

      if (isSelected) {
        this.valueTitles.push(node[this.props.label])
        this.valueIds.push(node[this.props.value])
      } else {
        const nameIndex = this.valueTitles.indexOf(node[this.props.label])
        const idIndex = this.valueIds.indexOf(node[this.props.value])
        if (nameIndex > -1 && idIndex > -1) {
          this.valueTitles.splice(nameIndex, 1)
          this.valueIds.splice(idIndex, 1)
        }
      }
      // console.log(this.valueTitles)
      // console.log(this.valueIds)
      // this.valueTitles.push(node[this.props.label])
      // this.valueIds.push(node[this.props.value])
      // this.valueTitle = node[this.props.label]
      // this.valueId = node[this.props.value]
      this.$emit('treeSelectChange', this.valueIds)
      // this.defaultExpandedKey = []
    },
    // 清除选中
    clearHandle () {
      this.valueTitles = []
      this.valueTitle = ''
      this.valueId = []
      // this.defaultExpandedKey = []
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

#tree .el-tree-node {
  background: blue !important;
}
.is-leaf + .el-checkbox .el-checkbox__inner{
  display: none;
}
.el-checkbox .el-checkbox__inner{
  display: inline-block;
}

</style>
