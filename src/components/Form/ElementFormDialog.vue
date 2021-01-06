<!-- 基于element-form组件二次封装+弹出框dialog -->
<template>
  <div class="elementFormDialogBox">
    <el-dialog
      v-elDragDialog
      :visible.sync="form.dialogOpen"
      :top="form.top||'15vh'"
      :width="form.width||'500px'"
      :title="form.type==='add'?'新增':'编辑'"
      :close-on-click-modal="form.closeOnClickModel||false"
      @close="close"
      @open="open"
    >
      <slot name="formTop" :data="{data:form}" />

      <el-form
        :ref="form.ref||'form'"
        :model="form.data"
        :label-width="form.labelWidth||'100px'"
        :rules="form.rules"
        :inline="form.inline||false"
        :size="form.size||'mini'"
        :label-position="form.labelPosition||'right'"
      >
        <div v-for="(item,index) in form.items" :key="index">
          <el-form-item v-if="!item.editHide" :label="item.label" :prop="item.prop">
            <span v-if="item.slot">
              <slot :name="item.slot" :data="item" />
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
                :rows="item.rows||2"
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
                :rows="item.rows||2"
              />
            </span>

            <span v-else>
              <el-input
                v-model="form.data[item.prop]"
                :placeholder="item.placeholder||`请输入 ${item.label}`"
                @input="forceUpdate($event)"
              />
            </span>
          </el-form-item>
        </div>
      </el-form>

      <slot name="formBottom" :data="{data:form}" />

      <span slot="footer" class="dialog-footer">
        <el-button @click="form.dialogOpen = false">取 消</el-button>
        <el-button type="primary" @click="submitForm(form.ref||'form')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'loadsh'

export default {
  props: {
    // form: 参数
    form: {
      type: Object,
      default: () => {
        return {
          dialogOpen: false, // 打开弹出框
          data: {}, // 编辑的数据
          ref: 'form', // 组件id
          closeOnClickModel: false, // 弹出框: 能否点击空白地方关闭
          top: '15vh', // 弹出框: 距离顶部的高度
          width: '500px', // 弹出框: 总宽度
          labelWidth: '100px', // 表单: 左侧label: 宽度
          labelPosition: 'right', // 表单: 左侧label: 文字位置
          size: 'nimi', // 表单: 尺寸
          inline: false, // 表单: 是否行内排列
          PermissionEdit: '', // 权限: 编辑e
          FunctionSave: '', // 方法: 新增（当新增、修改同一接口使用）
          FunctionBeforeSave: data => {
            return data
          }, // 方法: 新增前对数据进行处理
          FunctionUpdate: '', // 方法: 修改（当新增、修改不是是同一接口时使用）
          FunctionBeforeUpdat: data => {
            return data
          }, // 方法: 修改前对数据进行处理
          type: 'edit', // 新增\编辑的类型: add edit
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
              slotNameplaceholder: '请选择 某一项',
              slot: ''
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
    return {}
  },
  computed: {},
  watch: {},

  mounted () {},

  methods: {
    forceUpdate () {
      this.$forceUpdate()
    },

    close () {
      this.$emit('close')
    },

    open () {
      const formName = this.form.ref || 'form'
      if (this.$refs[formName]) {
        this.$refs[formName].resetFields()
      }
      this.$emit('close')
    },
    // 确定提交
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) return;
        (async () => {
          let data = _.cloneDeep(this.form.data)
          delete data.createTime
          delete data.updateTime

          const {
            FunctionSave,
            FunctionUpdate,
            FunctionBeforeSave,
            FunctionBeforeUpdate,
            type
          } = this.form
          let result
          // 新增\编辑
          if (type === 'edit' && FunctionUpdate) {
            if (FunctionBeforeUpdate) {
              data = FunctionBeforeUpdate(data)
            }
            result = await FunctionUpdate(data)
          } else {
            if (FunctionBeforeSave) {
              data = FunctionBeforeSave(data)
            }
            result = await FunctionSave(data)
          }

          this.form.dialogOpen = false
          this.$emit('handleSaveSuccess', result)
          // this.$message({ message: '操作成功!', type: 'success' })
        })()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
