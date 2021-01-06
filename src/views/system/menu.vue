<template>
  <div class="app-container">
    <el-container class="content">
      <el-header class="content_searchBox">
        <!-- search：搜索条件 -->
        <el-row :gutter="14">
          <el-col :span="8" class="el-row--flex">
            <label>菜单名称:</label>
            <el-input v-model="nameSearch" placeholder="请输入" clearable />
          </el-col>
          <el-col :span="8" class="el-row--flex">
            <label class="min-w90">唯一标识码:</label>
            <el-input v-model="uniCodeSearch" placeholder="请输入" clearable />
          </el-col>
          <el-col :span="8" class="el-row--flex">
            <el-button size="small" type="primary" icon="el-icon-search" @click="searchTable()">查询</el-button>
            <el-button size="small" icon="el-icon-refresh" @click="searchTable(true)">重置</el-button>
          </el-col>
        </el-row>
      </el-header>

      <el-main class="content_tableBox">
        <el-row class="mb-4">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="showAddMenu()"
            v-permission="{role:[22],function:['ADD']}"
          >新增</el-button>
        </el-row>
        <!-- table：菜单列表 -->
        <el-table
          v-loading="menuTableLoading"
          ref="dragTable"
          :expand-row-keys="expandRowKeys"
          :data="tableData.list"
          style="width: 100%;margin-bottom: 20px;"
          row-key="menuId"
          row-class-name="pointer"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          highlight-current-row
          border
          @row-click="rowMenuClick"
          @expand-change="expandChange"
        >
          <el-table-column prop="name" label="菜单名称" width="240" />
          <el-table-column prop="uniqueCode" label="唯一标识码" width="240" />
          <el-table-column prop="funcIds" label="功能" class="funcTags">
            <template slot-scope="scope" v-if="scope.row.funcNames">
              <el-tag
                :title="item"
                class="text-over"
                v-for="item in scope.row.funcNames.split(',')"
                :key="item"
                type="info"
              >{{ item }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="state" label="状态" width="120">
            <template slot-scope="scope">
              <el-tooltip
                :content="!scope.row.status?'未激活':'激活'"
                placement="right"
              >
                <el-switch
                  v-model="scope.row.status"
                  :disabled="scope.row.uniqueCode==='4'"
                  :active-value="1"
                  :inactive-value="0"
                  @change="changeMenuStatus(scope.row)"
                />
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click.stop="showEditMenu(scope.row)">修改</el-button>
              <el-button type="text" v-permission="{role:[22]}" @click.stop="deleteMenu(scope.row)">删除</el-button>
              <el-button type="text" @click.stop="ctrlRoles(scope.row)">角色授权</el-button>
              <el-button
                type="text"
                
                v-if="!scope.row.children||scope.row.children.length === 0"
                @click.stop="showFunc(scope.row)"
              >功能管理</el-button>

              <!--              <a class="operation" @click="showEditMenu(scope.row)">修改</a>-->
              <!--              <a class="operation" v-permission="{role:[22]}" @click="deleteMenu(scope.row)">删除</a>-->
              <!--              <a class="operation" @click="ctrlRoles(scope.row)">角色授权</a>-->
              <!--              <a-->
              <!--                v-permission="{role:[22],function:['FUNC']}"-->
              <!--                v-if="!scope.row.children||scope.row.children.length === 0"-->
              <!--                class="operation"-->
              <!--                @click="showFunc(scope.row)"-->
              <!--              >功能管理</a>-->
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>

    <!-- 弹出框:新增\编辑 -->
    <elementFormDialog :form="form" @handleSaveSuccess="saveMenuData()">
      <template slot="status">
        <el-tooltip :content="form.data.status?'激活':'未激活'" placement="right">
          <el-switch
            v-model="form.data.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-tooltip>
      </template>
    </elementFormDialog>

    <!-- 弹出框:授权编辑    -->
    <ElementFormDialog :form="formRole" @handleSaveSuccess="saveMenuRoles()">
      <template slot="role">
        <el-select
          v-model="formRole.data.roleIds"
          value-key="id"
          multiple
          clearable
          filterable
          class="w100"
        >
          <el-option
            v-for="ele in roleList"
            :key="ele.roleId"
            :label="ele.roleName"
            :value="ele.roleId"
          />
        </el-select>
      </template>
    </ElementFormDialog>

    <!-- 菜单功能 -->
    <el-dialog title="菜单功能" :visible.sync="dialogFuncTableVisible" @close="closeFuncTable">
      <div class="el-dialog-div">
        <el-col class="mb-4">
          <el-row>
            <el-button type="primary" icon="el-icon-plus" @click="addFuncRow">新增</el-button>
          </el-row>
        </el-col>
        <el-table
          :data="funcList"
          style="width: 100%;"
          highlight-current-row
          border
        >
          <el-table-column label="类型编码">
            <template slot-scope="{row}">
              <input class="edit-cell" v-if="row.showEdit" v-model="row.uniqueCode">
              <span v-if="!row.showEdit">{{ row.uniqueCode }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="类型名称">
            <template slot-scope="{row}">
              <input class="edit-cell" v-if="row.showEdit" v-model="row.name">
              <span v-if="!row.showEdit">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="是否启用">
            <template slot-scope="scope">
              <el-tooltip :content="scope.row.status ?'启用':'禁用'" placement="right">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="changeFuncStatus(scope.row)"
                />
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="备注">
            <template slot-scope="{row}">
              <input class="edit-cell" v-if="row.showEdit" v-model="row.remark">
              <span v-if="!row.showEdit">{{ row.remark }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <el-button type="text" v-if="!row.showEdit" @click="showEditFunc(row, $index)">修改</el-button>
              <el-button type="text" v-if="row.showEdit" @click.stop="showConfirmFunc(row, $index)">确定</el-button>
              <el-button type="text" @click.stop="deleteFunc(row,$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'loadsh'
import { mapGetters } from 'vuex'
import { changeTreeData, arrayToTree, treeToArray, sortByItem } from '@/utils'
import { getOrgList } from '@/api/system/organization'
import { getRoleList } from '@/api/system/role'
import {
  getMenu,
  deleteMenu,
  addMenuRoles,
  addMenu,
  updateMenu,
  updateMenuFunc,
  deleteMenuFunc,
  addMenuFunc,
  updateOrderNum,
  getFuncsByMenuId,
  updateMenuStatus
} from '@/api/system/menu'
import permission from '@/directive/permission' // 权限判断指令
import ElementFormDialog from '@/components/Form/ElementFormDialog'
import Sortable from 'sortablejs'

export default {
  name: 'SettingMenu',
  components: { ElementFormDialog },
  directives: { permission },
  data () {
    return {
      menuTableLoading: false,
      currMenuId: '',
      tableData: { list: [] },
      dataList: [], // 菜单列表
      expandRowKeys: [], // 拖拽排序
      orgList: [], // 机构列表
      roleList: [], // 角色列表
      funcObj: {}, // 功能对象
      funcList: [], // 功能所有列表
      uniCodeSearch: '', // 唯一标识码查询
      nameSearch: '', // 名字查询
      seeTypeByTree: false, // 查看方式
      noticePerson: true, // 弹出框:新增\编辑人员提示
      dictionary: [],
      menuId: '',
      menuList: [], // 修改状态时传递参数
      selectFuncMenuId: '', // 当前获取功能menuId
      // form: 参数
      form: {
        data: {},
        dialogOpen: false,
        FunctionSave: addMenu,
        FunctionUpdate: updateMenu,
        FunctionBeforeSave: data => {
          data.funcIds = data.funcIds ? data.funcIds.toString() : ''
          data.parentId = this.currMenuId
          return data
        },

        FunctionBeforeUpdate: data => {
          data.funcIds = data.funcIds ? data.funcIds.toString() : ''
          delete data.roleList
          delete data.children
          return data
        },
        defaultData: { status: 1 },
        items: [
          { prop: 'name', label: '菜单名称' },
          { prop: 'uniqueCode', label: '唯一标识码', editHide: !this.$store.state.user.roles.includes(22) },
          { prop: 'status', label: '状态', slot: 'status' }
        ],
        rules: {
          name: [
            { required: true, message: '菜单名称不能为空', trigger: 'change' },
            { max: 20, message: '长度在 1 到 20 个字之间', trigger: 'blur' }
          ],
          uniqueCode: [
            {
              required: true,
              message: '唯一标识码不能为空',
              trigger: 'change'
            },
            { max: 20, message: '长度在 1 到 20 个字之间', trigger: 'blur' }
          ]
        }
      },

      // 授权弹出框
      formRole: {
        type: 'edit',
        data: {
          roleIds: [],
          menuId: ''
        },
        dialogOpen: false,
        size: 'middle',
        labelPosition: 'top',
        FunctionUpdate: addMenuRoles,
        FunctionBeforeUpdate: data => {
          data.roles = data.roleIds.toString()
          data.menuId = this.menuId
          delete data.roleIds
          return data
        },
        defaultData: {},
        items: [{ prop: 'name', label: '角色授权', slot: 'role' }],
        rules: {}
      },

      // 菜单
      dialogFuncTableVisible: false,
      funcAddObj: {
        showEdit: true
      }
    }
  },
  computed: {
    ...mapGetters(['name'])
  },
  mounted () {
    this.getRoleList()
    this.getMenuData()
  },

  methods: {
    // 关闭功能编辑弹出,重新查询,为了修改没有确定保存回显数据
    closeFuncTable () {
      this.funcList = []
      this.getMenuData()
    },

    //
    showFunc (row) {
      this.selectFuncMenuId = row.menuId
      this.getMenuFuncList()

      this.dialogFuncTableVisible = true
    },

    //
    addFuncRow () {
      this.funcList.unshift({ showEdit: true })
    },

    showEditFunc (row, i) {
      row.showEdit = true
    },

    // 修改菜单状态
    changeFuncStatus (row) {
      const params = {
        functionId: row.functionId,
        status: row.status,
        menuId: this.selectFuncMenuId
      }

      updateMenuFunc(params).then(res => {
        if (res.code !== 1) {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      })
    },

    async showConfirmFunc (row, index) {
      if (
        !row.uniqueCode ||
          !row.name ||
          row.uniqueCode.trim() === '' ||
          row.name.trim() === ''
      ) {
        this.$message({
          type: 'warning',
          message: '请填写完整类型编码/类型名称'
        })
        return
      }

      const params = {
        functionId: row.functionId,
        name: row.name,
        remark: row.remark,
        status: row.status,
        uniqueCode: row.uniqueCode,
        menuId: this.selectFuncMenuId
      }

      // 修改
      if (row.functionId) {
        await updateMenuFunc(params).then(res => {
          if (res.code !== 1) {
            this.$message({ type: 'error', message: res.msg })
          }
        })
      } else {
        //  添加
        await addMenuFunc(params).then(res => {
          if (res.code !== 1) {
            this.$message({ type: 'error', message: res.msg })
          }
        })

        this.getMenuFuncList()
      }
      row.showEdit = false
      this.$set(this.funcList, index, row)
    },

    async deleteFunc (row, index) {
      this.$confirm('“删除数据”将永久删除，且无法撤销！', '确定要删除吗？', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        if (row.functionId) {
          await deleteMenuFunc({ functionId: row.functionId, id: row.id }).then(
            res => {
              if (res.code !== 1) {
                this.$message({ type: 'error', message: res.msg })
              }
            }
          )
        }
        this.funcList.splice(index, 1)
      })
    },

    // 获得菜单功能数据
    getMenuFuncList () {
      const params = {
        menuId: this.selectFuncMenuId
      }

      getFuncsByMenuId(params).then(res => {
        this.funcList = res.data.list
      })
    },

    // 获取角色列表
    getRoleList () {
      getRoleList().then(res => {
        this.roleList = res.data.list
      })
    },

    sortData (list) {
      const obj = {}
      let result = []
      list.forEach(item => {
        item.parentId = Number(item.parentId)

        if (obj[item.parentId]) {
          obj[item.parentId].push(item)
        } else {
          obj[item.parentId] = []
          obj[item.parentId].push(item)
        }
      })

      for (const item in obj) {
        result = result.concat(sortByItem(obj[item], 'orderNum'))
      }

      return result
    },

    // 获得菜单数据
    getMenuData () {
      this.menuTableLoading = true

      const params = {
        name: this.nameSearch,
        uniqueCode: this.uniCodeSearch,
        orderBy: 'orderNum'
      }

      getMenu(params).then(res => {
        this.dataList = res.data.list
        const list = this.sortData(res.data.list)
        this.tableData.list = arrayToTree(list, 'menuId')
        this.setSort()
        this.menuTableLoading = false
      })
    },

    // 菜单查询
    searchTable (isReset) {
      if (isReset) {
        this.nameSearch = ''
        this.uniCodeSearch = ''
      }

      this.getMenuData()
    },

    // table展开事件
    expandChange (row, expand) {
      if (!expand) {
        const index = this.expandRowKeys.indexOf(row.menuId.toString())
        this.expandRowKeys.splice(index, 1)
      } else {
        if (!this.expandRowKeys.includes(row.menuId.toString())) {
          this.expandRowKeys.push(row.menuId.toString())
        }
      }
    },

    // 菜单排序
    setSort () {
      const that = this
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
          const arr = treeToArray(that.tableData.list)

          // 2.顶级无父层排序
          // （1）拖拽节点是顶层，目标节点也是顶层，排序
          // （2）拖拽节点是顶层，目标节点不是顶层，加入
          // （3）拖拽节点不是顶层，目标节点也不是顶层
          // （3.1）两个节点是相同父层，排序
          // （3.2）两个节点不是相同父层，加入
          // 同层排序，不同层加入

          function _isBrother () {
            return (
              Number(arr[evt.newIndex].parentId) ===
                Number(arr[evt.oldIndex].parentId)
            )
          }

          if (_isBrother()) {
            // 有无子节点
            if (evt.newIndex < evt.oldIndex) {
              arr.splice(evt.newIndex, 0, arr[evt.oldIndex])
              arr.splice(evt.oldIndex + 1, 1)
            } else if (evt.newIndex > evt.oldIndex) {
              arr.splice(evt.newIndex + 1, 0, arr[evt.oldIndex])
              arr.splice(evt.oldIndex, 1)
            } else {
              return
            }
          }

          // 处理更改位置后，原数据位置bug
          that.$set(this.tableData, 'list', [])
          that.$nextTick(() => {
            that.$set(this.tableData, 'list', arrayToTree(arr, 'menuId'))
            const key = Number(arr[evt.newIndex].parentId).toString()
            if (!that.expandRowKeys.includes(key)) {
              that.expandRowKeys.push(key)
            }
            getMenuSort()
          })

          function getMenuSort () {
            const result = []

            arr.forEach(item => {
              if (
                Number(item.parentId) === Number(arr[evt.newIndex].parentId)
              ) {
                result.push(item.menuId)
              }
            })

            that.updateOrderNum(result.toString())
          }
        }
      })
    },

    // 更新菜单排序
    updateOrderNum (menuIds) {
      const params = {
        menuIds
      }
      updateOrderNum(params).then(res => {
        if (res.code !== 1) {
          this.$message({ type: 'error', message: res.msg })
        }
      })
    },

    // 根据parentId获得所有同级元素
    getAllBroId (pId) {
      return this.dataList.filter(item => {
        if (pId === item.parentId && item.status) {
          return true
        }
      })
    },

    getAllChangePId (row) {
      if (!row.parentId) {
        return
      }

      // 1.当前兄弟元素,是否有选中情况大于1或小于1(0)
      // 当前为大于1,不在修改父层
      // 当前为1,父元素打开
      // 当前为0,父元素关闭
      const broList = this.getAllBroId(row.parentId)

      if (broList.length > 1) {
      } else {
        let pItem
        if (row.uniqueCode === '4') {
          return
        }
        this.menuList.push(row.parentId)
        this.dataList.forEach(item => {
          if (item.menuId === row.parentId) {
            pItem = item
          }
        })
        this.getAllChangePId(pItem)
      }
    },

    getAllChangeCId (row) {
      // 有子元素
      if (this.hasChild(row)) {
        this.dataList.forEach(item => {
          if (item.parentId === row.menuId) {
            if (item.uniqueCode === '4') {
              return
            }
            this.menuList.push(item.menuId)
            if (this.hasChild(item)) {
              this.getAllChangeCId(item)
            }
          }
        })
      }
    },

    hasChild (row) {
      const index = this.dataList.findIndex(val => {
        return val.parentId === row.menuId
      })

      return index >= 0
    },

    // 改变菜单状态
    changeMenuStatus (row) {
      this.menuList = []
      // 1.当前id,当前状态,无上下级
      this.getAllChangePId(row)

      this.getAllChangeCId(row)

      this.menuList.push(row.menuId)

      const params = {
        menuIds: this.menuList.toString(),
        status: row.status
      }

      updateMenuStatus(params).then((res) => {
        if (res.code !== 0) {
          this.$message({ type: 'success', message: '更新成功' })
          this.getMenuData()
        }
      })
    },

    saveMenuRoles () {
      this.getMenuData()
    },

    // 选中当前菜单，用于新增菜单
    rowMenuClick (row) {
      if (this.currMenuId === row.menuId) {
        this.currMenuId = ''
        this.$refs.dragTable.setCurrentRow([])
      } else {
        this.currMenuId = row.menuId
      }
    },

    // 菜单编辑/新增成功回调
    saveMenuData () {
      this.form.data = {}
      this.getMenuData()
    },

    // 添加菜单
    showAddMenu () {
      this.form.dialogOpen = true
      this.form.type = 'add'
      this.form.data = _.cloneDeep(this.form.defaultData)
      this.form.items[1].editHide = false
    },

    // 删除菜单
    deleteMenu (row) {
      this.$confirm(
        '“删除数据”将永久删除，且无法撤销！',
          `确定要删除这${row.name}条数据吗？`,
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).then(
        async () => {
          // 删除之前
          const params = { menuId: row.menuId }
          await deleteMenu(params).then(res => {
            if (res.code === 1) {
              this.$message({
                message: '删除成功!',
                type: 'success',
                showClose: true
              })
              this.getMenuData()
            } else {
              this.$message({
                message: res.msg,
                type: 'error',
                showClose: true
              })
            }
          })
        },
        () => {
          return false
        }
      )
    },

    // 编辑菜单
    showEditMenu (row) {
      this.form.dialogOpen = true
      this.form.type = 'edit'
      this.form.data = _.cloneDeep(row)
      const funcIdList = this.form.data.funcIds
        ? this.form.data.funcIds.split(',')
        : []
      this.form.data.funcIds = funcIdList.map(Number)
    },

    // 角色授权
    ctrlRoles (row) {
      this.menuId = row.menuId
      this.formRole.dialogOpen = true
      this.formRole.data.id = row.id
      const roleList = row.roles ? row.roles.split(',') : []
      this.formRole.data.roleIds = roleList.map(Number)
    },

    // 获取机构列表
    getOrgList () {
      getOrgList().then(res => {
        const list = changeTreeData({
          list: res.data.list,
          FunChangeData: data => {
            data.id = data.deptId
            return data
          }
        })
        this.orgList = _.cloneDeep(list)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .mb-4 {
    margin-bottom: 4px;
  }

  .app-container {
    padding: 0;
  }

  .content {
    padding: 20px 0;

    .content_searchBox {
      height: auto !important;
    }

    .content_tableBox {
      padding-top: 10px;
    }
  }

  .min-w90 {
    min-width: 90px;
  }

  label {
    min-width: 70px;
    position: relative;
    top: 10px;
    font-weight: normal;
    font-size: 14px;
  }

  .el-tag {
    margin-right: 4px;
    margin-top: 4px;
  }

  .edit-cell {
    width: 100%;
  }

  .el-dialog-div {
    height: 60vh;
    overflow: auto;
  }

  .text-over{
    width: 70px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }
</style>
