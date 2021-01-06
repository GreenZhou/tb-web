<!-- footer-页面底部 -->
<template>
  <div class="footer">
    <span>
      Copyright 2019
      <a
        href="http://www.augurit.com/"
        style="color: #007bff;"
        onmouseleave="this.style.color='#007bff'"
        onmouseover="this.style.color='#0056b3'"
        target="_blank"
      >广州奥格智能科技有限公司</a>
      All RightReserved.
    </span>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span>
      备案号：
      <a
        href="http://www.miitbeian.gov.cn"
        style="color: #aeaeae;"
        onmouseleave="this.style.color='#aeaeae'"
        onmouseover="this.style.color='#0056b3'"
        target="_blank"
      >粤ICP备05029094号</a>
    </span>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span>公安备案号：44010602003627号</span>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.footer {
  text-align: center;
  position: relative;
  background: #304156;
  background-size: 100% 100%;
  font-size: 14px;
  line-height: 42px;
  color: #ffffff;
  z-index: -1;
}
</style>
