<!-- userName+修改密码/退出 -->
<template>
  <div class="userName">
    <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
      <div class="avatar-wrapper">
        <span class="user-name">{{ name }}</span>
        <i class="el-icon-caret-bottom" />
      </div>
      <el-dropdown-menu slot="dropdown">
        <router-link to="/">
          <el-dropdown-item>首页</el-dropdown-item>
        </router-link>
        <span @click="form.dialogOpen = true">
          <el-dropdown-item>修改密码</el-dropdown-item>
        </span>
        <el-dropdown-item divided>
          <span @click="logout">退出登录</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <!-- 弹出框: 修改密码   -->
    <el-dialog
      v-elDragDialog
      title="修改密码"
      :visible.sync="form.dialogOpen"
      width="500px"
      append-to-body
    >
      <el-form
        :ref="form.ref"
        :model="form.data"
        :rules="form.rules"
        label-width="100px"
        size="mini"
        status-icon
      >
        <el-form-item label="账号">
          <span>{{ name }}</span>
        </el-form-item>
        <el-form-item label="原密码" prop="password">
          <el-input v-model.trim="form.data.oldPsw" :type="form.eye.oldPsw?'text':'password'">
            <svg-icon
              slot="suffix"
              class="pointer"
              :icon-class="form.eye.oldPsw?'eye-open':'eye'"
              @click="$set($data.form.eye, 'oldPsw', !form.eye.oldPsw)"
            />
          </el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model.trim="form.data.newPsw" :type="form.eye.newPsw?'text':'password'">
            <svg-icon
              slot="suffix"
              class="pointer"
              :icon-class="form.eye.newPsw?'eye-open':'eye'"
              @click="$set($data.form.eye, 'newPsw', !form.eye.newPsw)"
            />
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input v-model.trim="form.data.checkPass" :type="form.eye.checkPass?'text':'password'">
            <svg-icon
              slot="suffix"
              class="pointer"
              :icon-class="form.eye.checkPass?'eye-open':'eye'"
              @click="$set($data.form.eye, 'checkPass', !form.eye.checkPass)"
            />
          </el-input>
        </el-form-item>
        <div style="text-align:center;color:#A9A9A9;padding-bottom:10px">
          <i class="el-icon-info" style="margin-left:10px" />
          <span>密码长度不小于8位，密码为字母、数字、和符号中任意两种组合</span>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm(form.ref)">提交</el-button>
        <el-button @click="resetForm(form.ref)">重置</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/** **************** 密码加密 ******************/
import md5 from 'js-md5'

import _ from 'loadsh'
import { mapGetters } from 'vuex'
import { changeUserPwd } from '@/api/system/user'

export default {
  data () {
    return {
      // 参数: form
      form: {
        ref: 'form',
        dialogOpen: false, // 打开弹出框
        eye: {}, // 隐藏密码
        data: {
          oldPsw: '',
          newPsw: '',
          checkPass: ''
        }, // 编辑的数据
        defaultData: {}, // 默认空数据 (新增时使用)
        rules: {
          oldPsw: [
            {
              required: true,
              message: '请输入原密码',
              trigger: ['blur', 'change']
            },
            {
              min: 3,
              max: 20,
              message: '长度在 3 到 20 个字之间',
              trigger: 'blur'
            }
          ],
          newPsw: [
            {
              required: true,
              validator: (rule, value, callback) => {
                const reg = /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)])+$)^.{8,16}$/
                if (value === '') {
                  callback(new Error('请输入密码'))
                } else if (value.length < 8 || value.length > 16) {
                  callback(new Error('长度在 8 到 16 个字之间'))
                } else if (!reg.test(value)) {
                  callback(new Error('密码格式有误'))
                } else {
                  if (this.form.data.checkPass !== '') {
                    this.$refs.form.validateField('checkPass')
                  }
                  callback()
                }
              },
              trigger: ['blur', 'change']
            }
          ],
          checkPass: [
            {
              required: true,
              validator: (rule, value, callback) => {
                if (value === '') {
                  callback(new Error('请再次输入密码'))
                } else if (value !== this.form.data.newPsw) {
                  callback(new Error('两次输入密码不一致!'))
                } else {
                  callback()
                }
              },
              trigger: ['blur', 'change']
            },
            {
              min: 3,
              max: 20,
              message: '长度在 3 到 20 个字之间',
              trigger: 'blur'
            }
          ]
        }
      }
    }
  },
  computed: {
    ...mapGetters(['name', 'avatar'])
  },

  methods: {
    // 修改密码
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) return;
        (async () => {
          const data = _.cloneDeep(this.form.data)

          /** **************** 密码加密 ******************/
          data.oldPsw = md5(data.oldPsw)
          data.newPsw = md5(data.newPsw)

          delete data.checkPass
          const { code, msg } = await changeUserPwd(data)
          if (code !== 1) return this.$message.error(msg)

          this.form.dialogOpen = false
          this.$message({ message: '密码修改成功!', type: 'success' })
        })()
      })
    },
    // 表单重置
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    // 退出登录
    async logout () {
      await this.$store.dispatch('user/logout')
      // this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      // window.location = 'http://127.0.0.1:8080/cas/login'
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar-container {
  margin-right: 30px;
  color: #fff;
  font-size: 18px;
  &:hover {
    color: #007bff;
  }
  .avatar-wrapper {
    position: relative;
    .user-name {
      white-space: nowrap;
    }
    .el-icon-caret-bottom {
      cursor: pointer;
      position: absolute;
      right: -20px;
      top: 50%;
      margin-top: -6px;
    }
  }
}
</style>
