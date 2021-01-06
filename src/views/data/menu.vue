<template>
  <div class="app-container">
    <!-- header：信息 -->
    <div class="header">
      <el-row>
        <el-col :span="12" class="headLeft">数据目录</el-col>
      </el-row>
    </div>

    <el-container :style="{padding:'20px'}">
      <!-- aside：机构组织 -->
      <el-aside width="260px" class="aside">
        <el-input
          v-model="treeSearchVal"
          placeholder="请输入机构名称"
          clearable
          :style="{marginBottom:'16px'}"
        />
        <el-tree
          ref="treeBox"
          draggable
          :allow-drop="allowDrop"
          :allow-drag="allowDrag"
          :props="{label: 'name'}"
          node-key="id"
          :data="list"
          :filter-node-method="treeNodeFilter"
          highlight-current
          @node-drag-start="handleDragStart"
          @node-drag-enter="handleDragEnter"
          @node-drag-leave="handleDragLeave"
          @node-drag-over="handleDragOver"
          @node-drag-end="handleDragEnd"
          @node-drop="handleDrop"
          @node-contextmenu="rightClick"
          @node-click="treeNodeClick"
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span>
              <el-button type="text" size="mini" @click="() => append(data)">
                <i class="el-icon-circle-plus-outline" />
              </el-button>
              <el-button type="text" size="mini" @click="() => remove(node, data)">
                <i class="el-icon-remove-outline" />
              </el-button>
              <el-button type="text" size="mini" @click="() => remove(node, data)">
                <i class="el-icon-edit-outline" />
              </el-button>
            </span>
          </span>
        </el-tree>
        <!--        <div id="perTreeMenu" v-if="tmDisplay" class="tree_menu" :style="{...rightMenu}">-->
        <!--          <ul>-->
        <!--            <li><i class="el-icon-tickets"></i> 详情</li>-->
        <!--            <li><i class="el-icon-edit"></i> 编辑</li>-->
        <!--          </ul>-->
        <!--        </div>-->
      </el-aside>

      <el-main :style="{padding:'0 20px'}">
        <el-row :gutter="14" class="btnList">
          <el-col :span="12">
            <el-button size="small" type="primary" @click="resetSearch()">关联数据表</el-button>
            <el-button size="small" type="primary" @click="resetSearch()">移除</el-button>
          </el-col>
        </el-row>
        <div class="mainHeader">
          <!-- breadcrumb ：面包屑 -->
          <!--          <el-breadcrumb separator-class="el-icon-arrow-right">-->
          <!--            <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.id"><a class="pointer"-->
          <!--                                                                                 @click="breadcrumbClick(item)">{{-->
          <!--              item.name }}</a></el-breadcrumb-item>-->
          <!--          </el-breadcrumb>-->

          <!-- 新增下级机构-->
          <!--          <div class="fr">-->
          <!--            <el-button type="primary" @click="handleAddEdit()">新增下级机构</el-button>-->
          <!--          </div>-->
        </div>
        <!-- table：人员列表 -->
        <el-table
          ref="table"
          :data="userList"
          style="width: 100%"
          :header-cell-style="{background:'#f9f9f9'}"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="表名称（英文）" />
          <el-table-column prop="username" label="表名称（中文）" />
          <el-table-column prop="position" label="标注释" />
          <el-table-column prop="tel" label="数据源" />
          <template slot="empty">
            <div class="noticeEmpty">
              <i class="el-icon-info iconLeft" />
              <!--              暂无下级机构<span>|</span><a @click="handleAddEdit()">新增下级机构</a>-->
            </div>
          </template>
        </el-table>
        <el-pagination
          style="margin-top: 16px; text-align:right;"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 15, 20]"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-main>
    </el-container>

    <!-- 弹出框:新增\编辑组织机构 -->
    <ElementFormDialog :form="form" @handleSaveSuccess="getList" />
  </div>
</template>

<script>
import _ from 'loadsh'
import { changeTreeData } from '@/utils'
import {
  addOrg,
  deleteOrg,
  getOrgList,
  getUserByOrgId,
  updateOrg
} from '@/api/system/organization'
// import permission from '@/directive/permission/index.js' // 权限判断指令
import ElementFormDialog from '@/components/Form/ElementFormDialog'

