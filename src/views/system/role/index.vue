<template>
  <div class="app-container">
    <el-container :style="{padding:'20px'}">
      <!-- aside：角色列表 -->
      <el-aside width="450px" class="aside">
        <el-input
          v-model="roleSearch"
          placeholder="请输入角色名"
          clearable
          class="w100"
          :style="{marginBottom:'16px'}"
        >
          <i slot="prefix" class="el-input__icon el-icon-search" />
        </el-input>
        <el-row :gutter="14" class="btnList" :style="{marginBottom:'4px'}">
          <el-col :span="24">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-plus"
              @click="addRole()"
              v-permission="{function:['ADD']}"
            >新增</el-button>
            <el-button
              size="mini"
              type="success"
              icon="el-icon-edit"
              @click="editRole()"
              v-permission="{function:['EDIT']}"
            >修改</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRole()"
              v-permission="{function:['DELETE']}"
            >删除</el-button>
          </el-col>
        </el-row>
        <el-table
          v-loading="roleTableLoading"
          ref="roleTable"
          :data="roleList"
          style="width: 100%"
          row-class-name="pointer"
          highlight-current-row
          border
          @selection-change="handleRoleSelectionChange"
          @row-click="selectRole"
        >
          <el-table-column type="selection" :selectable="isDisabled" width="55" />
          <el-table-column prop="roleName" label="角色名称" />
          <el-table-column prop="remark" label="说明" />
        </el-table>
      </el-aside>

      <el-main :style="{padding:'0 20px'}">
        <el-tabs
          v-model="activeName"
          @tab-click="handleTabClick"
          @selection-change="handleSelectionChange"
        >
          <el-tab-pane label="用户授权" name="first">
            <userAuth ref="userAuth" />
          </el-tab-pane>
          <el-tab-pane label="菜单功能授权" name="second">
            <menuAuth ref="menuAuth" />
          </el-tab-pane>
          <el-tab-pane label="数据授权" name="third">
            <dataAuth ref="dataAuth" />
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>

    <!-- 弹出层：编辑角色/新增角色 -->
    <elementFormDialog :form="form" @handleSaveSuccess="handleSaveSuccess" />
  </div>
</template>

<script>
import _ from 'loadsh'
import {
  addRole,
  deleteRole,
  getRoleList,
  updateRole
} from '@/api/system/role'
import { getUserList } from '@/api/system/user'
import UserAuth from './components/UserAuth'
import MenuAuth from './components/MenuAuth'
import dataAuth from './components/DataAuth'
import ElementFormDialog from '@/components/Form/ElementFormDialog'
import permission from '@/directive/permission' // 权限判断指令

