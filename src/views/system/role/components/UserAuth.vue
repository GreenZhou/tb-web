<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12" class="el-row--flex">
        <label>用户姓名:</label>
        <el-input v-model="nameSearch" placeholder="请输入" clearable :style="{marginBottom:'16px'}" />
      </el-col>
      <el-col :span="6" class="el-row--flex">
        <el-button size="small" type="primary" icon="el-icon-search" @click="searchName()">查询</el-button>
        <el-button size="small" icon="el-icon-refresh" @click="searchName(true)">重置</el-button>
      </el-col>
    </el-row>

    <el-button
      size="mini"
      type="primary"
      :style="{marginBottom:'4px'}"
      @click="setUserAuth"
      v-permission="{function:['AUTH']}"
    ><svg-icon icon-class="authorization" />用户授权</el-button>
    <el-table
      v-loading="userTableLoading"
      ref="userTable"
      :data="userList"
      style="width: 100%"
      border
      highlight-current-row
    >
      <el-table-column label="用户姓名" width="220" prop="nickname" />
      <el-table-column label="登录账号" prop="username" />
      <el-table-column show-overflow-tooltip label="所属机构" prop="deptDirectory" />
    </el-table>
    <pagination
      :page-sizes="[5, 10, 15, 20]"
      :total="total"
      :limit="pageSize"
      :page="currentPage"
      :auto-scroll="true"
      @pagination="pagination"
    />

    <!--用户授权-->
    <el-dialog
      v-elDragDialog
      :visible.sync="auth.dialogOpen"
      width="950px"
      title="用户授权"
      :close-on-click-modal="false"
      @close="closeDialog"
    >
      <el-container class="min-h400">
        <el-aside width="260px" class="aside">
          <el-tree
            ref="tree"
            node-key="deptId"
            :expand-on-click-node="false"
            :default-expanded-keys="[1]"
            :default-checked-keys="[0]"
            :props="{label: 'name'}"
            :data="auth.deptList"
            highlight-current
            @node-click="authTreeNodeClick"
          />
        </el-aside>

        <el-main class="pt-0">
          <el-row :gutter="20">
            <el-col :span="12" class="el-row--flex">
              <label>用户姓名:</label>
              <el-input
                v-model="auth.nameSearch"
                placeholder="请输入用户姓名"
                clearable
                :style="{marginBottom:'16px'}"
              />
            </el-col>
            <el-col :span="6" class="el-row--flex">
              <el-button size="small" type="primary" class="searchInput" icon="el-icon-search" @click="authSearch()">查询</el-button>
              <el-button size="small" class="searchInput" icon="el-icon-refresh" @click="authSearch(true)">重置</el-button>
            </el-col>
          </el-row>
          <div class="el-dialog-div">
            <el-table
              v-loading="auth.loading"
              ref="table"
              :data="auth.userList"
              style="width: 100%"
              border
              @select="selectUser"
              @selection-change="handleAuthSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="nickname" label="用户姓名" />
              <el-table-column prop="username" label="登录账号" />
              <el-table-column
                label="状态"
              >
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.status" type="success">已激活</el-tag>
                  <el-tag v-else type="info">未激活</el-tag>
                </template>
              </el-table-column>
              <el-table-column show-overflow-tooltip prop="deptDirectory" label="所属机构" />
            </el-table>
            <pagination
              :page-sizes="[5, 10, 15, 20]"
              :total="auth.total"
              :limit="auth.pageSize"
              :page="auth.currentPage"
              :pager-count="3"
              :auto-scroll="true"
              @pagination="authPagination"
            />
          </div>
        </el-main>
      </el-container>

      <div slot="footer" class="dialog-footer">
        <el-button @click="auth.dialogOpen = auth.loading = false">取消</el-button>
        <el-button type="primary" @click="updateUsersRoles">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import _ from 'loadsh'
import { arrayToTree, uniqueArr } from '@/utils'
import { getUserByRole, authorize } from '@/api/system/role'
import { getOrgList } from '@/api/system/organization'
import Pagination from '@/components/Pagination'
import permission from '@/directive/permission' // 权限判断指令

