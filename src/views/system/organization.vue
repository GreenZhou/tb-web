<template>
  <div class="app-container">
    <el-container :style="{padding:'20px'}">
      <!-- aside：机构组织 -->
      <el-aside width="300px" class="aside">
        <el-input
          v-model="treeSearchVal"
          placeholder="请输入机构名称"
          clearable
          :style="{marginBottom:'16px'}"
        >
          <i slot="prefix" class="el-input__icon el-icon-search" />
        </el-input>
        <div class="org-tree-out" @mouseleave="mouseleaveOrg">
          <ul
            @mouseleave="mouseleave"
            ref="dropdown"
            class="el-dropdown-menu el-popper el-dropdown-menu--medium"
            style="display:none; position: absolute; top: 10px; left: 225px; transform-origin: center top; z-index: 2001;"
            x-placement="bottom-end"
          >
            <li @click.stop="ctrlOrg(1)" class="el-dropdown-menu__item">新增</li>
            <li @click.stop="ctrlOrg(0)" class="el-dropdown-menu__item">修改</li>
            <li @click.stop="ctrlOrg(-1)" class="el-dropdown-menu__item">删除</li>
            <div class="popper__arrow" style="left: 41px;" />
          </ul>
          <el-tree
            ref="treeBox"
            node-key="deptId"
            :default-expanded-keys="[1]"
            :default-checked-keys="[0]"
            :props="{label: 'name'}"
            :data="list"
            :filter-node-method="treeNodeFilter"
            :expand-on-click-node="false"
            highlight-current
            @node-click="treeNodeClick"
            @node-drop="handleDrop"
            draggable
          >
            <template v-slot="{ node, data }">
              <span
                class="custom-tree-node"
                @mouseenter="mouseenter"
                @mouseover="mouseover(data,node)"
              >
                <span :title="node.label">{{ node.label }}({{ data.count }})</span>
                <span v-if="currentTreeNodeId === data.deptId">
                  <span class="el-dropdown-link">
                    <i
                      class="el-icon-more el-icon--right"
                      @mouseover="dropdownMouseover(data, $event)"
                    />
                  </span>
                </span>
              </span>
            </template>

          </el-tree>
        </div>
      </el-aside>
      <el-main :style="{padding:'0 20px'}" class="dragTableMain">
        <el-row :gutter="20">
          <el-col :span="8" class="el-row--flex">
            <label>用户姓名:</label>
            <el-input v-model="searchName" placeholder="请输入" clearable />
          </el-col>
          <el-col :span="8" class="el-row--flex">
            <label>登录账号:</label>
            <el-input v-model="searchUsername" placeholder="请输入" clearable />
          </el-col>
          <el-col :span="8" class="el-row--flex">
            <el-button icon="el-icon-search" size="small" type="primary" @click="searchTable()">查询</el-button>
            <el-button icon="el-icon-refresh" size="small" @click="searchTable(true)">重置</el-button>
          </el-col>
        </el-row>
        <el-row :gutter="14" class="btnList">
          <el-col :span="24">
            <el-button
              size="small"
              type="primary"
              @click="addUser(canAddUser)"
              icon="el-icon-plus"
              v-permission="{function:['ADD']}"
            >新增</el-button>
            <el-button
              size="small"
              type="success"
              @click="ediUser()"
              icon="el-icon-edit"
              v-permission="{function:['EDIT']}"
            >修改</el-button>
            <el-button
              size="small"
              type="danger"
              icon="el-icon-delete"
              @click="deleteUser()"
              v-permission="{function:['REMOVE']}"
            >移除</el-button>
            <el-button
              size="small"
              type="primary"
              icon="el-icon-download"
              @click="exportEXCEL()"
              v-permission="{function:['EXPORT']}"
            >导出excel</el-button>
            <el-button
              size="small"
              type="primary"
              @click="moveToDept()"
              v-permission="{function:['CHANGE']}"
            ><svg-icon icon-class="change" />变更机构</el-button>
            <el-button
              size="small"
              type="primary"
              @click="resetPSD()"
              v-permission="{function:['RESET']}"
            ><svg-icon icon-class="reset" />重置密码</el-button>
          </el-col>
        </el-row>
        <!-- table：人员列表 -->
        <div class="dragTableMain">
          <el-table
            border
            v-loading="userTableLoading"
            ref="dragTable"
            :data="userList"
            style="width: 100%"
            @row-click="handleClickTableRow"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="nickname" label="用户姓名" />
            <el-table-column prop="username" label="登录账号" />
            <el-table-column prop="job" label="职务" />
            <el-table-column prop="phone" label="办公电话" />
            <el-table-column prop="exnumber" label="分机号码" />
            <el-table-column prop="mobile" width="120" label="手机号码" />
            <el-table-column show-overflow-tooltip prop="deptDirectory" label="所属机构" class="nowrap" />
            <el-table-column prop="status" label="状态">
              <template v-slot="scope">
                <el-tooltip :content="!scope.row.status?'未激活':'激活'" placement="right">
                  <el-switch
                    v-model="scope.row.status"
                    :active-value="1"
                    :inactive-value="0"
                    @change="changeUserStatus(scope.row)"
                  />
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="80" />
          </el-table>
          <pagination
            :page-sizes="[5, 10, 15, 20]"
            :total="total"
            :limit="pageSize"
            :page="currentPage"
            :auto-scroll="true"
            @pagination="pagination"
          />
        </div>
      </el-main>
    </el-container>

    <!-- 弹出框:新增\编辑组织人员 -->
    <ElementFormDialog :form="form" @handleSaveSuccess="handleForm">
      <template slot="status">
        <el-tooltip :content="form.data.status?'正常':'禁用'" placement="right">
          <el-switch
            v-model="form.data.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-tooltip>
      </template>

      <template slot="psd">
        <el-input
          v-if="!(form.type==='edit')"
          v-model="form.data.password"
          placeholder="请输入 密码"
          :type="form.eye.password?'text':'password'"
        >
          <svg-icon
            slot="suffix"
            class="pointer"
            :icon-class="form.eye.password?'eye-open':'eye'"
            @click="$set($data.form.eye, 'password', !form.eye.password)"
          />
        </el-input>
      </template>

      <template slot="dept">
        <el-tree-select
          :clearable="false"
          :options="list"
          :props="{value:'deptId',label:'name',children: 'children'}"
          :value="treeSelectData"
          @treeSelectChange="getDeptId"
        />
      </template>

      <template slot="date">
        <el-date-picker
          v-model="form.data.date"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="至"
          start-placeholder="当前"
          end-placeholder="永久"
          :picker-options="pickerOptions"
        />
      </template>

      <template slot="role">
        <el-select v-model="form.data.roleIdList" multiple :clearable="false" filterable class="w100">
          <el-option
            v-for="ele in roleList"
            :key="ele.roleId"
            :label="ele.roleName"
            :value="ele.roleId"
          />
        </el-select>
      </template>
    </ElementFormDialog>

    <!-- 弹出框：部门机构新增编辑   -->
    <ElementFormDialog :form="treeNodeEditForm" @handleSaveSuccess="treeNodeSaveSuccess" />

    <ElementFormDialog :form="changeDeptForm" @handleSaveSuccess="deptSaveSuccess">
      <template slot="selectDept">
        <el-tree-select
          :options="list"
          :props="{value:'deptId',label:'name',children: 'children'}"
          :value="deptChangeData"
          @treeSelectChange="getDeptIdToChange"
        />
      </template>
    </ElementFormDialog>

    <ElementFormDialog :form="resetPSDForm" @handleSaveSuccess="psdSaveSuccess" />

  </div>
