<template>
  <div class="app-container">
    <el-container :style="{padding:'20px'}">
      <!-- 任务列表 -->
      <el-aside width="450px" class="aside">
        <el-input
          v-model="taskNameSearch"
          placeholder="请输入任务名"
          clearablea
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
              @click="addTask()"
              v-permission="{function:['ADD']}"
            >刷手名单</el-button>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-plus"
              @click="publishTask()"
              v-permission="{function:['PUBLISH']}"
            >买家明细</el-button>
          </el-col>
        </el-row>
        <el-table
          v-loading="taskTableLoading"
          ref="taskTable"
          :data="taskList"
          style="width: 100%"
          row-class-name="pointer"
          highlight-current-row
          border
          @selection-change="handleTaskSelectionChange"
          @row-click="selectTask"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="taskName" label="任务名称" />
          <el-table-column prop="createTime" label="创建时间" />
        </el-table>
      </el-aside>
      <el-main :style="{padding:'0 20px'}">
        <el-row :gutter="14" class="btnList" :style="{marginBottom:'4px'}">
          <el-col :span="24">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-plus"
              @click="getOrderList()"
              v-permission="{function:['ORDER_LIST']}"
            >订单查询</el-button>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-plus"
              @click="getProductList()"
              v-permission="{function:['PROD_MANAGE']}"
            >商品管理</el-button>
          </el-col>
        </el-row>
        <el-table
          v-loading="subTaskTableLoading"
          ref="subTaskTable"
          :data="subTaskList"
          style="width: 100%"
          row-class-name="pointer"
          highlight-current-row
          border
          @selection-change="handleSubTaskSelectionChange"
          @row-click="selectSubTask"
        >
          <el-table-column type="selection" width="55" />
          <!-- 如早班和晚班 -->
          <el-table-column prop="subTaskName" label="任务名称" />
          <el-table-column prop="orderNum" label="订单数量" />
          <el-table-column prop="buyerNeedNum" label="需要买家" />
          <el-table-column prop="buyerNum" label="已有买家" />
          <el-table-column prop="empNum" label="员工数量" />
          <el-table-column prop="checkedEmpName" label="已核查" />
          <el-table-column prop="checkingEmpName" label="待核查" />
      </el-table>

      </el-main>
    </el-container>
  </div>
</template>

<script>
import _ from 'loadsh'
import permission from '@/directive/permission' // 权限判断指令
import {
  addTask,
  deleteTask,
  getTaskList
} from '@/api/tb/task'

import {
  getSubTaskList
} from '@/api/tb/subTask'

export default {
  name: 'TaskCheck',
  directives: { permission },
  data () {
    return {
      taskNameSearch: '',
      taskTableLoading: false,
      taskList: [],
      currentTaskData: {},
      subTaskTableLoading: false,
      subTaskList: [],
      multipleSubTaskSelection: [],
      selectedSubTaskIds: [],
    }
  },
  computed: {},
  watch: {
    taskNameSearch (val) {
      this.getTaskList()
    }
  },

  created () {
    this.getTaskList()
  },
  methods: {
    // 获取任务列表
    getTaskList () {
      this.taskTableLoading = true
      const params = {
        name: this.taskNameSearch
      }
      getTaskList(params).then(res => {
        // 对返回数据进行排序
        this.taskList = res.data.list

        this.$nextTick(() => {
          this.$refs.taskTable.setCurrentRow(this.taskList[0]) // 选中第一条数据
          this.selectTask(this.taskList[0])
          //this.currentTaskData = this.taskList[0]
        })

        this.taskTableLoading = false
      })
    },
    addTask () {
      this.$confirm(
        '系统会自动创建以当前时间命名的任务',
        '确定要创建任务吗？',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).then(
        async () => {
          const res = await addTask()
          if (res.code !== 1) {
            this.$message({ type: 'error', message: res.msg })
            return
          }
          this.getTaskList()
          this.$message({ type: 'success', message: '创建成功!' })
        },
        () => {
          return false
        }
      )
    },
    updateTask () {
      console.log('更新任务')
    },
    publishTask () {
      console.log('发布任务')
    },
    handleTaskSaveSuccess (res) {
      if (res.code !== 1) {
        this.$message({ type: 'error', message: res.msg })
        return
      }

      this.getTaskList()
      this.$message({ type: 'success', message: '保存成功' })
    },
    handleTaskSelectionChange (val) {
      console.log(val)
    },
    selectTask (row) {
      this.currentTaskData = row

      // 触发查询子任务列表数据
      if (row && row.id) {
        this.getSubTaskList(row.id)
      } else {
        this.subTaskList = []
      }
    },

    getOrderList () {
      console.log('getOrderList')
    },
    getProductList () {
      console.log('getProductList')
    },

    handleSubTaskSelectionChange (val) {
      this.multipleSubTaskSelection = val
      this.selectedSubTaskIds = []
      val.forEach(item => {
        this.selectedSubTaskIds.push(item.id)
      })
    },
    getSubTaskList (taskId) {
      const params = {
        pid: taskId,
      }

      getSubTaskList(params).then(res => {
        this.subTaskList = res.data.list
      })
    },
    selectSubTask (row) {
      console.log(row)
    },
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
