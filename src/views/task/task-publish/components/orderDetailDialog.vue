<template>
  <el-dialog title="全部订单" :visible.sync="orderDialog" customClass="customWidth" :before-close="handleClose">
    <el-table
      v-loading="orderTableLoading"
      :data="orders"
      style="width: 100%"
      highlight-current-row
      border
    >
      <el-table-column type="index" label="序号" />
      <el-table-column prop="subTaskName" label="班次" />
      <el-table-column prop="salerName" label="店铺名称" width="200" />
      <el-table-column prop="keywd" label="关键字"  width="200" />
      <el-table-column prop="demand" label="任务要求"  width="500" />
      <el-table-column prop="price" label="商品单价" />
      <el-table-column prop="num" label="商品数量" />
      <el-table-column prop="tprice" label="商品总价" />
    </el-table>
    <pagination
      :page-sizes="[10, 15, 20]"
      :total="page.total"
      :limit="page.pageSize"
      :page="page.currentPage"
      :auto-scroll="true"
      @pagination="authPagination"
    />
  </el-dialog>
  
</template>
<script>
import { getOrderList } from '@/api/tb/order'
import Pagination from '@/components/Pagination'

export default {
  name: 'orderDetailDialog',
  data() {
    return {
      orders: [],
      page: {
        total: 0,
        pageSize: 10,
        currentPage: 1
      },
      orderTableLoading: false,
      selectEmps: []
    }
  },
  components: { Pagination },
  methods: {
    authPagination (data) {
      this.page.pageSize = data.limit
      this.page.currentPage = data.page
      this.getOrderList()
    },
    getOrderList () {
      this.orderTableLoading = true

      getOrderList({
        taskId: this.taskId,
        tsids: this.subTaskIds.join(','),
        pageSize: this.page.pageSize,
        pageNum: this.page.currentPage
      }).then(resp => {
        if(resp.code !== 1) {
           this.$message({ type: 'error', message: res.msg })
          return
        }
        this.orderTableLoading = false
        this.orders = resp.data.list
        this.page.total = resp.data.total
        this.page.pageSize = resp.data.pageSize
        this.page.currentPage = resp.data.pageNum
      }, error => {
        this.$message({ type: 'error', message: '获取员工列表失败' })
        this.orderTableLoading = false
      })
    },
    handleClose () {
      this.$emit('handlerOrderDetailDialogClose')
    },

  },
  props: ['orderDialog', 'taskId', 'subTaskIds'],
  created () {
    this.getOrderList()
  },

}
</script>

<style>
  .customWidth {
    width: 80%;
  }
</style>