let id = 1000
export default {
  name: 'DataMenu',
  components: { ElementFormDialog },
  // directives: { permission },
  data () {
    return {
      canAddRole: false,
      rightMenu: {},
      tmDisplay: false,

      // form: 参数
      form: {
        data: {},
        dialogOpen: false,
        size: 'middle',
        labelPosition: 'top',
        FunctionSave: addOrg,
        FunctionUpdate: updateOrg,
        FunctionBeforeSave: data => {
          data.orderNum = 0
          data.parentId = this.$refs.treeBox.getCurrentNode().id
          return data
        },
        FunctionBeforeUpdate: data => {
          data.deptId = data.id
          data.orderNum = 0
          return data
        },
        defaultData: {
          id: '',
          name: '',
          orderNum: '',
          parentId: '',
          parentName: ''
        },
        items: [{ prop: 'name', label: '机构名称' }],
        rules: {
          name: [
            {
              required: true,
              validator: (rule, value, callback) => {
                if (value === '') {
                  callback(new Error('请输入机构名称'))
                } else if (value.indexOf('-') > 0) {
                  callback(new Error("机构名称不能含有特殊符号'-'"))
                } else if (value.indexOf(' ') > 0) {
                  callback(new Error('机构名称不能含有空格'))
                } else {
                  callback()
                }
              },
              trigger: ['blur', 'change']
            },
            { max: 20, message: '长度在 1 到 20 个字之间', trigger: 'blur' }
          ]
        }
      },

      userList: [], // 用户列表
      list: [], // 列表
      listSelect: [], // 被选中的列表
      treeSearchVal: '', // 树形：搜索内容
      breadcrumbList: [], // 面包屑：显示列表
      multipleSelection: [], // table多选数据
      pageSize: 10,
      currentPage: 1,
      total: 0
    }
  },
  watch: {
    // 树形：搜索内容
    treeSearchVal (val) {
      this.$refs.treeBox.filter(val)
    },
    // 设置被选机构的下属列表
    breadcrumbList (val) {
      this.listSelect = this.filterListSelect(val[val.length - 1].id)
    }
  },

  mounted () {
    this.getList()
    this.getUserList()
  },

  methods: {
    // 每页多少条
    handleSizeChange (val) {
      this.pageSize = val
    },
    // 当前页
    handleCurrentChange (val) {
      this.currentPage = val
    },

    // table多选数据
    handleSelectionChange (val) {
      this.multipleSelection = val
    },

    // tree 增加
    append (data) {
      const newChild = { id: id++, name: 'addNode', children: [] }
      if (!data.children) {
        this.$set(data, 'children', [])
      }
      data.children.push(newChild)
    },

    // tree 移除
    remove (node, data) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.id === data.id)
      children.splice(index, 1)
    },

    // tree 编辑
    edit (node, data) {},

    rightClick (e, data, node, comp) {
      this.rightMenu = { top: e.pageY + 'px', left: e.pageX + 'px' }
      this.tmDisplay = true
      const self = this
      document.onclick = function (ev) {
        if (ev.target !== document.getElementById('perTreeMenu')) {
          self.tmDisplay = false
        }
      }
    },

    // 新增\编辑: 编辑数据
    handleAddEdit (data) {
      this.form.data = data
        ? _.cloneDeep(data)
        : _.cloneDeep(this.form.defaultData)
      this.form.type = data ? 'edit' : 'add'
      this.form.dialogOpen = true
    },
    // 删除
    handleDelete ({ $index, row }) {
      if (row.children.length > 0) {
        return this.$message({ type: 'warning', message: '请先删除子部门!' })
      }

      this.$confirm(
        '“删除机构”将永久删除，且无法撤销！',
        '确定要删除该机构吗？',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(
        async () => {
          await deleteOrg({ deptId: row.id })
          this.listSelect.splice($index, 1)
          this.$refs.treeBox.remove(row.id)
          this.$message({ type: 'success', message: '删除成功!' })
        },
        () => {
          return false
        }
      )
    },

    getUserList (id) {
      getUserByOrgId().then(res => {
        this.userList = res.page.list
        this.total = res.page.totalCount
        this.pageSize = res.page.pageSize
        this.currPage = res.page.currPage
      })
    },

    // 获取机构列表
    getList () {
      getOrgList().then(res => {
        const list = changeTreeData({
          list: res.data.list,
          FunChangeData: (data, list) => {
            data.id = data.deptId
            return data
          }
        })
        this.list = _.cloneDeep(list)
        this.breadcrumbList = []
        this.breadcrumbList.push(list[0])
        this.listSelect = this.filterListSelect(list[0].id)
        setTimeout(() => {
          this.$refs.treeBox.setCurrentKey(list[0].id)
          this.$refs.treeBox.store.nodesMap[list[0].id].expanded = true
        }, 300)
      })
    },

    // 面包屑：点击时
    breadcrumbClick (item) {
      for (var i = 0; i < this.breadcrumbList.length; i++) {
        if (item.id === this.breadcrumbList[i].id) {
          this.breadcrumbList = this.breadcrumbList.slice(0, i + 1)
        }
      }
      this.$refs.treeBox.setCurrentKey(item.id)
    },
    // 树形:搜索/筛选
    treeNodeFilter (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 树形点击
    treeNodeClick (node, data) {
      this.getUserList(node.id)

      const breadcrumbList = []
      getBreadcrumbList(data)
      this.breadcrumbList = breadcrumbList

      // 获取面包屑列表
      function getBreadcrumbList (data) {
        const item = {
          id: data.data.id,
          name: data.data.name,
          $treeNodeId: data.data.$treeNodeId
        }
        breadcrumbList.unshift(item)
        if (data.parent && data.parent.parent) {
          getBreadcrumbList(data.parent)
        }
      }
    },

    // 过滤: tree的下属列表
    filterListSelect (id) {
      let arr = []
      getChildren(this.list)

      function getChildren (data) {
        if (arr.length) return

        for (var i = 0, len = data.length; i < len; i++) {
          if (data[i].id === id) {
            arr = data[i].children || []
            return
          } else if (data[i].children && data[i].children.length) {
            getChildren(data[i].children)
          }
        }
      }

      // const listSelect = []
      // for (var i = 0, len = arr.length; i < len; i++) {
      //   listSelect.push({
      //     id: arr[i].id,
      //     name: arr[i].name,
      //     children: arr[i].children && arr[i].children.length
      //   })
      // }
      // this.listSelect = listSelect
      return arr
    },

    handleDragStart (node, ev) {
      console.log('drag start', node)
    },
    handleDragEnter (draggingNode, dropNode, ev) {
      console.log('tree drag enter: ', dropNode.label)
    },
    handleDragLeave (draggingNode, dropNode, ev) {
      console.log('tree drag leave: ', dropNode.label)
    },
    handleDragOver (draggingNode, dropNode, ev) {
      console.log('tree drag over: ', dropNode.label)
    },
    handleDragEnd (draggingNode, dropNode, dropType, ev) {
      console.log('tree drag end: ', dropNode && dropNode.label, dropType)
    },
    handleDrop (draggingNode, dropNode, dropType, ev) {
      console.log('tree drop: ', dropNode.label, dropType)
    },
    allowDrop (draggingNode, dropNode, type) {
      if (dropNode.data.label === '二级 3-1') {
        return type !== 'inner'
      } else {
        return true
      }
    },
    allowDrag (draggingNode) {
      return draggingNode.data.label.indexOf('三级 3-2-2') === -1
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.red {
  color: $red;
}

.green {
  color: $green;
}

.btnList {
  margin: 12px 0;
}

.app-container {
  padding: 0;
}

.header {
  border-bottom: 1px dashed #eef0f2;
  padding: 16px;

  .headLeft {
    font-weight: 700;
    font-size: 20px;
    line-height: 36px;
  }
}

.aside {
  padding-right: 20px;
  border-right: 1px solid #ecedee;
}

.mainHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

//table：空数据提示
.noticeEmpty {
  padding: 56px 0;

  .iconLeft {
    color: #0091f2;
  }

  span {
    padding: 0 6px;
  }

  a {
    color: #0073bd;
  }

  a:hover {
    color: #2192d9;
  }
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
}

/*.tree_menu {*/
/*  position: fixed;*/
/*  display: block;*/
/*  z-index: 20000;*/
/*  background-color: #fff;*/
/*  padding: 5px 0;*/
/*  border: 1px solid #ebeef5;*/
/*  border-radius: 4px;*/
/*  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);*/

/*  ul {*/
/*    margin: 0;*/
/*    padding: 0;*/
/*  }*/

/*  ul li {*/
/*    list-style: none;*/
/*    margin: 0;*/
/*    padding: 0 15px;*/
/*    font-size: 14px;*/
/*    line-height: 30px;*/
/*    cursor: pointer;*/
/*  }*/

/*  ul li:hover {*/
/*    background-color: #ebeef5*/
/*  }*/
/*}*/
</style>
