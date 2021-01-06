<template>
  <div class="app-container">
    <el-container :style="{padding:'20px'}">
      <!-- 任务列表 -->
      <el-aside width="40%" class="aside">
        <el-row :gutter="14" class="btnList" :style="{marginBottom:'4px'}">
          <el-col :span="24">
            <el-button
              size="mini"
              type="primary"
              @click="checkOrders()"
              v-permission="{function:['SUB_TASK_ORDER_CHECK']}"
            >订单核查</el-button>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-check"
              @click="qrCheckOrders()"
              v-permission="{function:['SUB_TASK_ORDER_CHECK_QR']}"
            >核查确认</el-button>
            <el-button
              size="mini"
              type="primary"
              @click="updateZip()"
              v-permission="{function:['SUB_TASK_ZIP_UPDATE']}"
            >更新压缩包</el-button>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-bottom"
              @click="downloadZip()"
              v-permission="{function:['SUB_TASK_ZIP_DOWNLOAD']}"
            >下载压缩包</el-button>
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
          @current-change="handleCurrentChange"
        >
          <el-table-column type="index" width="65" label="序号" />
          <el-table-column prop="subTaskName" label="任务名称" />
          <el-table-column prop="orderNum" label="订单数量" />
          <el-table-column prop="buyerNeedNum" label="需要买家" />
          <el-table-column prop="buyerNum" label="已有买家" />
          <el-table-column prop="uploadedBuyerNum" label="已传买家" />
        </el-table>
      </el-aside>
      
      <!-- 订单管理 -->
      <el-main :style="{padding:'0 20px'}">
        <el-row :gutter="14" class="btnList" :style=" {marginBottom: '4px' }">
          <el-col :span="24">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-bottom"
              @click="downloadOriginOrderBuyerExcel()"
              v-permission="{function:['DOWNLOAD_ORIGIN_ORDER_BUYER']}"
            >下载原始核查数据</el-button>
            <el-upload
              class="upload-demo inline-block"
              :show-file-list="false"
              :auto-upload="true"
              :action="uploadOrderBuyerUrl"
              :with-credentials="true"
              :on-success="getEmpSubTaskList"
              :before-upload="checkUploadConditions"
              v-permission="{function:['IMPORT_ORDER_BUYER']}"
            >
              <el-button size="mini" type="primary" icon="el-icon-top">导入核查数据</el-button>
            </el-upload>
            <el-button
              size="mini"
              :style="{'margin-left': '10px'}"
              type="primary"
              @click="downloadBuyerExcel()"
              v-permission="{function:['ORDER_BUYER_CHECK']}"
            >订单核查</el-button>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-check"
              @click="downloadBuyerExcel()"
              v-permission="{function:['ORDER_BUYER_CHECK_QR']}"
            >确认核查</el-button>
          </el-col>
        </el-row>
        <el-table
          v-loading="orderBuyerTableLoading"
          ref="orderBuyerTable"
          :data="orderBuyerList"
          style="width: 100%"
          row-class-name="pointer"
          highlight-current-row
          border
        >
          <el-table-column type="index" width="65" label="序号" />
          <el-table-column prop="buyerWWName" label="旺旺名称" />
          <el-table-column prop="checkedOrderBuyerNum" label="已查订单" />
          <el-table-column prop="uncheckedOrderBuyerNum" label="待查订单" />
          <el-table-column prop="yxOrderBuyerNum" label="应下订单" />
          <el-table-column prop="tprice" label="应付合计" />
          <el-table-column prop="xdOrderBuyerNum" label="实付订单" />
          <el-table-column prop="tpriceSj" label="实付合计" />
          <el-table-column prop="byj" label="单笔佣金" />
          <el-table-column label="佣金合计">
            <template slot-scope="scope">
              {{ scope.row.byj * scope.row.xdOrderBuyerNum }}
            </template>
          </el-table-column>
          <el-table-column label="合计">
            <template slot-scope="scope">
              {{ (scope.row.byj * scope.row.xdOrderBuyerNum) + tpriceSj }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <pagination
          :page-sizes="[10, 15, 20]"
          :total="page.total"
          :limit="page.pageSize"
          :page="page.currentPage"
          :auto-scroll="true"
          @pagination="buyerPagination"
        />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import _ from 'loadsh'
import permission from '@/directive/permission' // 权限判断指令
import Pagination from '@/components/Pagination'

import {
  listEmpSubTasks,
  checkBuyers,
} from '@/api/tb/subTask'

import {
  getOrderBuyerList,
} from '@/api/tb/order'

export default {
  name: 'OrderCheck',
  directives: { permission },
  components: { Pagination },
  data () {
    return {
      subTaskTableLoading: false,
      subTaskList: [],
      currentSubTask: {},
      page: {
        total: 0,
        pageSize: 10,
        currentPage: 1
      },
      orderBuyerTableLoading: false,
      orderBuyerList: [],

    }
  },
  computed: {
    uploadOrderBuyerUrl () {
      if(this.currentSubTask) {
        return process.env.VUE_APP_BASE_API_PRO + '/tb/order/importOrderBuyers/' +  this.currentSubTask.id
      }
      
      return 'error'
    }
  },
  watch: {
    
  },

  created () {
    this.getEmpSubTaskList()
  },
  methods: {
    handleCurrentChange (row) {
      this.currentSubTask = row
    },
    getEmpSubTaskList () {
      this.subTaskTableLoading = true
      let res = listEmpSubTasks().then(res => {
        this.subTaskTableLoading = false

        if (res.code != 1) {
          this.$message({ type: 'error', message: res.msg })
        }
        
        this.subTaskList = res.data.list

        // 选中第一行并执行查询买家列表操作
        if (this.subTaskList.length > 0) {
          this.$nextTick(() => {
            this.$refs.subTaskTable.setCurrentRow(this.subTaskList[0])
            this.getOrderBuyerList(this.subTaskList[0].id)
          })
        } else {
          this.buyerList = []
        }
      }, err => {
        this.subTaskTableLoading = false
        this.$message({ type: 'error', message: '获取列表失败' })
      })
    },
    buyerPagination (data) {
      this.page.pageSize = data.limit
      this.page.currentPage = data.page
      this.getBuyerList(this.currentSubTask.id)
    },
    getOrderBuyerList (tsid) {
      this.buyerTableLoading = true

      getOrderBuyerList({
        tsid,
        pageSize: this.page.pageSize,
        pageNum: this.page.currentPage
      }).then(res => {
        this.orderBuyerList = res.data.list
        this.page.total = res.data.total
        this.page.pageSize = res.data.pageSize
        this.page.currentPage = res.data.pageNum
        this.buyerTableLoading = false
      }, error => {
        this.buyerTableLoading = false
      })
    },
    checkUploadConditions () {
      return this.currentSubTask && this.currentSubTask.id
    },
    downloadOriginOrderBuyerExcel () {
      // 下载原始订单核查表
      window.open(process.env.VUE_APP_BASE_API_PRO + '/tb/order/generateOrderBuyerExcel/' + this.currentSubTask.id)
    },
    importOrderBuyers () {
      // 导入订单核查表

    },
    downloadBuyerExcel () {
      console.log('下载买家列表...')
    },
    checkBuyers () {
      if (this.currentSubTask.uploadedBuyerNum <  this.currentSubTask.buyerNeedNum) {
        this.$message({ type: 'error', message: '上传买家数不能小于需要买家数'})
        return
      }

      checkBuyers({
        tsid: this.currentSubTask.id
      }).then(resp => {
        if (resp.code != 1) {
          this.$message({ type: 'error', message: resp.msg })
          return
        }
        this.$message({ type: 'success', message: '确认买家操作成功' })
      }, err => {
        this.$message({ type: 'error', message: '确认买家操作失败' })
      })
    },
    // 订单核查
    checkOrders () {

    },
    // 订单核查确认
    qrCheckOrders () {

    },
    // 更新压缩包 
    updateZip () {

    },
    // 下载压缩包
    downloadBuyerExcel () {

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