</template>

<script>
import { arrayToTree, getDateYMD, treeToArray } from '@/utils'
import _ from 'loadsh'
import md5 from 'js-md5'
import {
  addOrg,
  deleteOrg,
  getOrgList,
  updateOrg,
  deleteDeptUser,
  deptSort
} from '@/api/system/organization'
import {
  addUser,
  moveToDept,
  updateUser,
  getUserInfo,
  getSubDeptUsers,
  getInfoByName,
  resetPsw,
  userSort
} from '@/api/system/user'
import { getRoleList } from '@/api/system/role'
import ElementFormDialog from '@/components/Form/ElementFormDialog'
import Pagination from '@/components/Pagination'
import { FormMixin } from '@/mixins/formMixin'
import permission from '@/directive/permission' // 权限判断指令
import Sortable from 'sortablejs'
import ElTreeSelect from '@/components/Select/TreeSelects'

export default {
  name: 'SettingOrganization',
  mixins: [FormMixin],
  components: { ElementFormDialog, Pagination, ElTreeSelect },
  directives: { permission },
  data () {
    return {
      userTableLoading: false,
      userIds: [],
      canAddUser: false, // 判断是否是机构末尾节点
      selectTreeData: {}, // 当前选中节点
      searchUsername: '', // 用户登录账号查询
      searchName: '', // 用户姓名查询
      currentTreeData: {}, // 当前鼠标移动的机构节点
      currentTreeNodeId: '', // 当前鼠标移动的机构节点ID
      dpdTreeNodeId: '', // 下拉显示控制
      currentDeptId: '', // 当前选中的机构
      currentDeptName: '',
      roleList: [],
      deptList: [],
      userList: [], // 用户列表
      list: [], // 列表
      treeSearchVal: '', // 树形：搜索内容
      multipleSelection: [], // table多选数据
      exportData: [],
      treeSelectData: [],
      deptChangeData: [],
      // 分页
      pageSize: 10,
      currentPage: 1,
      total: 0,

      orgNode: {}, // 鼠标移动保存当前节点数据
      orgData: {}, // 鼠标移动保存当前节点数据

      editUserName: '', // 用于rule校验用户登录名

      addDeptIds: [], // 增加修改用户时的部门ids

      // form 部门机构编辑树节点
      treeNodeEditForm: {
        data: {},
        dialogOpen: false,
        size: 'middle',
        labelPosition: 'top',
        FunctionSave: addOrg,
        FunctionUpdate: updateOrg,
        FunctionBeforeUpdate: data => {
          delete data.parentId
          data.deptId = this.currentTreeData.deptId
          return data
        },
        defaultData: {},
        items: [{ prop: 'name', label: '机构名称' }],
        rules: {
          name: [
            { required: true, message: '机构名称不能为空', trigger: 'change' },
            { max: 20, message: '长度在 1 到 20 个字之间', trigger: 'blur' }
          ]
        }
      },
      // form增加人员: 参数
      form: {
        eye: {}, // 隐藏密码
        data: { },
        dialogOpen: false,
        FunctionSave: addUser,
        FunctionUpdate: updateUser,
        FunctionBeforeUpdate: data => {
          if (data.date && data.date.length === 2) {
            if (data.date[0] instanceof Date) {
              data.startTime = getDateYMD(data.date[0], '-')
              data.endTime = getDateYMD(data.date[1], '-')
            } else {
              data.startTime = data.date[0]
              data.endTime = data.date[1]
            }
            delete data.date
          }
          data.deptIdList = data.dept.toString()
          delete data.dept
          delete data.salt
          delete data.email
          delete data.password
          delete data.locked
          delete data.lockedNum
          delete data.errorTime
          data.roleIdList = data.roleIdList ? data.roleIdList.toString() : ''
          return data
        },
        FunctionBeforeSave: data => {
          if (data.date && data.date.length === 2) {
            data.startTime = data.date[0]
            data.endTime = data.date[1]
            delete data.date
          }
          data.password = md5(data.password)
          data.deptIdList = data.dept.toString()
          delete data.dept
          data.roleIdList = data.roleIdList ? data.roleIdList.toString() : ''
          return data
        },
        defaultData: { roleIdList: [1], status: 1, dept: [] },
        items: [
          { prop: 'nickname', label: '用户名称' },
          { prop: 'username', label: '登录账号' },
          { prop: 'password', label: '密码', type: 'password', slot: 'psd', editHide: true },
          { prop: 'job', label: '职务' },
          { prop: 'phone', label: '办公电话' },
          { prop: 'exnumber', label: '分机号码' },
          { prop: 'mobile', label: '手机号码' },
          { prop: 'dept', label: '所属机构', slot: 'dept' },
          { prop: 'roleIdList', label: '用户角色', slot: 'role' },
          { prop: 'date', label: '账号有效期', slot: 'date' },
          { prop: 'status', label: '状态', slot: 'status' },
          { prop: 'remark', label: '备注', type: 'textarea' }
        ],
        rules: {
          nickname: [
            { required: true, message: '姓名不能为空', trigger: 'change' },
            { max: 10, message: '长度在 1 到 10 个字之间', trigger: 'blur' }
          ],
          roleIdList: [
            { required: true, message: '角色不能为空', trigger: 'change' }
          ],
          dept: [
            {
              required: true,
              validator: async (rule, value, callback) => {
                if (!this.form.data.dept || this.form.data.dept.length === 0) {
                  callback(new Error('部门不能为空'))
                } else {
                  callback()
                }
              }
            }
          ],
          username: [
            {
              required: true,
              validator: async (rule, value, callback) => {
                if (!value || value === '') {
                  callback(new Error('登录账号不能为空'))
                } else if (this.editUserName && this.editUserName === value) {
                  callback()
                } else {
                  await getInfoByName({
                    username: value
                  }).then(res => {
                    if (res.code !== 1) {
                      callback()
                      return
                    }
                    if (res.data.list.length > 0) {
                      callback(new Error('登录账号已存在'))
                    } else {
                      callback()
                    }
                  })
                }
              },
              trigger: ['blur', 'change']
            }
          ],
          password: [
            {
              required: true,
              validator: (rule, value, callback) => {
                const reg = /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)])+$)^.{6,16}$/
                if (!value || value === '') {
                  callback(new Error('请输入密码'))
                } else if (value.length < 6 || value.length > 16) {
                  callback(new Error('长度在 6 到 16 个字之间'))
                } else if (!reg.test(value)) {
                  callback(new Error('密码为字母和数字组成'))
                } else {
                  callback()
                }
              },
              trigger: ['blur', 'change']
            }
          ],
          phone: [
            {
              validator: (rule, value, callback) => {
                const reg = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/
                if (!value || value === '') {
                  callback()
                } else if (!reg.test(value)) {
                  callback(new Error('电话格式错误'))
                } else {
                  callback()
                }
              },
              trigger: ['blur', 'change']
            }
          ],
          mobile: [
            {
              required: true,
              validator: (rule, value, callback) => {
                const reg = /^(13[0-9]|14[5|7]|15[0-9]|18[0-9])\d{8}$/
                if (value === '') {
                  callback(new Error('手机号码不能为空'))
                } else if (!reg.test(value)) {
                  callback(new Error('手机号码格式错误'))
                } else {
                  callback()
                }
              },
              trigger: ['blur', 'change']
            }
          ]
        }
      },

      changeDeptForm: {
        data: {},
        type: 'edit',
        dialogOpen: false,
        FunctionUpdate: moveToDept,
        FunctionBeforeUpdate: data => {
          data.userIds = this.userIds.toString()
          data.deptIds = data.deptId.toString()
          delete data.deptId
          return data
        },
        defaultData: {},
        items: [
          { prop: 'deptId', label: '机构', slot: 'selectDept' }
        ],
        rules: {
          deptId: [
            {
              required: true,
              validator: async (rule, value, callback) => {
                if (!this.changeDeptForm.data.deptId || this.changeDeptForm.data.deptId.length === 0) {
                  callback(new Error('部门不能为空'))
                } else {
                  callback()
                }
              }
            }
          ]
        }
      },
      resetPSDForm: {
        eye: {},
        data: { newPsw: '123abc' },
        type: 'edit',
        dialogOpen: false,
        FunctionUpdate: resetPsw,
        FunctionBeforeUpdate: data => {
          data.userIds = this.userIds.toString()
          data.newPsw = md5(data.newPsw)
          return data
        },
        defaultData: {},
        items: [{ prop: 'newPsw', label: '新密码', type: 'text' }],
        rules: {
          newPsw: [
            {
              validator: (rule, value, callback) => {
                const reg = /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)])+$)^.{6,16}$/
                if (!value || value === '') {
                  callback(new Error('请输入密码'))
                } else if (value.length < 6 || value.length > 16) {
                  callback(new Error('长度在 6 到 16 个字之间'))
                } else if (!reg.test(value)) {
                  callback(new Error('密码为字母和数字组成'))
                } else {
                  callback()
                }
              },
              trigger: ['blur', 'change']
            }
          ]
        }
      }
    }
  },
  watch: {
    // 树形：搜索内容
    treeSearchVal (val) {
      this.$refs.treeBox.filter(val)
    }
  },

  mounted () {
    // 初始化页面数据
    this.getList(true)
    this.getRoleList()
  },

  methods: {

    getDeptIdToChange (ids) {
      this.changeDeptForm.data.deptId = ids
    },

    getDeptId (ids) {
      this.form.data.dept = ids
      this.addDeptIds = ids
    },

    setUserDept (list) {
      this.changeDeptForm.items[0].list = []
      list.forEach(item => {
        const index = list.findIndex(val => {
          return val.parentId === item.deptId
        })
        if (index < 0) {
          this.changeDeptForm.items[0].list.push(item)
        }
      })
    },

    // 获取机构列表
    async getList (isInit) {
      await getOrgList().then(res => {
        // this.changeDeptForm.items[0].list = res.data.list
        const list = arrayToTree(res.data.list, 'deptId')
        this.list = _.cloneDeep(list)
        this.setUserDept(res.data.list)
        if (isInit) {
          res.data.list.forEach(item => {
            if (item.parentId === 0) {
              this.currentDeptId = item.deptId
            }
          })
          this.$nextTick(() => {
            this.$refs.treeBox.setCurrentKey(this.currentDeptId)
          })
          this.getUserList()
        } else {
          this.$nextTick(() => {
            this.$refs.treeBox.setCurrentKey(this.selectTreeData.key)
          })
        }
      })
    },

    // 获得角色列表
    getRoleList () {
      getRoleList().then(res => {
        this.roleList = res.data.list
      })
    },

    // 获取用户列表
    async getUserList (isExport) {
      this.userTableLoading = true

      const params = {
        pageNum: this.currentPage,
        pageSize: isExport ? 0 : this.pageSize,
        currentDeptId: this.currentDeptId,
        nickname: this.searchName,
        username: this.searchUsername
      }
      await getSubDeptUsers(params).then(res => {
        this.userTableLoading = false
        if (res.code !== 1) {
          this.$message({ type: 'error', message: '查询失败，请重试' })
        }
        if (isExport) {
          this.exportData = res.data.list
          return
        }
        this.userList = res.data.list
        this.total = res.data.total
        this.pageSize = res.data.pageSize
        this.currPage = res.data.pageNum
        this.setSort()
      })
    },

    async getRoleIdList (id) {
      const params = {
        userId: id
      }
      let result

      await getUserInfo(params).then(res => {
        result = res.data.list[0].roleIdList
      })

      return result
    },

    // ----------------------------tree start----------------------------------

    // 树形:搜索/筛选
    treeNodeFilter (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },

    // 树形点击事件
    treeNodeClick (node, data) {
      this.currentPage = 1
      this.selectTreeData = data
      this.currentDeptId = node.deptId
      this.currentDeptName = node.name
      this.form.data.dept = [node.deptId]
      this.form.defaultData.dept = [node.deptId]
      this.getUserList()
      this.canAddUser = !data.childNodes.length
    },

    treeNodeSaveSuccess (data) {
      if (data.code === 1) {
        this.$message({ message: '操作成功!', type: 'success' })
        this.getList()
      }
    },

    mouseleave () {
      this.$refs.dropdown.style.display = 'none'
    },

    dropdownMouseover (data, event) {
      this.$nextTick(() => {
        this.$refs.dropdown.style.display = 'block'
        this.$refs.dropdown.style.top = event.clientY - 100 + 'px'
      })
    },

    // 机构鼠标事件，显示下拉
    mouseover (data, node) {
      this.currentTreeNodeId = data.deptId

      this.orgData = data
      this.orgNode = node
    },

    mouseenter () {
      this.$refs.dropdown.style.display = 'none'
    },

    mouseleaveOrg () {
      this.currentTreeNodeId = ''
      this.$refs.dropdown.style.display = 'none'
    },

    ctrlOrg (command) {
      this.$refs.dropdown.style.display = 'none'
      switch (command) {
        case 1: // 增加
          this._appendTreeNode(this.orgNode, this.orgData)
          break
        case -1: // 删除
          this._removeTreeNode(this.orgNode, this.orgData)
          break
        case 0: // 修改
          this._editTreeNode(this.orgNode, this.orgData)
          break
      }
    },

    // tree 机构增加
    _appendTreeNode (node, data) {
      if (data.existUser) {
        this.$message({
          type: 'warning',
          message: '机构和人员不能同级，请先移除人员'
        })
        return
      }
      this.treeNodeEditForm.data = {
        parentId: data.deptId
      }
      this.treeNodeEditForm.type = 'add'
      this.treeNodeEditForm.dialogOpen = true
      this.currentTreeData = data
    },

    // tree 机构移除
    _removeTreeNode (node, data) {
      if (data.count > 0) {
        this.$message({
          type: 'warning',
          message: '请先将人员移除/变更机构,再删除'
        })
        return
      }

      this.$confirm(
        '“' + data.name + '”将永久删除，且无法撤销！',
        '确定要删除该机构吗？',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(
        async () => {
          await deleteOrg({ deptId: data.deptId })
          const parent = node.parent
          const children = parent.data.children || parent.data
          const index = children.findIndex(d => d.deptId === data.deptId)
          children.splice(index, 1)
          this.$message({ type: 'success', message: '删除成功!' })
        },
        () => {
          return false
        }
      )
    },

    // tree 机构编辑
    _editTreeNode (node, data) {
      this.currentTreeData = data
      this.treeNodeEditForm.type = 'edit'
      this.treeNodeEditForm.dialogOpen = true
      this.treeNodeEditForm.defaultData.name = data.name
      this.treeNodeEditForm.data.name = data.name
    },

    // ----------------------------tree end----------------------------------

    // ----------------------------table人员列表操作----------------------------------

    // 添加人员
    addUser (canAdd) {
      this.treeSelectData = []
      if (canAdd) {
        this.treeSelectData = [{ deptId: this.currentDeptId, name: this.currentDeptName }]
      }
      this.form.items[2].editHide = false
      this.handleAddEdit()
    },

    // 编辑人员
    async ediUser () {
      if (this.multipleSelection.length !== 1) {
        this.$message({ type: 'warning', message: '请选择一条数据!' })
      } else {
        const data = this.multipleSelection[0]
        this.editUserName = data.username
        this.form.items[2].editHide = true
        data.roleIdList = await this.getRoleIdList(
          data.userId
        )
        this.handleAddEdit(data)
        this.treeSelectData = []
        const deptIdList = this._getDeptList(data.deptNames, data.deptIds)
        // const deptIdList = [{ name: '越秀区', deptId: 25 }, { name: '黄浦区', deptId: 26 }]
        this.form.data.dept = data.deptIds
        // this.form.data.dept = [25, 26]
        for (let i = 0; i < deptIdList.length; i++) {
          this.treeSelectData.push(deptIdList[i])
        }
        if (data.startTime && data.endTime) {
          this.$set(this.form.data, 'date', [new Date(data.startTime), new Date(data.endTime)])
        }
      }
    },

    _getDeptList (name, id) {
      const ids = id.split(',')
      const names = name.split(',')
      const result = []

      for (let i = 0; i < ids.length; i++) {
        const obj = { name: '', deptId: '' }
        obj.name = names[i]
        obj.deptId = ids[i]
        result.push(obj)
      }

      return result
    },

    // 删除人员
    deleteUser (row) {
      if (this.multipleSelection.length === 0) {
        this.$message({ type: 'warning', message: '请选中至少一条数据!' })
        return
      }

      this.$confirm(
        '选中的' +
          this.multipleSelection.length +
          '条数据将永久删除，且无法撤销！',
        '确定要删除吗？',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(
        async () => {
          // const res = await deleteUser({ userId: this.userIds.toString() })
          const res = await deleteDeptUser({ userIds: this.userIds.toString(), deptId: this.currentDeptId })
          if (res.code !== 1) {
            // this.$message({ type: 'success', message: 'error!' })
            return
          }
          this.getUserList()
          this.getList()
          this.$message({ type: 'success', message: '删除成功!' })
        },
        () => {
          return false
        }
      )
    },

    // 导出EXCEL
    async exportEXCEL () {
      await this.getUserList(true)
      // 导出Execl: 开始导出
      if (!this.exportData.length) {
        this.downloadLoading = false
        this.$message({
          type: 'warning',
          message: '列表为空数据时不能导出',
          showClose: true
        })
        return
      }

      this.downloadLoading = true
      // 表头
      const header = [
        '用户名',
        '登录账号',
        '职务',
        '办公电话',
        '分机号码',
        '手机号码',
        '所属机构',
        '状态',
        '备注'
      ]
      // 表头对应的参数名
      const filterVal = [
        'nickname',
        'username',
        'job',
        'phone',
        'exnumber',
        'mobile',
        'deptDirectory',
        'status',
        'remark'
      ]
      // 更改表格内容
      const data = this.exportData.map(v =>
        filterVal.map(j => {
          return v[j]
        })
      )
      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel({
          header,
          data,
          filename: '用户名单', // 文件名
          autoWidth: true,
          bookType: 'xlsx'
        })

        this.$message({
          message: '导出成功',
          type: 'success',
          showClose: true
        })
        this.downloadLoading = false
      })
    },

    // 新增\编辑: 编辑数据
    handleAddEdit (data) {
      // 设置假密码
      if (data) {
        // data.password = '111111'
        this.form.data = _.cloneDeep(data)
        this.form.type = 'edit'
      } else {
        this.form.data = _.cloneDeep(this.form.defaultData)
        this.form.type = 'add'
      }

      this.form.dialogOpen = true
    },

    // 查询人员数据
    searchTable (isReset) {
      this.searchUsername = isReset ? '' : this.searchUsername
      this.searchName = isReset ? '' : this.searchName
      this.getUserList()
    },

    // 表格单击行时选中该行checkbox
    handleClickTableRow (row, event, column) {
      this.$refs.dragTable.toggleRowSelection(row)
    },

    // table列表多选数据
    handleSelectionChange (val) {
      this.userIds = []
      this.multipleSelection = val
      this.multipleSelection.forEach(item => {
        this.userIds.push(item.userId)
      })
    },

    pagination (data) {
      this.pageSize = data.limit
      this.currentPage = data.page
      this.getUserList()
    },

    // 人员新增编辑成功回调
    handleForm (res) {
      if (res.code !== 1) {
        this.$message({ type: 'error', message: res.msg })
        return
      }
      this.getUserList()
      this.getList()
      this.$message({ type: 'success', message: '保存成功' })
    },

    // 重置密码
    resetPSD () {
      if (this.multipleSelection.length === 0) {
        this.$message({ type: 'warning', message: '请选中至少一条数据!' })
        return
      }

      this.resetPSDForm.dialogOpen = true
    },

    psdSaveSuccess (res) {
      if (res.code === 1) {
        this.$message({ type: 'success', message: '重置密码成功' })
      }
    },

    // 变更人员机构
    moveToDept () {
      this.changeDeptForm.data.deptId = []
      this.deptChangeData = []
      if (this.multipleSelection.length === 0) {
        this.$message({ type: 'warning', message: '请选中至少一条数据!' })
        return
      }

      this.changeDeptForm.dialogOpen = true
    },

    // 用户列表拖拽排序
    setSort () {
      const el = this.$refs.dragTable.$el.querySelectorAll(
        '.el-table__body-wrapper > table > tbody'
      )[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function (dataTransfer) {
          // to avoid Firefox bug
          // Detail see : https://github.com/RubaXa/Sortable/issues/1012
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const param = {
            startOrderNum: this.userList[evt.oldIndex].orderNum,
            endOrderNum: this.userList[evt.newIndex].orderNum
          }
          userSort(param).then((res) => {
            if (res.code !== 1) {
              console.error('用户排序失败')
            }
          })
        }
      })
    },

    // 变更用户状态
    changeUserStatus (row) {
      const params = {
        userId: row.userId,
        status: row.status
      }
      updateUser(params).then(res => {})
    },

    deptSaveSuccess (res) {
      if (res.code === 1) {
        this.$message({ type: 'success', message: '变更成功' })
        this.getList()
        this.getUserList()
      } else {
        this.$message({ type: 'error', message: res.msg })
      }
    },

    // ----------------------------table人员列表操作----------------------------------
    // 机构拖拽排序
    handleDrop (draggingNode, dropNode, dropType, ev) {
      let parentId = ''
      const startNode = draggingNode.data
      const endNode = dropNode.data
      // eslint-disable-next-line no-unused-vars
      let startIndex = 0
      // eslint-disable-next-line no-unused-vars
      let endIndex = 0
      const arr = treeToArray(this.list)
      setIndex()
      switch (dropType) {
        case 'after':after(); break
        case 'before': before(); break
        case 'inner':inner(); break
      }

      function setIndex () {
        startIndex = arr.findIndex((val) => {
          return val.deptId === startNode.deptId
        })

        endIndex = arr.findIndex((val) => {
          return val.deptId === endNode.deptId
        })
      }

      function after () {
        parentId = dropNode.data.parentId
        arr.splice(endIndex + 1, 0, arr[startIndex])
        arr.splice(startIndex, 1)
      }

      function before () {
        parentId = dropNode.data.parentId
        arr.splice(endIndex, 0, arr[startIndex])
        arr.splice(startIndex + 1, 1)
      }

      function inner () {
        parentId = dropNode.data.deptId
        arr.splice(endIndex + 1, 0, arr[startIndex])
        arr.splice(startIndex, 1)
      }

      function sortDept () {
        const deptIds = []
        for (let i = 0; i < arr.length; i++) {
          deptIds.push(arr[i].deptId)
        }

        return deptIds.toString()
      }

      const param = {
        deptId: draggingNode.data.deptId,
        parentId: parentId,
        deptIds: sortDept()
      }

      deptSort(param).then((res) => {
        if (res.code === 1) {
          this.getList()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>

/**/
.dragTableMain {
  .el-table {
    cursor: pointer;
  }
}

.btnList {
  margin-top: 16px;
  margin-bottom: 4px;
}

.app-container {
  padding: 0;
}

.aside {
  padding-right: 20px;
  border-right: 1px solid #ecedee;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;

  button {
    margin-left: 0;
  }

  input {
    border: none;
  }

  width: calc(100% - 24px);

  > span:first-child {
    display: inline-block;
    width: calc(100% - 22px);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

label {
  min-width: 70px;
  position: relative;
  top: 10px;
  font-weight: normal;
  font-size: 14px;
}

.el-icon-more {
  transform: rotate(90deg);
}

.el-table .cell{
  white-space: nowrap;
}

svg{
  margin-right: 5px;
}

</style>