export default {
  name: 'UserAuth',
  components: { Pagination },
  directives: { permission },
  data () {
    return {
      userTableLoading: false,
      currentSelectMenu: {}, // 当前选中菜
      roleIds: [],
      roleId: '',
      // 用户授权
      auth: {
        loading: false,
        dialogOpen: false,
        deptList: [],
        deptId: '',
        userList: [],
        multipleSelection: [],
        nameSearch: '',
        userIds: [],
        total: 0,
        pageSize: 5,
        currentPage: 1
      },
      authMenuIds: [],

      list: [], // 列表: 全部角色
      userList: [], // 角色用户列表
      temUserIdList: [], // 用于临时存储角色授权的用户数据
      temRoleDelete: [], // 用于存储删除的用户id
      temRoleAdd: [], // 用于存储添加的用户id
      funcList: [], // 功能列表
      nameSearch: '', // 用户名称搜

      total: 0,
      pageSize: 10,
      currentPage: 1
    }
  },
  methods: {
    // 父组件调用
    getData (row) {
      this.roleId = row.roleId
      this.getUserList()
    },

    // 重置
    searchName (isReset) {
      this.currentPage = 1
      this.nameSearch = isReset ? '' : this.nameSearch
      this.getUserList()
    },

    // 打开弹出用户授权，设置用户授权
    async setUserAuth () {
      if (this.roleId) {
        this.auth.loading = true
        this.auth.dialogOpen = true
        await this.getAuthOrgList()
      } else {
        this.$message({
          type: 'warning',
          message: '请选中角色'
        })
      }
    },

    authPagination (data) {
      this.auth.pageSize = data.limit
      this.auth.currentPage = data.page
      this.getSubUsers()
    },

    pagination (data) {
      this.pageSize = data.limit
      this.currentPage = data.page
      this.getUserList()
    },

    // 用户名查询
    authSearch (isReset) {
      this.auth.nameSearch = isReset ? '' : this.auth.nameSearch
      this.auth.currentPage = 1
      this.getSubUsers()
    },

    // 更新用户角色
    updateUsersRoles () {
      const params = {
        roleId: this.roleId,
        authorizeUserIds: this.temRoleAdd.toString(),
        unauthorizeUserIds: this.temRoleDelete.toString()
      }

      authorize(params).then(res => {
        if (res.code === 1) {
          this.$message({ type: 'success', message: '授权成功' })
          this.auth.dialogOpen = false
        } else {
          this.$message({ type: 'error', message: '授权失败' })
        }
      })
    },

    selectUser (selection, row) {
      const selected = selection.length && selection.indexOf(row) !== -1
      // 选中
      if (selected) {
        this.removeUserId(this.temRoleDelete, row.userId)

        // 已经保存过的，返回不再添加
        if (this.temUserIdList.includes(row.userId)) {
          return
        }

        // 添加到增加列表
        this.temRoleAdd.push(row.userId)
        // 选中的如果在删除的列表，对删除列表进行删除
        this.removeUserId(this.temRoleDelete, row.userId)
        // 去重
        this.temRoleAdd = uniqueArr(this.temRoleAdd)
      } else {
        // 已经保存过的，进行删除添加
        if (this.temUserIdList.includes(row.userId)) {
          // 添加到删除列表
          this.temRoleDelete.push(row.userId)
          // 选中的如果在添加的列表，对删除列表进行删除
          this.removeUserId(this.temRoleAdd, row.userId)
          // 去重
          this.temRoleDelete = uniqueArr(this.temRoleDelete)
        }
      }
    },

    // 关闭弹窗
    closeDialog () {
      this.auth.loading = false
      this.auth.nameSearch = ''
      this.auth.deptId = ''
      this.auth.pageSize = 5
      this.auth.currentPage = 1
      this.temRoleDelete = []
      this.temRoleAdd = []
      this.temUserIdList = []
      this.getUserList()
    },

    removeUserId (list, id) {
      if (list.includes(id)) {
        const index = list.indexOf(id)
        list.splice(index, 1)
      }
    },

    // 选择授权用户
    handleAuthSelectionChange (val, a, b, c) {
      this.auth.userIds = []
      val.forEach(item => {
        this.auth.userIds.push(item.userId)
      })
    },

    // 选择机构下的用户
    authTreeNodeClick (node, data) {
      this.auth.deptId = node.deptId
      this.getSubUsers()
    },

    getSubUsers () {
      this.auth.loading = true
      const params = {
        nickname: this.auth.nameSearch,
        currentDeptId: this.auth.deptId,
        roleId: this.roleId,
        pageSize: this.auth.pageSize,
        pageNum: this.auth.currentPage
      }

      getUserByRole(params).then(res => {
        this.auth.userList = res.data.list
        this.auth.total = res.data.total

        this.auth.userList.forEach(item => {
          if (item.open) {
            this.temUserIdList.push(item.userId)
          }
        })

        this.$nextTick(() => {
          this.auth.userList.forEach(row => {
            // 被去除的不再勾选
            if (this.temRoleDelete.includes(row.userId)) {
              return
            }
            // 添加的和已有的勾选
            if (row.open || this.temRoleAdd.includes(row.userId)) {
              this.$refs.table.toggleRowSelection(row, true)
            }
          })
        })

        this.auth.pageSize = res.data.pageSize
        this.auth.currentPage = res.data.pageNum
        this.auth.loading = false
      })
    },

    // 用户列表
    getUserList () {
      this.userTableLoading = true
      const params = {
        roleId: this.roleId,
        nickname: this.nameSearch,
        pageSize: this.pageSize,
        pageNum: this.currentPage
      }

      getUserByRole(params).then(res => {
        this.userList = res.data.list.filter(item => {
          return item
        })

        this.total = res.data.total
        this.pageSize = res.data.pageSize
        this.$refs.userTable.toggleAllSelection()
        this.userTableLoading = false
      })
    },

    // 获得权限里面部门列表
    getAuthOrgList () {
      getOrgList().then(res => {
        const list = arrayToTree(res.data.list, 'deptId')
        this.auth.deptList = _.cloneDeep(list)
        res.data.list.forEach(item => {
          if (item.parentId === 0) {
            this.auth.deptId = item.deptId
          }
        })
        this.$nextTick(() => {
          this.$refs.tree.setCurrentKey(this.auth.deptId)
        })
        this.getSubUsers()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .min-h400 {
    min-height: 400px;
  }

  label {
    min-width: 70px;
    position: relative;
    top: 10px;
    font-weight: normal;
    font-size: 14px;
  }

  .el-dialog-div {
    height: 60vh;
    overflow: auto;
  }

  .pt-0{
    padding-top: 0;
  }

  svg{
    margin-right: 5px;
  }
</style>