export default {
  name: 'SettingRole',
  components: { ElementFormDialog, UserAuth, MenuAuth, dataAuth },
  directives: { permission },
  data () {
    return {
      roleTableLoading: false,
      currentRowData: {}, // 当前选中的角色数据
      roleSearch: '', // 角色查询
      roleList: [], // 角色列表
      activeName: 'first', // tab组件初始值
      roleIds: [], // 角色id
      // form: 参数
      form: {
        data: {},
        width: '500px',
        dialogOpen: false,
        FunctionSave: addRole,
        FunctionUpdate: updateRole,
        FunctionBeforeUpdate: data => {
          delete data.parentId
          return data
        },
        defaultData: {},
        items: [
          { prop: 'roleName', label: '角色名' },
          { prop: 'remark', label: '说明', type: 'textarea', rows: 2 }
        ],
        rules: {
          roleName: [
            {
              required: true,
              message: '角色名 不能为空',
              trigger: ['blur', 'change']
            },
            { max: 10, message: '长度在 1 到 10 个字之间', trigger: 'blur' }
          ]
        }
      },
      userList: [], // 角色用户列表
      nameSearch: '', // 用户名称搜索
      multipleSelection: [],
      multipleRoleSelection: [],

      total: 10,
      pageSize: 10,
      currentPage: 1
    }
  },
  computed: {},
  watch: {
    roleSearch (val) {
      this.getRoleList()
    }
  },

  created () {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表
    getRoleList () {
      this.roleTableLoading = true
      const params = {
        roleName: this.roleSearch
      }
      getRoleList(params).then(res => {
        // 对返回数据进行排序
        this.roleList = res.data.list

        this.$nextTick(() => {
          this.$refs.roleTable.setCurrentRow(this.roleList[0]) // 选中第一条数据
          this.selectRole(this.roleList[0])
          this.currentRowData = this.roleList[0]
        })

        this.roleTableLoading = false
      })
    },

    // 选中角色数据
    handleRoleSelectionChange (val) {
      this.multipleRoleSelection = val
      if (val.length === 0) {
        this.userList = []
        return
      }
      this.roleIds = []
      val.forEach(item => {
        this.roleIds.push(item.roleId)
      })
    },

    // 选择角色
    selectRole (row) {
      this.currentRowData = row
      if (this.activeName === 'second') {
        this.$refs.menuAuth.selectRole(row)
      } else if (this.activeName === 'first') {
        this.$refs.userAuth.getData(this.currentRowData)
      }
    },

    isDisabled (row, index) {
      return !(row.roleId === 1 || row.roleId === 22 || row.roleId === 23)
    },

    // 添加角色
    addRole () {
      this.handleRoleAddEdit()
    },

    // 编辑角色
    editRole () {
      if (this.multipleRoleSelection.length !== 1) {
        this.$message({ type: 'warning', message: '请选择一条数据!' })
      } else {
        this.handleRoleAddEdit(this.multipleRoleSelection[0])
      }
    },

    // 删除角色
    deleteRole (row) {
      if (this.multipleRoleSelection.length === 0) {
        this.$message({ type: 'warning', message: '请选中至少一条数据!' })
        return
      }

      this.$confirm(
        '选中的' +
          this.multipleRoleSelection.length +
          '条数据将永久删除，且无法撤销！',
        '确定要删除吗？',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(
        async () => {
          const res = await deleteRole({ roleIds: this.roleIds.toString() })
          if (res.code !== 1) {
            this.$message({ type: 'error', message: res.msg })
            return
          }
          this.getRoleList()
          this.$message({ type: 'success', message: '删除成功!' })
        },
        () => {
          return false
        }
      )
    },

    // 新增\编辑: 编辑数据
    handleRoleAddEdit (data) {
      // 如果是修改数据需先获取该用户的角色列表
      this.form.data = data
        ? _.cloneDeep(data)
        : _.cloneDeep(this.form.defaultData)
      this.form.type = data ? 'edit' : 'add'
      this.form.dialogOpen = true
    },

    getUserList (deptId, nameSearch) {
      const params = {
        roleIds: this.roleIds ? this.roleIds.toString() : '',
        name: nameSearch || this.nameSearch,
        deptId: deptId || ''
      }

      getUserList(params).then(res => {
        if (deptId || nameSearch) {
          this.auth.userList = res.data.list
        } else {
          this.userList = res.data.list
        }
      })
    },

    // table多选数据
    handleSelectionChange (val) {
      this.multipleSelection = val
    },

    // 新增\编辑成功时
    handleSaveSuccess (res) {
      if (res.code !== 1) {
        this.$message({ type: 'error', message: res.msg })
        return
      }

      this.getRoleList()
      this.$message({ type: 'success', message: '保存成功' })
    },

    // tab切换
    handleTabClick (tab, event) {
      if (this.activeName === 'first') {
        this.$refs.userAuth.getData(this.currentRowData)
      } else if (this.activeName === 'second') {
        this.$refs.menuAuth.selectRole(this.currentRowData)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 0;
}

.aside {
  padding-right: 20px;
  border-right: 1px solid #ecedee;
}
</style>
