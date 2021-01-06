<template>
  <el-container>
    <el-main class="no-pt">
      <el-input
        v-model="treeSearchVal"
        placeholder="请输入菜单名称"
        clearable
        :style="{marginBottom:'16px'}"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>

      <el-tree
        v-loading="menuTreeLoading"
        ref="treeBox"
        show-checkbox
        node-key="menuId"
        current-node-key="id"
        highlight-current
        :props="{label: 'name'}"
        :default-expand-all="true"
        :data="menuList"
        :filter-node-method="treeNodeFilter"
        :expand-on-click-node="false"
        :check-strictly="checkStrictly"
        @check="selectMenu"
        @node-click="checkTreeNodeClick"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span :title="node.label">
            {{ node.label }}
            <i v-if="data.funcIds" class="el-icon-setting ml-4" />
          </span>
        </span>
      </el-tree>
    </el-main>
    <el-aside width="350px" class="aside">
      <el-table
        v-loading="funcTableLoading"
        ref="multipleFuncTable"
        :data="funcList"
        style="width: 100%"
        highlight-current-row
        border
        @select="selectFunc"
        @select-all="selectAllFunc"
        @selection-change="handleFuncSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="功能名称" />
        <el-table-column prop="remark" label="备注" />
        <template slot="empty">
          <div class="noticeEmpty">
            <i class="el-icon-info iconLeft" />该菜单暂无授权功能
          </div>
        </template>
      </el-table>
    </el-aside>
  </el-container>
</template>
<script>
import { arrayToTree } from '@/utils'
import { menuAuthorize } from '@/api/system/role'
import {
  getMenu,
  getMenusByRole,
  updateMenuFuncStatus,
  getOpenFuncsByMenuId
} from '@/api/system/menu'

export default {
  name: 'MenuAuth',
  data () {
    return {
      funcTableLoading: false,
      menuTreeLoading: false,
      roleId: '', // 当前选中角色id
      currentSelectMenu: {}, // 当前选中菜单
      authMenuIds: [],
      funcList: [], // 功能列表
      treeSearchVal: '', // 树形：搜索内容
      menuList: [], // 列表: 服务器上全部菜单
      multipleSelection: [],
      checkStrictly: false, // false关联。设置树父子级关联
      total: 10,
      pageSize: 10,
      currentPage: 1
    }
  },
  watch: {
    treeSearchVal (val) {
      this.$refs.treeBox.filter(val)
    }
  },

  // 消除缓存,当菜单页面修改后,也更新数据
  activated: async function () {
    await this.getMenusByRole()
    this.getMenuList()
  },

  methods: {
    getMenusByRole () {
      const params = {
        roleId: this.roleId
      }

      getMenusByRole(params).then(res => {
        if (res.code !== 1) {
          this.$message({ type: 'error', message: res.msg })
          return
        }
        this.authMenuIds = []
        res.data.list.forEach(item => {
          if (item) {
            this.authMenuIds.push(item.menuId)
          }
        })
      })
    },

    // 获取菜单列表-为路由列表添加menuId
    getMenuList () {
      this.menuTreeLoading = true

      getMenu().then(res => {
        this.menuList = arrayToTree(res.data.list, 'menuId')

        // 防止回显数据时，父级影响子集选中情况
        this.checkStrictly = true
        // 设置首节点选中
        this.$nextTick(() => {
          const menuId = this.currentSelectMenu.menuId
            ? this.currentSelectMenu.menuId
            : this.menuList[0].menuId
          this.$refs.treeBox.setCurrentKey(menuId)
          if (this.roleId) {
            this.getMenuFuncList(menuId)
          }
          // 匹配选中菜单
          if (this.authMenuIds) {
            this.$refs.treeBox.setCheckedKeys(this.authMenuIds)
          }
          this.checkStrictly = false
        })

        this.menuTreeLoading = false
      })
    },

    // 选择角色,父组件调用
    async selectRole (row) {
      this.roleId = row.roleId
      await this.getMenusByRole()
      await this.getMenuList()
    },

    // 增加/删除角色对应菜单
    selectMenu (data, node) {
      const params = {
        menuIds: node.checkedKeys.concat(node.halfCheckedKeys).toString(),
        roleId: this.roleId
      }

      menuAuthorize(params).then(res => {
        if (res.code !== 1) {
          this.$message({ type: 'error', message: '授权失败' })
        }
      })
    },

    // 增加/删除功能对应菜单
    async selectFunc (selection, row) {
      const params = {
        functionIds: row.functionId,
        roleId: this.roleId,
        mfStatus: Number(!row.mfStatus)
      }

      await updateMenuFuncStatus(params).then(res => {
        if (res.code !== 1) {
          this.$messgae({ type: 'error', message: '状态变更失败' })
        }
        row.status = Number(!!row.status)
      })
    },

    selectAllFunc (selection) {
      const ids = []
      if (selection.length > 0) {
        selection.forEach(item => {
          ids.push(item.functionId)
        })
      }

      if (selection.length === 0 && this.funcList.length > 0) {
        this.funcList.forEach(item => {
          ids.push(item.functionId)
        })
      }

      const params = {
        functionIds: ids.toString(),
        roleId: this.roleId,
        mfStatus: selection.length === 0 ? 0 : 1
      }

      updateMenuFuncStatus(params).then(res => {
        if (res.code !== 1) {
          this.$messgae({ type: 'error', message: '状态变更失败' })
        }
      })
    },

    async getMenuFuncList (menuId) {
      this.funcTableLoading = true

      const params = {
        menuId: menuId,
        roleId: this.roleId
      }

      await getOpenFuncsByMenuId(params).then(res => {
        this.funcList = res.data.list
      })

      this.$nextTick(() => {
        this.funcList.forEach(row => {
          if (row.mfStatus) {
            this.$refs.multipleFuncTable.toggleRowSelection(row, true)
          }
        })
      })

      this.funcTableLoading = false
    },

    // 功能多选
    handleFuncSelectionChange (val) {
      const funcIds = []
      val.forEach(item => {
        funcIds.push(item.functionId)
      })

      this.currentSelectMenu.funcId = funcIds
    },

    checkTreeNodeClick (node) {
      this.currentSelectMenu = node
      this.getMenuFuncList(node.menuId)
    },

    // 树形列表:搜索/筛选
    treeNodeFilter (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    }
  }
}
</script>

<style lang="scss" scoped>
  .no-pt {
    padding-top: 0;
    padding-left: 0;
  }

  label {
    min-width: 70px;
    position: relative;
    top: 10px;
    font-weight: normal;
    font-size: 14px;
  }

  .custom-tree-node {
    font-size: 14px;
  }

  .ml-4 {
    margin-left: 5px;
    color: red;
  }
</style>
