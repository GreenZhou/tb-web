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
            >新增任务</el-button>
            <el-upload
              class="upload-demo inline-block"
              :style="{'margin-left': '10px'}"
              :show-file-list="false"
              :auto-upload="true"
              :action="uploadUrl"
              :with-credentials="true"
              :on-success="refreshSubTasks"
              :before-upload="checkUploadConditions"
              v-permission="{function:['IMPORT_ORDER_LIST']}"
            >
              <el-button size="mini" type="primary" icon="el-icon-top">导入订单</el-button>
            </el-upload>
            <el-button
              :style="{'margin-left': '10px'}"
              size="mini"
              type="primary"
              icon="el-icon-position"
              @click="publishTask()"
              v-permission="{function:['PUBLISH']}"
            >发布任务</el-button>
          </el-col>
        </el-row>
        <el-table
          v-loading="taskTableLoading"
          ref="taskTable"
          :data="taskList"
          :row-key="getRowKeys"
          style="width: 100%"
          row-class-name="pointer"
          highlight-current-row
          border
          @selection-change="handleTaskSelectionChange"
          @row-click="selectTask"
        >
          <el-table-column type="selection" width="55" :reserve-selection="true" />
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
              @click="getOrderList()"
              v-permission="{function:['ORDER_LIST']}"
            >订单查询</el-button>
            <el-button
              size="mini"
              type="primary"
              @click="getProductList()"
              v-permission="{function:['PROD_MANAGE']}"
            >商品管理</el-button>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-position"
              @click="openAssignEmpsDialog()"
              v-permission="{function:['EMP_ASSIGN']}"
            >指派员工</el-button>
          </el-col>
        </el-row>
        <el-table
          v-loading="subTaskTableLoading"
          ref="subTaskTable"
          :data="subTaskList"
          :row-key="getRowKeys"
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
          <el-table-column label="已核查">
            <template slot-scope="scope">
              <el-tag 
                type="success" 
                v-for="(emp, index) in scope.row.checkedEmps"
                :style="{'margin-right': '10px'}" 
                :key="index"
              >{{emp.empName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="待核查">
            <template slot-scope="scope">
              <el-tag 
                type="success" 
                v-for="(emp, index) in scope.row.uncheckEmps" 
                :style="{'margin-right': '10px'}" 
                :key="index"
              >{{emp.empName}}</el-tag>
            </template>
          </el-table-column>
      </el-table>

      </el-main>
    </el-container>
  
    <!-- 给对应早班或晚班指定员工 -->
    <EmpAssignDialog 
      v-if="assignEmpDialog"
      :assignEmpDialog="assignEmpDialog" 
      @handlerEmpSelectDialogClose="handlerEmpSelectDialogClose" 
      @assignEmpList="assignEmpList"
    >
    </EmpAssignDialog>
    
    <!-- 订单查询弹出框 -->
    <OrderDetailDialog 
      v-if="orderDialog"
      :orderDialog="orderDialog" 
      :taskId="currentTaskData.id"
      :subTaskIds="selectedSubTaskIds"
      @handlerOrderDetailDialogClose="handlerOrderDetailDialogClose"
    >
    </OrderDetailDialog>
  </div>
</template>

<script>
import _ from 'loadsh'
import permission from '@/directive/permission' // 权限判断指令
import {
  addTask,
  deleteTask,
  publishTask,
  getTaskList
} from '@/api/tb/task'

import {
  getSubTaskList,
  assignEmpList,
} from '@/api/tb/subTask'

import EmpAssignDialog from './components/empAssignDialog'
import OrderDetailDialog from './components/orderDetailDialog'

export default {
  name: 'TaskPublish',
  directives: { permission },
  components: { EmpAssignDialog, OrderDetailDialog },
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
      assignEmpDialog: false,
      orderDialog: false,
    }
  },
  computed: {
    uploadUrl() {
      return process.env.VUE_APP_BASE_API_PRO + '/tb/order/import/' + this.currentTaskData.id
    }
  },
  watch: {
    taskNameSearch (val) {
      this.getTaskList()
    }
  },

  created () {
    this.getTaskList()
  },
  methods: {
    getRowKeys (row) {
      return row.id
    },
    // 获取任务列表
    getTaskList () {
      this.taskTableLoading = true
      const params = {
        name: this.taskNameSearch,
        status: '0'
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
      let checkPublishFlag = true

      // 核查发布条件：具备订单数 和 待核查人
      this.subTaskList.forEach(subTask => {
        if(subTask.orderNum < 1 || subTask.uncheckEmps.length < 1) {
          checkPublishFlag = false
          return
        }
      })
      
      if(!checkPublishFlag) {
        this.$message({ type: 'error', message: '未满足发布条件，请确认上传订单和指派人员' })
        return
      }

      // 发布任务
      publishTask({ id: this.currentTaskData.id }).then(resp => {
        debugger
        if(resp.code != 1) {
          this.$message({ type: 'error', message: resp.msg })
          return
        }
        this.getSubTaskList()
        this.$message({ type: 'success', message: '发布成功' })
      }, err => {
        this.$message({ type: 'error', message: '发布失败' })
      })
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
      if (val.length >= 2) {
        let arrays = val.splice(0, val.length - 1)
        arrays.forEach(row => {
          this.$refs.taskTable.toggleRowSelection(row)
        })
      }

      if(val.length > 0) {
        this.selectTask(val[val.length - 1])
      }
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
    checkUploadConditions () {
      return this.currentTaskData && this.currentTaskData.id
    },
    refreshSubTasks() {
      this.getSubTaskList(this.currentTaskData.id)
    },
    getOrderList () {
      this.orderDialog = true
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
        let subTaskList = res.data.list
        subTaskList.forEach(subTask => {
          let uncheckEmps = [], checkedEmps = []
          subTask.emps.forEach(emp => {
            if(emp.checkStatus === '1') {
              uncheckEmps.push(emp)
            } else if(emp.checkStatus === '2') {
              checkedEmps.push(emp)
            }
          })

          subTask.uncheckEmps = uncheckEmps
          subTask.checkedEmps = checkedEmps
        })
 
        this.subTaskList = subTaskList
      })
    },
    selectSubTask (row) {
      // this.selectedSubTaskId = row.id
    },
    openAssignEmpsDialog () {
      if(this.selectedSubTaskIds.length !== 1) {
        this.$message({ type: 'error', message: '指派员工时只能选择一个任务' })
        return
      }
      this.assignEmpDialog = true
    },
    assignEmpList (selectedEmps) {
      let empIds = [], empNames = []

      for(let emp of selectedEmps) {
        empIds.push(emp.userId)
        empNames.push(emp.nickname)
      }

      assignEmpList({
        empIds: empIds.join(','),
        empNames: empNames.join(','),
        tsid: this.selectedSubTaskIds[0]
      }).then(resp => {
        if (resp.code !== 1) {
          this.$message({ type: 'error', message: resp.msg })
          return
        }

        this.getSubTaskList(this.currentTaskData.id)
        this.$message({ type: 'success', message: '指派成功' })
        this.assignEmpDialog = false
      }, error => {
        this.$message({ type: 'error', message: '指派操作失败' })
      })
    },
    handlerEmpSelectDialogClose () {
      this.assignEmpDialog = false
    },
    handlerOrderDetailDialogClose () {
      this.orderDialog = false
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

// 控制上传按钮跟其他按钮不同一行处理
.inline-block {
  display: inline-block;
}
</style>
