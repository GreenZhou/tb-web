<!-- 3D地图示例 -->
<template>
  <div class="map-3d">
    <div
      id="map"
      class="map"
      v-loading="loading"
      element-loading-text="地图初始化..."
      element-loading-spinner="el-icon-loading"
    />
  </div>
</template>

<script>
// import Vue from 'vue'
import { loadArcgisModules } from '@/utils/mapUtils'

export default {
  name: 'Map3D',
  data () {
    return {
      loading: true
    }
  },
  mounted: function () {
    // 地图初始化
    loadArcgisModules(['esri/WebScene', 'esri/views/SceneView']).then(() => {
      this.initMap()
      this.loading = false
    })
  },
  methods: {
    initMap () {
      const map = new this.$esri.WebScene({
        portalItem: {
          id: '8ede93ea9d8d48bc8cdcbea775936a13'
        }
      })

      const view = new this.$esri.SceneView({
        container: 'map',
        map: map
      })
      // Vue.prototype.$view = view

      view.ui.components = []
    }
  }
}
</script>

<style lang='scss' scoped>
@import "~@/styles/variables.scss";

.map-3d {
  position: relative;
  height: 100%;

  .map {
    height: 100%;
  }
}
</style>
