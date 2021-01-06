<!-- 基于element-table组件二次封装 -->
<template>
  <div class="container">
    <div class="tableElement">
      <!-- table—header：总条、数分页 -->
      <div class="tableHeader">
        <div class="tableHeaderLeft">
          <!--          共 <span>{{ total }}</span> 条&nbsp;&nbsp;&nbsp;-->
          <slot name="handleBtnLeftTop" :data="{selection:tableSelection,all:table.data}" />
          <el-button
            v-if="table.PermissionAdd?checkPermission(table.PermissionAdd):true"
            type="primary"
            size="small"
            @click="$emit('handleAddEdit')"
          >{{ table.BtnNameAdd|| '新增' }}</el-button>
          <el-button
            v-if="table.PermissionEdit?checkPermission(table.PermissionEdit):true"
            type="success"
            size="small"
            @click="handleEdit"
          >{{ table.BtnNameEdit|| '修改' }}</el-button>
          <el-button
            v-if="table.PermissionDelete?checkPermission(table.PermissionDelete):true"
            type="danger"
            size="small"
            @click="handleDelete"
          >{{ table.BtnNameDelete|| '删除' }}</el-button>
          <slot name="handleBtnRightTop" :data="{selection:tableSelection,all:table.data}" />
        </div>

        <!--        <div v-if="total>0" class="tableHeaderRight">-->
        <!--          <el-button-->
        <!--            :disabled="currentPage===1?true:false"-->
        <!--            size="mini"-->
        <!--            icon="el-icon-arrow-left"-->
        <!--            @click="currentPage -= 1;pageChange?'':getList()"-->
        <!--          />-->
        <!--          <span><em>{{ currentPage }}</em>/{{ Math.ceil(total/pageSize) }} </span>-->
        <!--          <el-button-->
        <!--            :disabled="currentPage===Math.ceil(total/pageSize)?true:false"-->
        <!--            size="mini"-->
        <!--            icon="el-icon-arrow-right"-->
        <!--            @click="currentPage += 1;pageChange?'':getList()"-->
        <!--          />-->
        <!--        </div>-->
      </div>

      <!-- table：列表 -->
      <el-table
        v-loading="table.loading"
        :ref="table.ref||'table'"
        :data="table.data"
        :header-cell-style="{background:table.headerColor||'#f9f9f9'}"
        border
        stripe
        highlight-current-row
        @sort-change="sortChange"
        @selection-change="tableSelection=$event"
        @row-dblclick="rowDblclick"
        @row-click="rowClick"
      >
        <el-table-column
          v-if="table.checkBox===undefined?true:table.checkBox"
          type="selection"
          width="55"
          align="center"
        />

        <!-- 一级表头 -->
        <el-table-column
          v-for="(item,index) in table.columns"
          :key="index"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :min-width="item.minWidth"
          :sortable="item.sortable||false"
          :fixed="item.fixed||false"
          :show-overflow-tooltip="item.showOverflowTooltip||false"
          :align="item.algin||'center'"
        >
          <template v-slot="scope">
            <span v-if="item.slot">
              <slot :name="item.slot" :row="scope.row" />
            </span>
            <span v-else>{{ scope.row[item.prop] }}</span>
          </template>

          <!-- 二级表头 -->
          <el-table-column
            v-for="(item2,index2) in item.columns"
            :key="index2"
            :prop="item2.prop"
            :label="item2.label"
            :width="item2.width"
            :min-width="item2.minWidth"
            :sortable="item2.sortable||false"
            :fixed="item2.fixed||false"
            :show-overflow-tooltip="item2.showOverflowTooltip||false"
            :align="item2.algin||'center'"
          >
            <template v-slot="scope">
              <span v-if="item2.slot">
                <slot :name="item2.slot" :row="scope.row" />
              </span>
              <span v-else>{{ scope.row[item2.prop] }}</span>
            </template>

            <!-- 三级表头 -->
            <el-table-column
              v-for="(item3,index3) in item2.columns"
              :key="index3"
              :prop="item3.prop"
              :label="item3.label"
              :width="item3.width"
              :min-width="item3.minWidth"
              :sortable="item3.sortable||false"
              :fixed="item3.fixed||false"
              :show-overflow-tooltip="item3.showOverflowTooltip||false"
              :align="item3.algin||'center'"
            >
              <template v-slot="scope">
                <span v-if="item3.slot">
                  <slot :name="item3.slot" :row="scope.row" />
                </span>
                <span v-else>{{ scope.row[item3.prop] }}</span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table-column>
      </el-table>

      <!-- table-footer：分页+全选+操作 -->
      <div v-if="total>0" class="tableFooter">
        <div v-if="table.PermissionAllDelete" class="fl">
          <el-checkbox
            v-if="table.checkBox===undefined?true:table.checkBox"
            v-model="tableCheckAllBtn"
            class="tableCheckAll"
            @change="tableCheckAllChange"
          />
          <slot name="handleBtnLeftBottom" :data="{selection:tableSelection,all:table.data}" />
          <el-button
            v-if="table.PermissionDelete?checkPermission(table.PermissionDelete):true"
            :disabled="tableSelection.length?false:true"
            plain
            @click="handleDelete"
          >批量删除</el-button>
          <slot name="handleBtnRightBottom" :data="{selection:tableSelection,all:table.data}" />
        </div>
        <pagination
          :page-sizes="[5, 10, 15, 20]"
          :total="total"
          :limit="pageSize"
          :page="currentPage"
          :auto-scroll="true"
          @pagination="pagination"
        />
        <!--        <el-pagination-->
        <!--          class="fr"-->
        <!--          layout="total, sizes,prev, pager, next,jumper"-->
        <!--          background-->
        <!--          :total="total"-->
        <!--          :page-size="pageSize"-->
        <!--          :current-page="currentPage"-->
        <!--          @size-change="pageSize=$event;initGetList()"-->
        <!--          @current-change="currentPage=$event;pageChange?'':getList()"-->
        <!--        />-->
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '../Pagination'
export default {
  components: { Pagination },
  props: {
    table: {
      type: Object,
      default: () => {
        return {
          data: [], // table数据
          ref: 'table', // 组件id
          loading: true, // 组件loading
          checkBox: true, // 是否使用checkBox
          PermissionAdd: '', // 权限: 新增
          PermissionEdit: '', // 权限: 编辑
          PermissionDelete: '', // 权限: 删除
          PermissionAllDelete: '', // 权限：批量删除
          BtnNameAdd: '发起检查', // 按钮名称: 新增
          BtnNameEdit: '编 辑', // 按钮名称: 修改
          BtnNameDelete: '删 除', // 按钮名称: 删除
          FunctionGetList: '', // 方法: 获取列表
          FunctionDelete: '', // 方法: 删除
          FunctionNoDelete: data => {
            const msg = '禁止删除'
            return msg
          }, // 验证是否能删除，返回提示string
          KeyDelete: '', // 关键词：删除
          FunctionBeforeDelete: data => {
            return data
          }, // 修改参数: 删除之前
          queryParams: {}, // 参数
          responseHandler: res => {
            // 返回数据进行处理
            const data = {}
            // 总数:total
            data.total = res.count
            // 列表:list
            data.list = res.data
            return data
          },
          columns: [
            {
              // 表头单元
              prop: '', // key
              label: '', // 名称
              width: '', // 固定长度
              minWidth: '', // 最小长度
              sortable: '', // 排序
              fixed: '', // 固定
              showOverflowTooltip: '', // 单行显示
              slot: '' // 插槽名
            }
          ],
          headerColor: '' // 表头颜色
        }
      }
    }
  },

  data () {
    return {
      sort: '', // table: 排序类型
      order: '', // table: 排序方式（正序/倒序）
      tableSelection: [], // table: 被选择的所有项
      total: 0, // 分页: 总条数
      currentPage: 1, // 分页：当前页
      pageSize: 10, // 分页：每页条数
      pageChange: false // 分页：当当前页改变时（防止重复查询）
    }
  },
  computed: {
    // table:选择全部按钮状态
    tableCheckAllBtn: {
      get: function () {
        if (this.tableSelection.length === this.table.data.length) return true
        return false
      },
      set: function () {}
    }
  },
  watch: {},

  mounted () {
    this.initGetList()
  },

  methods: {
    pagination (data) {
      this.pageSize = data.limit
      this.currentPage = data.page
      this.getList()
    },

    // 获取列表
    getList () {
      const { FunctionGetList, queryParams } = this.table
      const parm = Object.assign(
        {
          pageSize: this.pageSize,
          pageNum: this.currentPage,
          sidx: this.sort || '',
          order: this.order || ''
        },
        queryParams
      )
      FunctionGetList(parm).then(res => {
        const { data, code } = res
        if (code !== 1) {
          return this.$message.error('获取数据出错，请重试一遍！')
        }

        if (this.table.responseHandler) {
          const d = this.table.responseHandler(data)
          this.total = d.total
          this.table.data = d.list
        } else {
          this.total = data.totalCount
          this.table.data = data.list
        }
        this.pageChange = false
      })
    },
    // 获取列表：初始化查询参数
    initGetList () {
      this.currentPage = 1
      this.pageChange = true
      this.getList()
    },
    // 修改
    handleEdit () {
      const selection = this.tableSelection
      if (!selection.length || selection.length > 1) {
        this.$message({
          message: '请其中选择一条记录进行修改！',
          type: 'warning',
          showClose: true
        })
        return
      }
      this.$emit('handleAddEdit', selection[0])
    },
    // 删除
    handleDelete () {
      const KeyDelete = this.table.KeyDelete
      let key = 'ids'
      let value = 'id'

      if (typeof KeyDelete === 'object') {
        key = this.table.KeyDelete.key || 'ids'
        value = this.table.KeyDelete.value || 'id'
      }

      const ids = []
      this.tableSelection.forEach(ele => {
        ids.push(ele[value])
      })
      // 禁止删除
      if (this.table.FunctionNoDelete) {
        const message = this.table.FunctionNoDelete(this.tableSelection)
        if (message) {
          return this.$message({ message, type: 'warning', showClose: true })
        }
      }

      if (!ids.length) {
        return this.$message({
          message: '请选择至少一条数据进行删除！',
          type: 'warning',
          showClose: true
        })
      }

      this.$confirm(
        '“删除数据”将永久删除，且无法撤销！',
        `确定要删除这${ids.length}条数据吗？`,
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(
        async () => {
          // 删除之前
          let params = { [key]: JSON.stringify(ids) }
          // let params = { [key]: ids }

          if (this.table.FunctionBeforeDelete) {
            params = this.table.FunctionBeforeDelete(params)
          }

          await this.table.FunctionDelete(params)

          ids.forEach(ele => {
            this.table.data.splice(
              this.table.data.findIndex(item => {
                return item[value] === ele
              }),
              1
            )
          })
          this.total -= ids.length
          this.$message({
            message: '删除成功!',
            type: 'success',
            showClose: true
          })
        },
        () => {
          return false
        }
      )
    },
    // table: 某一行被单击击时
    rowClick (row) {
      this.$refs[this.table.ref || 'table'].toggleRowSelection(row, true)
    },
    // table: 某一行被双击时
    rowDblclick (row) {
      this.$refs[this.table.ref || 'table'].clearSelection()
      this.$refs[this.table.ref || 'table'].toggleRowSelection(row, true)
    },
    // table：全选（尾部）
    tableCheckAllChange () {
      if (this.tableCheckAllBtn) {
        this.$refs[this.table.ref || 'table'].clearSelection()
        this.tableSelection = []
        return
      }
      this.table.data.forEach(item => {
        this.$refs[this.table.ref || 'table'].toggleRowSelection(item, true)
      })
      this.tableSelection = this.table.data
    },
    // table: 排序方式改变时
    sortChange (data) {
      this.sort = data.prop || ''
      if (this.sort === 'updateTime') {
        this.sort = 'update_time'
      } else if (this.sort === 'createTime') {
        this.sort = 'create_time'
      }
      if (data.order === 'ascending') {
        this.order = 'asc'
      } else if (data.order === 'descending') {
        this.order = 'desc'
      } else {
        this.order = ''
      }
      this.initGetList()
    }
  }
}
</script>
<style lang="scss" scoped>
.tableElement {
  padding: 16px 0px;
  //tableHeader：table头部信息/分页样式
  .tableHeader {
    display: flex;
    justify-content: space-between;
    line-height: 30px;
    margin-bottom: 4px;
    font-size: 14px;

    span {
      font-weight: 700;
    }

    .tableHeaderRight {
      color: #999;

      em {
        color: #0095ff;
        font-style: normal;
      }

      button {
        padding-left: 6px;
        padding-right: 6px;
      }
    }
  }

  //table-footer：table底部按钮/分页样式
  .tableFooter {
    height: 52px;

    .fl,
    .fr {
      padding-top: 16px;
    }

    .tableCheckAll {
      width: 55px;
      text-align: center;
      padding-right: 0;
    }
  }
}
</style>
