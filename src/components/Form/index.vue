<!-- 基于element-from组件二次封装 -->
<template>
  <div class="elementFromBox" @dblclick="isEdit=true">
    <el-form
      :ref="from.ref"
      :model="editData"
      label-width="100px"
      :rules="from.rules"
      :hide-required-asterisk="!isEdit"
      :show-message="isEdit"
      :disabled="!isEdit"
      :label-position="from.labelPosition||'left'"
    >
      <el-form-item
        v-for="(item,index) in from.items"
        :key="index"
        :label="item.label"
        :prop="item.prop"
      >
        <span v-if="item.type==='number'">
          <el-input-number
            v-model="editData[item.prop]"
            :placeholder="item.placeholder||`请输入 ${item.label}`"
            :precision="item.precision"
            :controls="false"
            class="w100"
          />
        </span>

        <span v-else-if="item.type==='data'">
          <el-date-picker
            v-model="editData[item.prop]"
            :placeholder="item.placeholder||`请选择 ${item.label}`"
            value-format="yyyy-MM-dd"
            type="date"
          />
        </span>

        <span v-else-if="item.type==='textarea'">
          <el-input
            v-model="editData[item.prop]"
            :placeholder="item.placeholder||`请输入 ${item.label}`"
            type="textarea"
            :rows="item.rows||1"
          />
        </span>

        <span v-else-if="item.type==='select'">
          <el-select
            v-model="editData[item.prop]"
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

        <span v-else>
          <el-input
            v-model="editData[item.prop]"
            :placeholder="item.placeholder||`请输入 ${item.label}`"
          />
        </span>
      </el-form-item>
    </el-form>

    <div v-if="isEdit" class="fromBtn fr">
      <el-button type="success" @click="submitForm(from.ref)">确定</el-button>
      <el-button @click="cancelForm()">取消</el-button>
    </div>
  </div>
</template>

<script>
import _ from 'loadsh'

export default {
  props: {
    from: {
      type: Object,
      default: () => {
        return {
          data: {
            id: 0,
            name: '名称',
            num: 99.12345,
            data: '2019-12-18',
            textarea: '备注',
            select: '1'
          }, // 原始的数据
          ref: 'from', // 组件id
          PermissionEdit: '', // 权限: 编辑
          FunctionSave: '', // 方法: 保存表单
          FunctionBeforeSave: '', // 方法: 保存表单前对数据进行处理
          labelPosition: 'left', // label文字位置
          items: [
            { prop: 'name', label: '名称', placeholder: '请输入 名称' },
            {
              prop: 'num',
              label: '数量',
              placeholder: '请输入 数量',
              type: 'number',
              precision: 0
            },
            {
              prop: 'date',
              label: '日期',
              placeholder: '请选择 日期',
              type: 'date',
              precision: 0
            },
            {
              prop: 'select',
              label: '选择器',
              placeholder: '请选择 某一项',
              type: 'select',
              id: 'ids',
              name: 'names',
              isString: true,
              list: [
                { ids: 0, names: '第一项' },
                { ids: 1, names: '第二项' },
                { ids: 2, names: '第三项' }
              ]
            },
            {
              prop: 'textarea',
              label: '文本域',
              placeholder: '请输入 文本域',
              type: 'textarea',
              rows: 2
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
      editData: {}, // 编辑的数据
      defaultEditData: {}, // 默认的数据
      isEdit: false // 编辑
    }
  },
  computed: {},
  watch: {},

  mounted () {
    this.editData = _.cloneDeep(this.from.data)
    this.defaultEditData = _.cloneDeep(this.from.data)
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
            const data = this.editData

            delete data.createTime
            delete data.updateTime

            const { code } = await this.table.FunctionSave(data)
            if (code !== 1) {
              this.$message.error('数据出错，请重试一遍！')
              return
            }

            this.defaultEditData = _.cloneDeep(this.editData)
            this.isEdit = true
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
      this.editData = _.cloneDeep(this.defaultEditData)
      this.isEdit = false
    }
  }
}
</script>
<style lang="scss" scoped>
.elementFromBox {
  padding: 20px 0 30px 0;
  background: rgba($color: #eeeeee, $alpha: 0.3);
  .fromBtn {
    margin: -12px 12px 0 0;
  }
}
</style>
