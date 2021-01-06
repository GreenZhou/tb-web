<!-- 基于element-form组件二次封装+横行排列+双击修改 -->
<template>
  <div
    :class="form.colNumber===3?'elementFormHorizontalBox colNumber':'elementFormHorizontalBox'"
    @dblclick="isEdit=true"
  >
    <el-form
      :ref="form.ref||'form'"
      :model="form.data"
      label-width="30%"
      :rules="form.rules"
      :hide-required-asterisk="!isEdit"
      :show-message="isEdit"
      :disabled="!isEdit"
      :inline="true"
      :label-position="form.labelPosition||'left'"
    >
      <el-form-item
        v-for="(item,index) in form.items"
        :key="index"
        :label="item.label"
        :prop="item.prop"
      >
        <span v-if="item.solt">
          <slot :name="item.solt" :data="item" />
        </span>

        <span v-else-if="item.type==='number'">
          <el-input-number
            v-model="form.data[item.prop]"
            :placeholder="item.placeholder||`请输入 ${item.label}`"
            :min="item.min"
            :max="item.max"
            :precision="item.precision"
            :controls="false"
            class="w100"
          />
        </span>

        <span v-else-if="item.type==='date'">
          <el-date-picker
            v-model="form.data[item.prop]"
            :placeholder="item.placeholder||`请选择 ${item.label}`"
            value-format="yyyy-MM-dd"
            type="date"
          />
        </span>

        <span v-else-if="item.type==='datetime'">
          <el-date-picker
            v-model="form.data[item.prop]"
            :placeholder="item.placeholder||`请选择 ${item.label}`"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </span>

        <span v-else-if="item.type==='year'">
          <el-date-picker
            v-model="form.data[item.prop]"
            :placeholder="item.placeholder||`请选择 ${item.label}`"
            value-format="yyyy"
            type="year"
          />
        </span>

        <span v-else-if="item.type==='textarea'">
          <el-input
            v-model="form.data[item.prop]"
            :placeholder="item.placeholder||`请输入 ${item.label}`"
            type="textarea"
            :rows="item.rows||1"
          />
        </span>

        <span v-else-if="item.type==='select'">
          <el-select
            v-model="form.data[item.prop]"
            clearable
            filterable
            :placeholder="item.placeholder||`请选择 ${item.label}`"
            class="w100"
          >
            <el-option
              v-for="ele in item.list"
              :key="ele[item.id||'id']"
              :label="ele[item.name||'name']"
              :value="item.isString?ele[item.id||'id'].toString():ele[item.id||'id']"
            />
          </el-select>
        </span>

        <span v-else-if="item.type==='textarea'">
          <el-input
            v-model="form.data[item.prop]"
            :placeholder="item.placeholder||`请输入 ${item.label}`"
            type="textarea"
            :rows="item.rows||1"
          />
        </span>

        <span v-else>
          <el-input
            v-model="form.data[item.prop]"
            :placeholder="item.placeholder||`请输入 ${item.label}`"
          />
        </span>
      </el-form-item>
    </el-form>

    <div
      v-if="(form.PermissionEdit?checkPermission(form.PermissionEdit):true)&&isEdit"
      class="formBtn fr"
    >
      <el-button type="success" @click="submitForm(form.ref||'form')">确定</el-button>
      <el-button @click="cancelForm()">取消</el-button>
    </div>
  </div>
</template>

<script>
import _ from 'loadsh'

export default {
  props: {
    // form 参数
    form: {
      type: Object,
      default: () => {
        return {
          ref: 'form', // 组件id
          data: {}, // 编辑的数据
          PermissionEdit: '', // 权限: 编辑
          FunctionSave: '', // 方法: 保存表单
          FunctionBeforeSave: data => {
            return data
          }, // 方法: 保存表单前对数据进行处理
          colNumber: 3, // 列数: 一行有几列，默认为2列且只有2、3列
          labelPosition: 'left', // label文字位置
          defaultData: { name: '' }, // 默认空数据 (新增时使用)
          items: [
            { prop: 'name', label: '名称', placeholder: '请输入 名称' },
            {
              prop: 'textarea',
              label: '文本域',
              placeholder: '请输入 文本域',
              type: 'textarea',
              rows: 2
            },
            {
              prop: 'num',
              label: '数量',
              placeholder: '请输入 数量',
              type: 'number',
              precision: 3,
              min: 0,
              max: 99
            },
            {
              prop: 'date',
              label: '日期',
              placeholder: '请选择 日期',
              type: 'date'
            },
            {
              prop: 'year',
              label: '年份',
              placeholder: '请选择 年份',
              type: 'year'
            },

            // 使用插槽: 选择器、树形选择器、其他特殊
            {
              prop: 'select',
              label: '选择器',
              placeholder: '请选择 某一项',
              slot: 'soltName'
            }
          ],
          rules: {
            name: [
              {
                required: true,
                message: '名称 不能为空',
                trigger: ['blur', 'change']
              }
            ]
          }
        }
      }
    }
  },

  data () {
    return {
      defaultEditData: {}, // 默认的数据
      isEdit: false // 编辑中
    }
  },
  computed: {},
  watch: {},

  mounted () {
    this.defaultEditData = _.cloneDeep(this.form.data)
  },

  methods: {
    // 确定提交
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) return
        this.$confirm('确定修改该数据！', '修改', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(
          async () => {
            let data = _.cloneDeep(this.form.data)
            delete data.createTime
            delete data.updateTime

            // 表单提交前
            if (this.form.FunctionBeforeSave) {
              data = this.form.FunctionBeforeSave(data)
            }

            const { code } = await this.form.FunctionSave(data)
            if (code !== 1) {
              this.$message.error('数据出错，请重试一遍！')
              return
            }

            this.defaultEditData = _.cloneDeep(this.form.data)
            this.isEdit = false
            this.$emit('handleSaveSuccess')
            this.$message({ message: '操作成功!', type: 'success' })
          },
          () => {
            return false
          }
        )
      })
    },
    // 取消提交
    cancelForm () {
      this.form.data = _.cloneDeep(this.defaultEditData)
      this.isEdit = false
    }
  }
}
</script>
<style lang="scss" scoped>
.elementFormHorizontalBox {
  padding: 20px 0 30px 0;
  .formBtn {
    margin: -12px 12px 0 0;
  }
}

.elementFormHorizontalBox /deep/ .el-form-item {
  width: 48%;
  padding: 0 20px;
}
.colNumber /deep/ .el-form-item {
  width: 32%;
  padding: 0 20px;
}

.elementFormHorizontalBox /deep/ .el-form-item--medium .el-form-item__content {
  width: 60% !important;
}

.elementFormHorizontalBox /deep/.el-form-item--medium .el-form-item__label {
  padding: 6px 0;
  line-height: 20px;
}
.elementFormHorizontalBox /deep/.el-input--medium .el-input__inner {
  min-height: 36px;
}

.elementFormHorizontalBox /deep/ .el-input.is-disabled .el-input__inner {
  cursor: pointer;
}
.elementFormHorizontalBox /deep/ .el-textarea.is-disabled .el-textarea__inner {
  cursor: pointer;
}
</style>
