<template>
  <div class="navbar">
    <div class="right-menu">
      <template>
        <search id="header-search" class="right-menu-item hover-effect" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

        <base-user-name class="right-menu-item hover-effect" />
      </template>
    </div>
  </div>
</template>

<script>
import Screenfull from './components/Screenfull'
import SizeSelect from './components/SizeSelect'
import Search from './components/HeaderSearch'
import BaseUserName from './components/BaseUserName'

export default {
  components: {
    Screenfull,
    SizeSelect,
    Search,
    BaseUserName
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  float: right;

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      // height: 100%;
      // line-height: 84px;
      font-size: 18px;
      color: #fff;
      vertical-align: middle;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          color: #007bff;
        }
      }
    }
  }
}
</style>
