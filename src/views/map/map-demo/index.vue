<!-- map-demo -->
<template>
  <div class="map-demo">
    <!-- 地图容器 -->
    <div
      id="map"
      v-loading="loading"
      class="map"
      element-loading-text="地图初始化..."
      element-loading-spinner="el-icon-loading"
    />
    <!-- 操作面板 -->
    <div id="operationPanel">
      <FeatureLayerQuery v-if="layerQueryVisible" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { loadArcgisModules, commonPointSymbol } from '@/utils/mapUtils'
import FeatureLayerQuery from './feature-layer-query'

export default {
  name: 'MapDemo',
  data () {
    return {
      loading: true,
      layerQueryVisible: false,
      featureTable: {}
    }
  },
  components: {
    FeatureLayerQuery
  },
  mounted: function () {
    loadArcgisModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/WebTileLayer',
      'esri/layers/TileLayer',
      'esri/layers/MapImageLayer',
      'esri/layers/FeatureLayer',
      'esri/Graphic',
      'esri/Basemap',
      'esri/widgets/Home',
      'esri/widgets/CoordinateConversion',
      'esri/widgets/Expand',
      'esri/widgets/Fullscreen',
      'esri/widgets/LayerList',
      'esri/tasks/Locator',
      'esri/widgets/BasemapToggle',
      'esri/widgets/Legend'
    ]).then(() => {
      this.initMap()
      // this.initTDTMap()
      this.addLayer()
      this.addOperationPanel()
      this.addArcgisWidget()
      // this.addViewEvent()
      // this.heatmapRenderer()
      this.loading = false
      this.clientSideFeatureLayer()
    })
  },
  methods: {
    initMap () {
      // 广州底图
      const basemap = new this.$esri.Basemap({
        baseLayers: [
          new this.$esri.TileLayer({
            url:
              'http://localhost:6080/arcgis/rest/services/Test/guangzhouquhua/MapServer'
          })
        ],
        title: 'basemap',
        id: 'basemap'
      })

      const map = new this.$esri.Map({
        basemap: basemap
      })

      const view = new this.$esri.MapView({
        container: 'map',
        map: map,
        center: ['113.37982556587252', '23.12544632414178'],
        zoom: 2,
        spatialReference: {
          wkid: 4326
        }
      })
      // 设置view
      view.ui.remove('attribution')

      // 绑定view和map
      Vue.prototype.$map = map
      Vue.prototype.$view = view
    },
    initTDTMap () {
      // 天地图的key，为避免访问数量限制的问题，每个项目请自行申请
      const tdtToken = '959fa8d2a6e66731640495eb25a8fdd9'

      const mapBaseLayer = new this.$esri.WebTileLayer({
        urlTemplate: `http://{subDomain}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tdtToken}`,
        subDomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        copyright: '天地图影像图'
      })

      // eslint-disable-next-line no-unused-vars
      const anoBaseLayer = new this.$esri.WebTileLayer({
        urlTemplate: `http://{subDomain}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tdtToken}`,
        subDomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        copyright: '天地图影像注记'
      })

      const imgBasemap = new this.$esri.Basemap({
        baseLayers: [mapBaseLayer],
        title: '影像图',
        id: 'img_w',
        thumbnailUrl:
          'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/0/0/0'
      })

      const mapBaseLayerVec = new this.$esri.WebTileLayer({
        urlTemplate: `http://{subDomain}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tdtToken}`,
        subDomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        copyright: '天地图矢量图'
      })

      const anoBaseLayerVec = new this.$esri.WebTileLayer({
        urlTemplate: `http://{subDomain}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tdtToken}`,
        subDomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        copyright: '天地图矢量注记'
      })

      const vecBasemap = new this.$esri.Basemap({
        baseLayers: [mapBaseLayerVec, anoBaseLayerVec],
        title: '矢量图',
        id: 'cva_w',
        thumbnailUrl:
          'https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/410.png'
      })

      const map = new this.$esri.Map({
        basemap: vecBasemap
      })

      const view = new this.$esri.MapView({
        container: 'map',
        map: map,
        center: [113.37393, 23.240608],
        zoom: 10,
        constraints: {
          lods: mapBaseLayerVec.tileInfo.clone().lods
        }
      })
      Vue.prototype.$view = view

      // 设置view
      view.ui.remove('attribution')

      // 添加底图切换小部件
      const toggle = new this.$esri.BasemapToggle({
        view: view,
        nextBasemap: imgBasemap,
        visibleElements: {
          title: true
        }
      })
      view.ui.add(toggle, 'bottom-right')
    },
    addLayer () {
      const guangZhouData = new this.$esri.MapImageLayer({
        id: 'guangZhouData',
        title: '广州专题数据',
        legendEnabled: false,
        visible: false,
        url:
          'http://localhost:6080/arcgis/rest/services/Test/guangZhouData/MapServer',
        sublayers: [
          { id: 0, title: '地铁站点', visible: false },
          { id: 2, title: '全市河流' }
        ]
      })
      this.$view.map.add(guangZhouData)
      // 图层无法加载的错误提示
      guangZhouData.on('layerview-create-error', event => {
        this.$alert(
          `相关专题服务仅本地可用，暂未对外开放：<br/>${event.error.details.url}`,
          '图层加载失败',
          {
            type: 'error',
            confirmButtonText: '确定',
            dangerouslyUseHTMLString: true
          }
        )
      })

      const riverLayer = new this.$esri.FeatureLayer({
        id: 'riverLayer',
        title: '全市河流',
        // legendEnabled: false,
        // visible: false,
        url:
          'http://localhost:6080/arcgis/rest/services/Test/guangZhouData/MapServer/2',
        definitionExpression: "HCFL = '骨干河'",
        popupTemplate: {
          title: '{RVNM}',
          content: [
            {
              type: 'fields',
              fieldInfos: [
                {
                  fieldName: 'RVCD',
                  label: '河流编码'
                },
                {
                  fieldName: 'RVNM',
                  label: '河流名称'
                },
                {
                  fieldName: 'HCFL',
                  label: '河流分类'
                },
                {
                  fieldName: 'SSLYMC',
                  label: '所属流域'
                },
                {
                  fieldName: 'XZQ',
                  label: '所属区划'
                },
                {
                  fieldName: 'REMARK',
                  label: '备注'
                }
              ]
            }
          ]
        }
      })
      this.$view.map.add(riverLayer)

      const measureThisAction = {
        title: '详情',
        id: 'detail',
        // image: require('@/assets/detail.svg')
        className: 'esri-icon-line-chart'
      }
      const ditiePointLayer = new this.$esri.FeatureLayer({
        id: 'ditiePoint',
        title: '地铁站点',
        legendEnabled: false,
        visible: false,
        url:
          'http://localhost:6080/arcgis/rest/services/Test/guangZhouData/MapServer/0',
        // featureReduction: { // 点聚合
        //   type: 'cluster',
        //   clusterRadius: 100
        // },
        popupTemplate: {
          title: '{NAME}',
          content: [
            {
              type: 'fields',
              fieldInfos: [
                {
                  fieldName: 'NAME',
                  label: '名称'
                }
              ]
            }
          ],
          actions: [measureThisAction]
        },
        renderer: commonPointSymbol
      })
      this.$view.map.add(ditiePointLayer)
      this.$view.popup.on('trigger-action', function (event) {
        if (event.action.id === 'detail') {
          console.log('@TODO 详情')
        }
      })
    },
    addOperationPanel () {
      this.$view.popup.defaultPopupTemplateEnabled = true
      this.$view.ui.add('operationPanel', 'top-right')
      this.layerQueryVisible = true
    },
    addArcgisWidget () {
      // 地图全屏
      const fullScreen = new this.$esri.Fullscreen({
        view: this.$view
      })

      // 默认地图视图
      const homeBtn = new this.$esri.Home({
        view: this.$view
      })

      // 坐标定位、转换
      const ccWidget = new this.$esri.CoordinateConversion({
        view: this.$view
      })
      const bgExpand = new this.$esri.Expand({
        view: this.$view,
        content: ccWidget,
        expandIconClass: 'esri-icon-map-pin',
        expandTooltip: '坐标定位'
      })
      this.$view.ui.add([fullScreen, homeBtn, bgExpand], 'top-left')

      // 图例
      this.$view.ui.add(
        new this.$esri.Legend({
          view: this.$view
        }),
        'bottom-left'
      )

      // layerList
      const layerList = new this.$esri.LayerList({
        view: this.$view
      })
      this.$view.ui.add(layerList, 'top-right')
    },
    // 地理编码
    addViewEvent () {
      const locatorTask = new this.$esri.Locator({
        url:
          'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'
      })

      this.$view.popup.autoOpenEnabled = false
      this.$view.on('click', event => {
        // Get the coordinates of the click on the view
        // let lat = Math.round(event.mapPoint.latitude * 1000) / 1000
        // let lon = Math.round(event.mapPoint.longitude * 1000) / 1000
        const lat = event.mapPoint.latitude
        const lon = event.mapPoint.longitude
        this.$view.popup.open({
          // Set the popup's title to the coordinates of the location
          title: 'Reverse geocode: [' + lon + ', ' + lat + ']',
          content: '搜索中......',
          location: event.mapPoint // Set the location of the popup to the clicked location
        })

        locatorTask
          .locationToAddress({
            location: event.mapPoint
          })
          .then(response => {
            // If an address is successfully found, show it in the popup's content
            this.$view.popup.content = response.address
          })
          .catch(error => {
            // If the promise fails and no result is found, show a generic message
            this.$view.popup.content = 'No address was found for this location'
            return error
          })
      })
    },
    // 热度图渲染
    heatmapRenderer () {
      const heatmapLayer = new this.$esri.FeatureLayer({
        id: 'heatmapLayer',
        title: '热度图测试图层',
        url:
          'http://localhost:6080/arcgis/rest/services/Test/HeatmapTest/MapServer/0',
        renderer: {
          type: 'heatmap',
          blurRadius: 10,
          colorStops: [
            { ratio: 0, color: 'rgba(255, 255, 0, 0)' },
            { ratio: 0.1, color: 'rgba(255, 240, 0, 1)' },
            { ratio: 0.2, color: 'rgba(255, 230, 0, 1)' },
            { ratio: 0.3, color: 'rgba(255, 210, 0, 1)' },
            { ratio: 0.4, color: 'rgba(255, 180, 0, 1)' },
            { ratio: 0.5, color: 'rgba(255, 150, 0, 1)' },
            { ratio: 0.6, color: 'rgba(255, 120, 0, 1)' },
            { ratio: 0.7, color: 'rgba(255, 90, 0, 1)' },
            { ratio: 0.8, color: 'rgba(255, 60, 0, 1)' },
            { ratio: 0.9, color: 'rgba(255, 30, 0, 1)' },
            { ratio: 1, color: 'rgba(255, 0, 0, 1)' }
          ],
          minPixelIntensity: 0,
          maxPixelIntensity: 180
        }
      })
      this.$view.map.add(heatmapLayer)
    },
    // 基于客户端数据的要素图层
    clientSideFeatureLayer () {
      const data = [
        {
          id: 1,
          x: '113.290159',
          y: '23.183181',
          name: 'name1',
          content: 'content1'
        },
        {
          id: 2,
          x: '113.310759',
          y: '23.108679',
          name: 'name2',
          content: 'content2'
        },
        {
          id: 3,
          x: '113.522245',
          y: '23.154143',
          name: 'name3',
          content: 'content3'
        },
        {
          id: 4,
          x: '113.417875',
          y: '23.024025',
          name: 'name4',
          content: 'content4'
        },
        {
          id: 5,
          x: '113.373930',
          y: '23.240608',
          name: 'name5',
          content: 'content5'
        }
      ]

      const graphics = this._dataToGraphics(data)
      const clientSideFeatureLayer = new this.$esri.FeatureLayer({
        id: 'clientSideFeatureLayer',
        title: '基于客户端数据的要素图层',
        source: graphics,
        fields: [
          {
            name: 'id',
            alias: '编号',
            type: 'oid'
          },
          {
            name: 'name',
            alias: '名称',
            type: 'string'
          },
          {
            name: 'content',
            alias: '内容',
            type: 'string'
          }
        ],
        geometryType: 'point',
        spatialReference: { wkid: 4326 },
        renderer: commonPointSymbol
      })
      this.$view.map.add(clientSideFeatureLayer)
    },
    // 将包含x、y坐标的数据转换为graphic数组
    _dataToGraphics (data) {
      const graphics = []
      for (let i = 0; i < data.length; i++) {
        const point = data[i]
        graphics.push(
          new this.$esri.Graphic({
            geometry: {
              type: 'point',
              longitude: point.x,
              latitude: point.y
            },
            attributes: point
          })
        )
      }
      return graphics
    }
  }
}
</script>

<style lang='scss' scoped>
@import "~@/styles/variables.scss";

.map-demo {
  position: relative;
  height: 100%;

  .map {
    height: 100%;
  }

  .table-div {
    height: 100%;
  }
}
</style>
