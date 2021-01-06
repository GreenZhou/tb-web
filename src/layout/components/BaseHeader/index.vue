<!-- footer-页面底部 -->
<template>
  <div class="header">
    <svg-icon icon-class="international" />
    <span>{{ title }}</span>
    <!-- 头部右侧：登录信息/退出/搜索/字体大小/ -->
    <navbar />
  </div>
</template>

<script>
import Navbar from '@/layout/components/Navbar'
const defaultSettings = require('@/settings.js')

export default {
  name: 'BaseHeader',
  components: {
    Navbar
  },
  data () {
    return {
      title: defaultSettings.title
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.header {
  background: #304156;
  font-size: 24px;
  line-height: $headerHeight;
  color: #ffffff;
  padding: 0 0 0 20px;
}
</style>
