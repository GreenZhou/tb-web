<template>
  <div class="app-container">
    <!-- header：信息 -->
    <div class="header">
      <el-row>
        <el-col :span="12" class="headLeft">基础数据</el-col>
      </el-row>
    </div>

    <!--    <el-container :style="{padding:'20px'}">-->

    <!--      &lt;!&ndash; aside：机构组织 &ndash;&gt;-->
    <!--      <el-aside width="260px" class="aside">-->
    <!--        <el-input v-model="treeSearchVal" placeholder="请输入机构名称" clearable :style="{marginBottom:'16px'}" />-->
    <!--        <el-tree ref="treeBox" :props="{label: 'name'}" node-key="id" :data="list" :filter-node-method="treeNodeFilter" highlight-current @node-click="treeNodeClick" />-->
    <!--      </el-aside>-->

    <!--      <el-main :style="{padding:'0 20px'}">-->
    <!--        <div class="mainHeader">-->

    <!--          &lt;!&ndash; breadcrumb ：面包屑 &ndash;&gt;-->
    <!--          <el-breadcrumb separator-class="el-icon-arrow-right">-->
    <!--            <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.id"><a class="pointer" @click="breadcrumbClick(item)">{{ item.name }}</a></el-breadcrumb-item>-->
    <!--          </el-breadcrumb>-->

    <!--          &lt;!&ndash; 新增下级机构&ndash;&gt;-->
    <!--          <div class="fr">-->
    <!--            <el-button type="primary" @click="handleAddEdit()">新增下级机构</el-button>-->
    <!--          </div>-->

    <!--        </div>-->
    <!--        &lt;!&ndash; table：人员列表 &ndash;&gt;-->
    <!--        <el-table ref="table" :data="listSelect" style="width: 100%" :header-cell-style="{background:'#f9f9f9'}">-->
    <!--          <el-table-column prop="name" label="机构名称" />-->
    <!--          <el-table-column label="操作" width="200">-->
    <!--            <template slot-scope="scope">-->
    <!--              <el-button size="mini" type="primary" @click="handleAddEdit(scope.row)">编辑</el-button>-->
    <!--              <el-button size="mini" type="danger" @click="handleDelete(scope)">删除</el-button>-->
    <!--            </template>-->
    <!--          </el-table-column>-->
    <!--          <template slot="empty">-->
    <!--            <div class="noticeEmpty">-->
    <!--              <i class="el-icon-info iconLeft" />-->
    <!--              暂无下级机构<span>|</span><a @click="handleAddEdit()">新增下级机构</a>-->
    <!--            </div>-->
    <!--          </template>-->
    <!--        </el-table>-->
    <!--      </el-main>-->
    <!--    </el-container>-->

    <!-- 弹出框:新增\编辑组织机构 -->
    <!--    <ElementFormDialog :form="form" @handleSaveSuccess="getList" />-->
  </div>
</template>

<script>
import _ from 'loadsh'
import { changeTreeData } from '@/utils'
import {
  getOrgList,
  deleteOrg,
  addOrg,
  updateOrg
} from '@/api/system/organization'
// import permission from '@/directive/permission/index.js' // 权限判断指令
// import ElementFormDialog from '@/components/Form/ElementFormDialog'

export default {
  name: 'DataBase',
  // components: { ElementFormDialog },
  // directives: { permission },
  data () {
    return {
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
        FunctionBeforeUpdat: data => {
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

      list: [], // 列表
      listSelect: [], // 被选中的列表
      treeSearchVal: '', // 树形：搜索内容
      breadcrumbList: [] // 面包屑：显示列表
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
  },

  methods: {
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
        { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
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
    }
  }
}
</script>

<style lang="scss" scoped>
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
</style>
