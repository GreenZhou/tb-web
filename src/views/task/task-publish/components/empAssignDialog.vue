<template>
  <el-dialog title="选择员工" :visible.sync="assignEmpDialog" :before-close="handleClose">
    <el-table
      v-loading="empAssignTableLoading"
      ref="multipleFuncTable"
      :data="emps"
      style="width: 100%"
      highlight-current-row
      border
      @select="selectEmp"
      @select-all="selectAllEmps"
      @selection-change="handleEmpSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="username" label="登录名" />
      <el-table-column prop="nickname" label="用户名" />
      <el-table-column prop="mobile" label="用户名" />
    </el-table>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="assignEmpList">保存</el-button>
    </div>
  </el-dialog>
  
</template>
<script>
import { getEmpList } from '@/api/tb/subTask'

export default {
  name: 'EmpAssignDialog',
  data() {
    return {
      emps: [],
      empAssignTableLoading: false,
      selectEmps: []
    }
  },
  methods: {
    handleClose () {
      // 
      this.$emit('handlerEmpSelectDialogClose')
    },
    selectEmp (row) {

    },
    selectAllEmps (rows) {

    },
    handleEmpSelectionChange (rows) {
      this.selectEmps = rows
    },
    assignEmpList () {
      this.$emit('assignEmpList', this.selectEmps)
    }
  },
  props: ['assignEmpDialog'],
  created () {
      this.empAssignTableLoading = true

      getEmpList().then(resp => {
        if(resp.code !== 1) {
           this.$message({ type: 'error', message: res.msg })
          return
        }
        this.empAssignTableLoading = false
        this.emps = resp.data.list
      }, error => {
        this.$message({ type: 'error', message: '获取员工列表失败' })
        this.empAssignTableLoading = false
      })
  },

}
</script>