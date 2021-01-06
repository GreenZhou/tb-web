<template>
  <div class="app-container">
    <el-container :style="{padding:'20px'}">
      <!-- 任务列表 -->
      <el-aside width="64%" class="aside">
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
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="checkBuyers(scope.row)"
                v-permission="{function:['CHECK_BUYER']}"
              >确认上传</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-aside>
      
      <!-- 买家管理 -->
      <el-main :style="{padding:'0 20px'}">
        <el-row :gutter="14" class="btnList" :style=" {marginBottom: '4px' }">
          <el-col :span="24">
           <el-upload
              class="upload-demo inline-block"
              :show-file-list="false"
              :auto-upload="true"
              :action="uploadBuyerUrl"
              :with-credentials="true"
              :on-success="getEmpSubTaskList"
              :before-upload="checkUploadConditions"
              v-permission="{function:['IMPORT_BUYER_LIST']}"
            >
              <el-button size="mini" type="primary" icon="el-icon-top">批量导入</el-button>
            </el-upload>
            <el-button
              size="mini"
              :style="{'margin-left': '10px'}"
              type="primary"
              icon="el-icon-bottom"
              @click="downloadBuyerExcel()"
              v-permission="{function:['DOWNLOAD_BUYER_EXCEL']}"
            >下载模板</el-button>
          </el-col>
        </el-row>
        <el-table
          v-loading="buyerTableLoading"
          ref="buyerTable"
          :data="buyerList"
          style="width: 100%"
          row-class-name="pointer"
          highlight-current-row
          border
        >
          <el-table-column type="index" width="65"  label="序号" />
          <el-table-column prop="buyerWWName" label="旺旺" />
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
  getBuyerList,
  checkBuyers,
} from '@/api/tb/subTask'

export default {
  name: 'OrderAllocate',
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
      buyerTableLoading: false,
      buyerList: [],

    }
  },
  computed: {
    uploadBuyerUrl () {
      if(this.currentSubTask) {
        return process.env.VUE_APP_BASE_API_PRO + '/tb/subTask/importBuyers/' +  this.currentSubTask.id
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
            this.getBuyerList(this.subTaskList[0].id)
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
    getBuyerList (tsid) {
      this.buyerTableLoading = true

      getBuyerList({
        tsid,
        pageSize: this.page.pageSize,
        pageNum: this.page.currentPage
      }).then(res => {
        this.buyerList = res.data.list
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
