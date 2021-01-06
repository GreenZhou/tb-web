<!-- 数据字典管理 -->
<template>
  <div class="sys-dictionary">
    <el-row>
      <!-- 左：字典类型 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>字典类型</span>
          </div>
          <div class="dictionary-type">
            <!-- 查询参数 -->
            <el-form ref="queryParam" :model="queryParam" :inline="true">
              <el-form-item label="类型编码/名称：" prop="nameSearch">
                <el-input v-model="queryParam.nameSearch" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="getDataDicList">查询</el-button>
                <el-button icon="el-icon-refresh" @click="handleReset('queryParam', false)">重置</el-button>
              </el-form-item>
            </el-form>
            <!-- 操作按钮 -->
            <div class="operation-group">
              <el-button type="primary" icon="el-icon-plus" @click="addDicType(false)">新增</el-button>
              <el-button type="danger" icon="el-icon-delete" @click="deleteDicType(false)">删除</el-button>
            </div>
            <!-- 字典类型列表 -->
            <el-table
              v-loading="dictionaryListLoading"
              ref="dictionaryTable"
              :data="dictionaryListData"
              highlight-current-row
              row-class-name="pointer"
              border
              @row-click="handleDicTypeClick"
              @selection-change="handleSelectionChange($event, false)"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="code" label="类型编码" />
              <el-table-column prop="name" label="类型名称" />
              <el-table-column prop="remark" label="备注" />
              <el-table-column label="操作" fixed="right" align="center" min-width="80px">
                <template slot-scope="scope">
                  <el-button type="text" @click.stop="editDicType(scope.row, false)">修改</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>

      <!-- 右：字典子项 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <span>字典子项</span>
          </div>
          <div class="dictionary-children">
            <!-- 查询参数 -->
            <el-form ref="childrenQueryParam" :model="childrenQueryParam" :inline="true">
              <el-form-item label="类型编码/名称：" prop="nameSearch">
                <el-input v-model="childrenQueryParam.nameSearch" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="getChildDataDicList">查询</el-button>
                <el-button icon="el-icon-refresh" @click="handleReset('childrenQueryParam', true)">重置</el-button>
              </el-form-item>
            </el-form>
            <!-- 操作按钮 -->
            <div class="operation-group">
              <el-button type="primary" icon="el-icon-plus" @click="addDicType(true)">新增</el-button>
              <el-button type="danger" icon="el-icon-delete" @click="deleteDicType(true)">删除</el-button>
            </div>
            <!-- 字典类型列表 -->
            <el-table
              v-loading="cDictionaryListLoading"
              ref="cDictionaryTable"
              :data="cDictionaryListData"
              highlight-current-row
              border
              @selection-change="handleSelectionChange($event, true)"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="code" label="类型编码" />
              <el-table-column prop="name" label="类型名称" />
              <el-table-column prop="status" label="是否启用" align="center">
                <template slot-scope="{row}">
                  <el-tooltip :content="row.status ?'启用':'禁用'" placement="right">
                    <el-switch
                      v-model="row.status"
                      :active-value="1"
                      :inactive-value="0"
                      @change="handleChangeStatus(row)"
                    />
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" />
              <el-table-column label="操作" fixed="right" align="center" min-width="80px">
                <template slot-scope="scope">
                  <el-button type="text" @click="editDicType(scope.row, true)">修改</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 弹出框 -->
    <dictionary-form
      :visible.sync="dialogVisible"
      :type="dialogType"
      :is-child="isChild"
      :parent-id="currentDataId"
      :form="dialogFormData"
      @ok="handleSuccess"
    />
  </div>
</template>

<script>
import { getDataDic, updateDicType, removeDicType } from '@/api/system/dictionary'
import { isSelectValidate } from '@/utils/tableValidateUtils'
import DictionaryForm from './dictionaryForm'

