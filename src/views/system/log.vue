<!-- 系统日志 -->
<template>
  <div class="sys-log">
    <!-- search：搜索条件 -->
    <el-form ref="queryParam" :model="queryParam" :inline="true">
      <el-form-item label="用户名称：" prop="username">
        <el-input v-model="queryParam.username" />
      </el-form-item>
      <el-form-item label="IP地址：" prop="ip">
        <el-input v-model="queryParam.ip" />
      </el-form-item>
      <el-form-item label="操作名称：" prop="operation">
        <el-input v-model="queryParam.operation" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset('queryParam')">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- table: 日志列表 -->
    <el-table v-loading="logListLoading" :data="logListData" border>
      <el-table-column type="index" />
      <el-table-column prop="username" label="用户名称" min-width="100px" />
      <el-table-column prop="ip" label="IP地址" min-width="100px" />
      <el-table-column prop="operation" label="操作名称" min-width="100px" />
      <el-table-column prop="method" label="请求方法" show-overflow-tooltip min-width="150px" />
      <el-table-column prop="params" label="请求参数" show-overflow-tooltip min-width="150px" />
      <el-table-column prop="result" label="操作结果" align="center" min-width="80px">
        <template #default="{ row }">
          <el-tag v-if="row.result === 1" type="success">成功</el-tag>
          <el-tag v-else type="danger">失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createDate" label="创建时间" min-width="100px" />
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParam.pageNum"
      :limit.sync="queryParam.pageSize"
      @pagination="loadData"
    />
  </div>
</template>

<script>
import { getLogs } from '@/api/system/log'
import Pagination from '@/components//Pagination'

export default {
  name: 'SettingLog',
  components: { Pagination },
  data () {
    return {
      queryParam: {
        // 查询参数
        username: '',
        ip: '',
        operation: '',
        // 分页参数
        pageNum: 1,
        pageSize: 10
      },

      // 日志列表信息
      total: 0,
      logListLoading: false,
      logListData: []
    }
  },
  created () {
    this.loadData()
  },
  methods: {
    // 加载日志列表数据
    async loadData () {
      this.logListLoading = true
      const { data } = await getLogs(this.queryParam)
      this.total = data.total
      this.logListData = data.list
      this.logListLoading = false
    },
    // 查询
    handleQuery () {
      this.queryParam.pageNum = 1
      this.loadData()
    },
    // 重置
    handleReset (formName) {
      this.$refs[formName].resetFields()
      this.queryParam.pageNum = 1
      this.loadData()
    }
  }
}
</script>

<style lang='scss' scoped>
.sys-log {
  padding: 20px;
}
</style>
