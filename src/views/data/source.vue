<!-- 系统日志 -->
<template>
  <div class="container">
    <el-container>
      <el-main>
        <!-- table -->
        <elementTable ref="table" :table="table" @handleAddEdit="editDataSource">
          <template slot="handleBtnRightTop">
            <el-button size="small" type="primary" @click="checkNetwork">测试连接</el-button>
          </template>

          <template slot="status" slot-scope="scope">
            <span v-if="scope.row.status === -1" class="red">失败</span>
            <span v-else-if="scope.row.status === 1" class="green">成功</span>
            <span v-else>待测试</span>
          </template>
        </elementTable>
        <!-- form -->
        <ElementFormDialog :form="form" @handleSaveSuccess="handleSaveSuccess" />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import _ from 'loadsh'
import {
  addDataSource,
  checkNetwork,
  deleteDataSource,
  getDataSource,
  updateDataSource
} from '@/api/data/source'
import ElementTable from '@/components/Table/ElementTable'
import ElementFormDialog from '@/components/Form/ElementFormDialog'

export default {
  name: 'DataSource',
  components: { ElementTable, ElementFormDialog },

  data () {
    return {
      // table: 参数
      table: {
        data: [],
        checkBox: true, // 是否使用checkBox
        PermissionAllDelete: false,
        FunctionGetList: getDataSource,
        FunctionDelete: deleteDataSource,
        columns: [
          { prop: 'name', label: '数据源名称', width: '' },
          { prop: 'type', label: '数据库类型', width: '' },
          { prop: 'IP', label: 'Ip地址', width: '' },
          { prop: 'port', label: '端口', width: '' },
          { prop: 'DBName', label: '数据库名称', width: '' },
          { prop: 'username', label: '用户名', width: '' },
          { prop: 'status', label: '连接状态', width: '', slot: 'status' }
        ]
      },

      form: {
        data: {},
        dialogOpen: false,
        FunctionSave: addDataSource,
        FunctionUpdate: updateDataSource,
        defaultData: {},
        items: [
          { prop: 'name', label: '数据源名称' },
          { prop: 'type', label: '数据库类型' },
          { prop: 'IP', label: 'IP地址' },
          { prop: 'port', label: '端口' },
          { prop: 'DBName', label: '数据库名称' },
          { prop: 'username', label: '用户名' }
        ],
        rules: {
          name: [
            {
              required: true,
              message: '数据源名称不能为空',
              trigger: 'change'
            },
            { max: 20, message: '长度在 1 到 20 个字之间', trigger: 'blur' }
          ],
          type: [
            {
              required: true,
              message: '数据库类型不能为空',
              trigger: 'change'
            },
            { max: 20, message: '长度在 1 到 20 个字之间', trigger: 'blur' }
          ],
          IP: [
            { required: true, message: 'IP地址不能为空', trigger: 'change' },
            { max: 20, message: '长度在 1 到 20 个字之间', trigger: 'blur' }
          ],
          port: [
            { required: true, message: 'IP地址不能为空', trigger: 'change' },
            { max: 20, message: '长度在 1 到 20 个字之间', trigger: 'blur' }
          ],
          DBName: [
            {
              required: true,
              message: '数据库名称不能为空',
              trigger: 'change'
            },
            { max: 20, message: '长度在 1 到 20 个字之间', trigger: 'blur' }
          ],
          username: [
            { required: true, message: '用户名不能为空', trigger: 'change' },
            { max: 20, message: '长度在 1 到 20 个字之间', trigger: 'blur' }
          ]
        }
      },

      downloadLoading: false // 导出Excel状态
    }
  },
  methods: {
    // 检查连接情况
    checkNetwork () {
      const multiData = this.$refs.table.$data.tableSelection

      if (multiData.length === 0) {
        this.$message({ type: 'warning', message: '请选择一条数据!' })
      } else {
        const ids = []
        multiData.forEach(item => {
          ids.push(item.id)
        })
        // todo 测试连接
        checkNetwork(ids).then(res => {
          if (res.code === 0) {
            const linkIds = res.data.list
            this.$refs.table.$data.tableSelection.map(item => {
              if (linkIds.includes(item.id)) {
                item.status = 1
              } else {
                item.status = -1
              }
            })
          }
        })
      }
    },

    // 编辑/新增数据源
    editDataSource (data) {
      this.form.type = data ? 'edit' : 'add'
      this.form.dialogOpen = true
      this.form.data = data
        ? _.cloneDeep(data)
        : _.cloneDeep(this.form.defaultData)
    },

    // 导出Execl: 获取列表
    handleDownload () {
      this.downloadLoading = true
      // const params = {
      //   key: this.nameSearch,
      //   limit: 999,
      //   page: 1,
      //   sidx: this.sort || '',
      //   order: this.order || ''
      // }
      // getLogs(params).then(res => {
      //   const { code, data } = res
      //   if (code !== 0) {
      //     this.downloadLoading = false
      //     this.$message.error('系统日志数据出错，请重试一遍！')
      //     return
      //   }
      //   this.downloadExcel(data.list)
      // })
    },

    // 导出Execl: 开始导出
    downloadExcel (list) {
      if (!list.length) {
        this.downloadLoading = false
        this.$message({
          type: 'warning',
          message: '列表为空数据时不能导出',
          showClose: true
        })
        return
      }

      this.downloadLoading = true
      // 表头
      const header = [
        '日志Id',
        '用户名',
        '用户操作',
        '执行时长（ms）',
        'Ip地址',
        '创建时间',
        '请求方法',
        '请求参数'
      ]
      // 表头对应的参数名
      const filterVal = [
        'id',
        'username',
        'operation',
        'time',
        'ip',
        'createDate',
        'method',
        'params'
      ]
      // 更改表格内容
      const data = list.map(v =>
        filterVal.map(j => {
          if (j === 'msg') {
            const msg = '修改参数'
            return msg
          } else {
            return v[j]
          }
        })
      )
      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel({
          header,
          data,
          filename: '系统日志', // 文件名
          autoWidth: true,
          bookType: 'xlsx'
        })

        this.$message({
          message: '导出成功',
          type: 'success',
          showClose: true
        })
        this.downloadLoading = false
      })
    },

    handleSaveSuccess () {}
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

.header {
  border-bottom: 1px dashed #eef0f2;
  padding: 16px;

  .headLeft {
    font-weight: 700;
    font-size: 20px;
    line-height: 36px;
  }
}

.tablePageLeft {
  margin-top: 10px;
  height: 30px;
  line-height: 30px;
  font-size: 14px;

  span {
    font-weight: 700;
  }
}
</style>