export default {
  name: 'SettingDictionary',
  components: {
    DictionaryForm
  },
  data () {
    return {
      // 左：字典类型
      dictionaryListLoading: false,
      queryParam: {
        nameSearch: ''
      },
      dictionaryListData: [], // 字典类型列表数据
      multipleSelection: [], // 字典类型表格中被CheckBox选中的数据
      currentDataId: null, // 被选中的数据字典项（父）ID，初始化时默认选中第一项

      // 右：字典子项
      cDictionaryListLoading: false, // 字典子项列表loading标识
      childrenQueryParam: {
        nameSearch: ''
      },
      cDictionaryListData: [], // 字典子项列表数据
      chdMultipleSelection: [], // 字典子项表格中被CheckBox选中的数据

      // 弹出框（新增、修改，字典类型、字典子项）
      dialogVisible: false,
      isChild: false, // 区分字典类型、字典子项
      dialogType: 'add', // 区分新增、修改
      dialogFormData: {}
    }
  },
  watch: {
    currentDataId () {
      this.getChildDataDicList()
    }
  },
  created () {
    this.getDataDicList()
  },
  methods: {
    /**
     * 获取（父）字典数据列表
     */
    async getDataDicList () {
      // 查询（父）字典数据列表
      this.dictionaryListLoading = true
      const queryParams = {
        parentId: 0, // 参数为0时，获取父字典列表
        code: this.queryParam.nameSearch
      }
      const { data } = await getDataDic(queryParams)
      this.dictionaryListData = data.list
      this.dictionaryListLoading = false

      // 设置（父）字典数据列表的默认选中
      const row = data.list[0]
      if (row) {
        this.currentDataId = row.dictId
        this.$nextTick(() => {
          this.$refs.dictionaryTable.setCurrentRow(row)
        })
      } else {
        // 获取（父）字典数据列表为空时，将“被选中的数据字典项（父）ID”置空
        this.currentDataId = null
      }
    },

    /**
     * 获取子字典数据列表
     */
    async getChildDataDicList () {
      // 没有任何父项被选中时，子字典项列表为空
      if (!this.currentDataId) {
        this.cDictionaryListData = []
        return
      }
      // 查询子字典数据列表
      this.cDictTableLoading = true
      const queryParams = {
        parentId: this.currentDataId,
        code: this.childrenQueryParam.nameSearch
      }
      const { data } = await getDataDic(queryParams)
      this.cDictionaryListData = data.list
      this.cDictTableLoading = false
    },

    /**
     * add，父子共用
     * @param isChild 标识是否为字典子项
     */
    addDicType (isChild) {
      // 新增字典子项前，先验证是否有父项被选中
      if (isChild && this.currentDataId === null) {
        this.$message({ type: 'warning', message: '请先选择父层字典' })
        return
      }
      // 打开新增面板
      this.dialogType = 'add'
      this.isChild = isChild
      this.dialogFormData = {
        status: 1 // 新增字典子项时，设置状态为默认选中
      }
      this.dialogVisible = true
    },

    /**
     * edit，父子共用
     * @param row 选中行数据
     * @param isChild 标识是否为字典子项
     */
    editDicType (row, isChild) {
      this.dialogType = 'edit'
      this.isChild = isChild
      this.dialogFormData = { ...row }
      this.dialogVisible = true
    },

    /**
     * 新增、修改后，刷新对应列表
     * @param isChild 标识是否为字典子项
     */
    handleSuccess (isChild) {
      isChild ? this.getChildDataDicList() : this.getDataDicList()
    },

    /**
     * 删除
     * @param isChild 标识是否为字典子项
     */
    deleteDicType (isChild) {
      const multipleSelection = isChild ? this.chdMultipleSelection : this.multipleSelection
      const validata = isSelectValidate(multipleSelection)
      if (validata) {
        const ids = []
        multipleSelection.forEach(item => {
          ids.push(item.dictId)
        })
        const queryParam = {
          dictId: ids.toString()
        }
        const loading = this.$loading({ text: '删除中...' })
        removeDicType(queryParam).then(() => {
          this.$message({ message: '删除成功', type: 'success' })
          this.getDataDicList()
        })
        loading.close()
      }
    },

    /**
     * 多选框change事件处理
     * @param selection
     * @param isChild 标识是否为字典子项
     */
    handleSelectionChange (selection, isChild) {
      if (isChild) {
        this.chdMultipleSelection = selection
      } else {
        this.multipleSelection = selection
      }
    },

    /**
     * 字典类型：点击父字典数据项，切换对应的字典子项
     * @row 点击时选中行的数据
     */
    handleDicTypeClick (row) {
      this.currentDataId = row.dictId
    },

    /**
     * 字典子项：修改“是否启用”的状态
     * @param row 选中行
     */
    handleChangeStatus (row) {
      updateDicType(row)
    },

    /**
     * 查询条件重置
     * @formName form重置目标的ref
     * @isChild 标识是否为字典子项
     */
    handleReset (formName, isChild) {
      this.$refs[formName].resetFields()
      isChild ? this.getChildDataDicList() : this.getDataDicList()
    }
  }
}
</script>

<style lang='scss' scoped>
.sys-dictionary {
  padding: 20px;
  height: 100%;

  .operation-group {
    margin-bottom: 8px;
  }

  .el-row,
  .el-col,
  .el-card {
    height: 100%;
  }

  .is-always-shadow {
    box-shadow: none;
  }

  ::v-deep .el-card__header {
    font-weight: 500;
    font-size: 16px;
    background-color: #fafafa;
  }
}
</style>
