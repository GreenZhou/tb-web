<!-- 数据字典管理弹出框（新增、修改；字典类型、字典子项） -->
<template>
  <div class="dictionary-form">
    <el-dialog
      :title="type === 'add' ? '新增' : '修改'"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <el-form
        ref="form"
        :model="formData"
        :rules="rules"
        label-width="auto"
        label-position="right"
      >
        <el-form-item label="类型编码" prop="code">
          <el-input v-model="formData.code" />
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item v-if="isChild" label="是否启用" prop="status">
          <el-tooltip :content="formData.status?'启用':'禁用'" placement="right">
            <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button :loading="loading" type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addDicType, updateDicType } from '@/api/system/dictionary'

export default {
  name: 'DictionaryForm',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 父、子共用同一弹出框，通过isChild标识区分
    isChild: {
      type: Boolean,
      default: false
    },
    parentId: {
      type: Number,
      default: 0
    },
    // add：新增；edit：修改
    type: {
      type: String,
      default: 'add'
    },
    form: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      loading: false,
      rules: {
        code: [
          { required: true, message: '类型编码 不能为空', trigger: 'blur' },
          { max: 20, message: '长度在 1 到 20 个字符之间', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '类型名称 不能为空', trigger: 'blur' },
          { max: 20, message: '长度在 1 到 20 个字符之间', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogVisible: {
      get () {
        return this.visible
      },
      set (val) {
        this.$emit('update:visible', val)
      }
    },
    formData () {
      return this.form
    }
  },
  watch: {
    visible (newValue) {
      // 关闭dialog时，去除表单验证
      if (newValue === false) {
        this.$refs.form.clearValidate()
      }
    }
  },
  methods: {
    handleConfirm () {
      // 验证表单
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.loading = true
          this.formData.parentId = this.isChild ? this.parentId : 0
          this.type === 'add'
            ? await addDicType(this.formData)
            : await updateDicType(this.formData)
          this.loading = false
          this.$emit('ok', this.isChild)
          this.dialogVisible = false
        }
      })
    }
  }
}
</script>
