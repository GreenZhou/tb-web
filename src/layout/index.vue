<template>
  <div :class="classObj" class="app-wrapper">
    <!-- 头部：logo+名称 -->
    <base-header />
    <!-- 侧边栏 -->
    <sidebar ref="sidebarBox" class="sidebar-container" />
    <div class="main-container">
      <!-- 导航 -->
      <div class="tags-view">
        <tags-view />
      </div>
      <!-- 主要内容 -->
      <app-main />
      <!-- 右侧设置 -->
      <right-panel v-if="showSettings">
        <settings />
      </right-panel>
    </div>
    <!-- 返回顶部:可自定义按钮的样式、show/hide临界点、返回的位置 -->
    <!-- <el-tooltip placement="top" content="回到顶部">
      <back-to-top :custom-style="myBackToTopStyle" :visibility-height="500" :back-position="0" transition-name="fade" />
    </el-tooltip>-->
    <!-- 底部：公司/备案号 -->
    <!-- <base-footer ref="footerBox" /> -->
  </div>
</template>

<script>
import { mapState } from 'vuex'
import {
  AppMain,
  Settings,
  Sidebar,
  TagsView,
  RightPanel,
  BaseHeader
} from './components'

export default {
  name: 'Layout',

  components: {
    AppMain,
    RightPanel,
    Settings,
    Sidebar,
    TagsView,
    BaseHeader
  },
  // data() {
  //   return {
  //     myBackToTopStyle: {
  //       right: '0px',
  //       bottom: '40px',
  //       width: '40px',
  //       height: '40px',
  //       'border-radius': '4px',
  //       'line-height': '45px', // 请保持与高度一致以垂直居中
  //       background: '#e7eaf1' // 按钮的背景颜色
  //     }
  //   }
  // },
  mounted () {},
  computed: {
    ...mapState({
      sidebar: state => state.app.sidebar,
      showSettings: state => state.settings.showSettings
    }),
    classObj () {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
@import "~@/styles/variables.scss";

.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;

  // 主体区域 Main container
  .main-container {
    height: calc(100% - #{$headerHeight});
    transition: margin-left 0.28s;
    margin-left: $sideBarWidth;
    position: relative;

    .tags-view {
      height: $tagsViewHeight;
    }
  }
}
</style>
