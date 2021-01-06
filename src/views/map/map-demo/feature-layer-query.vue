<!-- featureLayerQuery -->
<template>
  <div class="feature-layer-query">
    <el-select v-model="ditieName" placeholder="地铁站名" @change="selectHandler">
      <el-option v-for="item in uniqueDitieNames" :key="item" :label="item" :value="item" />
    </el-select>
  </div>
</template>

<script>
import _ from 'lodash'
import { loadArcgisModules } from '@/utils/mapUtils'

export default {
  name: 'FeatureLayerQuery',
  data () {
    return {
      ditieName: '',
      uniqueDitieNames: [],
      ditiePointLayer: {},
      highlight: undefined
    }
  },
  mounted () {
    loadArcgisModules([]).then(() => {
      this.ditiePointLayer = this.$view.map.findLayerById('ditiePoint')
      this.getUniqueDitieNames()
    })
  },
  methods: {
    getUniqueDitieNames () {
      const query = this.ditiePointLayer.createQuery()
      this.ditiePointLayer.queryFeatures(query).then(results => {
        const features = results.features
        const ditieNames =
          features && features.map(feature => feature.attributes.NAME)
        this.uniqueDitieNames = _.uniq(ditieNames)
      })
    },
    selectHandler () {
      // this.ditiePointLayer.definitionExpression = `NAME = '${this.ditieName}'`
      if (!this.ditiePointLayer.visible) {
        this.ditiePointLayer.visible = true
      }

      this.$view.whenLayerView(this.ditiePointLayer).then(layerView => {
        const query = this.ditiePointLayer.createQuery()
        query.where = `NAME = '${this.ditieName}'`
        this.ditiePointLayer.queryFeatures(query).then(results => {
          const feature = results.features[0]
          // 高亮
          if (this.highlight) {
            this.highlight.remove()
          }
          this.highlight = layerView.highlight(feature)
          // 定位并弹框
          this.$view.goTo(feature).then(() => {
            this.$view.popup.open({
              features: results.features,
              featureMenuOpen: true,
              updateLocationEnabled: true
            })
          })
        })
      })
    }
  }
}
</script>

<style lang='scss' scoped>
</style>
