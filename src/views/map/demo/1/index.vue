<template>
  <div class="mapDemo">
    <div
      id="map"
      v-loading="loading"
      class="map"
      element-loading-text="地图初始化..."
      element-loading-spinner="el-icon-loading"
    />
    <div id="actions" class="esri-widget">
      <button class="esri-button" id="add">添加 7 处标记</button>
      <button class="esri-button" id="remove">移除 7 处标记</button>
    </div>
  </div>
</template>

<script>
import { loadArcgisModules } from '@/utils/mapUtils'

export default {
  name: 'Demo1',
  data () {
    return {
      loading: true,
      map: {},
      view: {},
      addBtn: {},
      removeBtn: {},
      monumentLayer: {},
      featureTable: {},
      locatorTask: {}
    }
  },
  mounted: function () {
    loadArcgisModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/Basemap',
      'esri/layers/VectorTileLayer',
      'esri/layers/FeatureLayer',
      'esri/Graphic',
      'esri/widgets/Legend',
      'esri/layers/WebTileLayer',
      'esri/tasks/Locator'
    ]).then(() => {
      this.initMap()
      this.loading = false
    })
  },
  methods: {
    initMap () {
      const that = this

      const tdtToken = 'e27b96e059d238d442901f8d713f59b9'

      var mapBaseLayerVec = new this.$esri.WebTileLayer({
        urlTemplate: `http://{subDomain}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tdtToken}`,
        subDomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        copyright: '天地图矢量图'
      })

      var anoBaseLayerVec = new this.$esri.WebTileLayer({
        urlTemplate: `http://{subDomain}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}&tk=${tdtToken}`,
        subDomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        copyright: '天地图矢量注记'
      })

      this.locatorTask = new this.$esri.Locator({
        url:
          'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'
      })

      this.map = new this.$esri.Map({
        basemap: new this.$esri.Basemap({
          baseLayers: [mapBaseLayerVec, anoBaseLayerVec],
          title: '矢量图'
        })
        // baseLayers: [
        //   new this.$esri.VectorTileLayer({
        //     portalItem: { id: '474f0cb226884dd68f707ab0f2f1aa10' }
        //   })
        // ],
        // referenceLayers: [WebTileLayer
        //   new this.$esri.VectorTileLayer({
        //     portalItem: { id: '1768e8369a214dfab4e2167d5c5f2454' }
        //   })
        // ]
        // })
      })

      this.view = new this.$esri.MapView({
        container: 'map',
        map: this.map,
        center: [113.3124748410306, 23.124111860101852],
        zoom: 14
      })

      // create empty FeatureLayer
      this.monumentLayer = new this.$esri.FeatureLayer({
        // create an instance of esri/layers/support/Field for each field object
        title: '增加标记',
        fields: [
          {
            name: 'ObjectID',
            alias: 'ObjectID',
            type: 'oid'
          },
          {
            name: 'Name',
            alias: 'Name',
            type: 'string'
          },
          {
            name: 'Field1',
            alias: 'Field1',
            type: 'string'
          },
          {
            name: 'Field2',
            alias: 'Field2',
            type: 'string'
          },
          {
            name: 'Field3',
            alias: 'Field3',
            type: 'string'
          },
          {
            name: 'Field4',
            alias: 'Field4',
            type: 'string'
          },
          {
            name: 'Type',
            alias: 'Type',
            type: 'string'
          }
        ],
        objectIdField: 'ObjectID',
        geometryType: 'point',
        spatialReference: { wkid: 4326 },
        source: [], // adding an empty feature collection
        renderer: {
          type: 'simple',
          symbol: {
            type: 'web-style', // autocasts as new WebStyleSymbol()
            styleName: 'Esri2DPointSymbolsStyle',
            name: 'landmark'
          }
        },
        popupTemplate: {
          title: '{Name}',
          content: [
            {
              type: 'fields',
              fieldInfos: [
                {
                  fieldName: 'Field1', // The field whose values you want to format
                  label: '字段1'
                },
                {
                  fieldName: 'Field2', // The field whose values you want to format
                  label: '字段2',
                  format: {
                    digitSeparator: true, // Uses a comma separator in numbers >999
                    places: 0 // Sets the number of decimal places to 0 and rounds up
                  }
                },
                {
                  fieldName: 'Field3', // The field whose values you want to format
                  label: '字段3',
                  format: {
                    digitSeparator: true, // Uses a comma separator in numbers >999
                    places: 0 // Sets the number of decimal places to 0 and rounds up
                  }
                },
                {
                  fieldName: 'Field4', // The field whose values you want to format
                  label: '字段4',
                  format: {
                    digitSeparator: true, // Uses a comma separator in numbers >999
                    places: 0 // Sets the number of decimal places to 0 and rounds up
                  }
                }
              ]
            }
          ]
        }
      })
      this.map.add(this.monumentLayer)

      // add legend
      const legend = new this.$esri.Legend({
        view: this.view
      })
      this.view.ui.add(legend, 'bottom-left')

      // add buttons to the mapView
      this.view.ui.add(document.getElementById('actions'), 'top-right')

      this.addBtn = document.getElementById('add')
      this.removeBtn = document.getElementById('remove')

      this.addBtn.addEventListener('click', this.addFeatures)
      this.removeBtn.addEventListener('click', this.removeFeatures)

      // check if features have already been added to determine disabled state of buttons
      this.monumentLayer.queryFeatures().then(function (results) {
        if (results.features.length === 0) {
          that.addBtn.disabled = false
          that.removeBtn.disabled = true
        } else {
          that.addBtn.disabled = true
          that.removeBtn.disabled = false
        }
      })

      // this.addViewClick()
    },

    // fires when "Add Features" button is clicked
    addFeatures () {
      // data to be added to the map
      const data = [
        {
          // 113.3124748410306, 23.124111860101852
          LATITUDE: 23.124131860101852,
          LONGITUDE: 113.3114748410306,
          TYPE: 'Mark',
          NAME: '标记1',
          Field1: '标记1 字段1',
          Field2: '标记1 字段2',
          Field3: '标记1 字段3',
          Field4: '标记1 字段4'
        },
        {
          LATITUDE: 23.124211860101852,
          LONGITUDE: 113.3214748410306,
          TYPE: 'Mark',
          NAME: '标记2',
          Field1: '标记2 字段1',
          Field2: '标记2 字段2',
          Field3: '标记2 字段3',
          Field4: '标记2 字段4'
        },
        {
          LATITUDE: 23.120311860101852,
          LONGITUDE: 113.3124148410306,
          TYPE: 'Mark',
          NAME: '标记3',
          Field1: '标记3 字段1',
          Field2: '标记3 字段2',
          Field3: '标记3 字段3',
          Field4: '标记3 字段4'
        },
        {
          LATITUDE: 23.129141860101852,
          LONGITUDE: 113.3122748410306,
          TYPE: 'Mark',
          NAME: '标记4',
          Field1: '标记4 字段1',
          Field2: '标记4 字段2',
          Field3: '标记4 字段3',
          Field4: '标记4 字段4'
        },
        {
          LATITUDE: 23.124151860101852,
          LONGITUDE: 113.3171748410306,
          TYPE: 'Mark',
          NAME: '标记5',
          Field1: '标记5 字段1',
          Field2: '标记5 字段2',
          Field3: '标记5 字段3',
          Field4: '标记5 字段4'
        },
        {
          LATITUDE: 23.124161860101852,
          LONGITUDE: 113.3194348410306,
          TYPE: 'Mark',
          NAME: '标记6',
          Field1: '标记6 字段1',
          Field2: '标记6 字段2',
          Field3: '标记6 字段3',
          Field4: '标记6 字段4'
        },
        {
          LATITUDE: 23.121114860101852,
          LONGITUDE: 113.3124148410306,
          TYPE: 'Mark',
          NAME: '标记7',
          Field1: '标记7 字段1',
          Field2: '标记7 字段2',
          Field3: '标记7 字段3',
          Field4: '标记7 字段4'
        }
      ]

      // create an array of graphics based on the data above
      var graphics = []
      var graphic
      for (var i = 0; i < data.length; i++) {
        graphic = new this.$esri.Graphic({
          geometry: {
            type: 'point',
            latitude: data[i].LATITUDE,
            longitude: data[i].LONGITUDE
          },
          attributes: data[i]
        })
        graphics.push(graphic)
      }

      // addEdits object tells applyEdits that you want to add the features
      const addEdits = {
        addFeatures: graphics
      }

      // apply the edits to the layer
      this.applyEditsToLayer(addEdits)
    },

    // fires when "Remove Features" button clicked
    removeFeatures () {
      // query for the features you want to remove
      this.monumentLayer.queryFeatures().then(results => {
        // edits object tells apply edits that you want to delete the features
        const deleteEdits = {
          deleteFeatures: results.features
        }
        // apply edits to the layer
        this.applyEditsToLayer(deleteEdits)
      })
    },

    applyEditsToLayer (edits) {
      const that = this
      this.monumentLayer
        .applyEdits(edits)
        .then(function (results) {
          // if edits were removed
          if (results.deleteFeatureResults.length > 0) {
            console.log(
              results.deleteFeatureResults.length,
              'features have been removed'
            )
            that.addBtn.disabled = false
            that.removeBtn.disabled = true
          }
          // if features were added - call queryFeatures to return
          //    newly added graphics
          if (results.addFeatureResults.length > 0) {
            var objectIds = []
            results.addFeatureResults.forEach(function (item) {
              objectIds.push(item.objectId)
            })
            // query the newly added features from the layer
            that.monumentLayer
              .queryFeatures({
                objectIds: objectIds
              })
              .then(function (results) {
                console.log(
                  results.features.length,
                  'features have been added.'
                )
                that.addBtn.disabled = true
                that.removeBtn.disabled = false
              })
          }
        })
        .catch(function (error) {
          console.log(error)
        })
    },

    addViewClick () {
      const that = this
      this.view.popup.autoOpenEnabled = false
      this.view.on('click', function (event) {
        // Get the coordinates of the click on the view
        var lat = Math.round(event.mapPoint.latitude * 1000) / 1000
        var lon = Math.round(event.mapPoint.longitude * 1000) / 1000

        that.view.popup.open({
          // Set the popup's title to the coordinates of the location
          title: 'Reverse geocode: [' + lon + ', ' + lat + ']',
          location: event.mapPoint // Set the location of the popup to the clicked location
        })

        var params = {
          location: event.mapPoint
        }

        // Display the popup
        // Execute a reverse geocode using the clicked location
        that.locatorTask
          .locationToAddress(params)
          .then(function (response) {
            // If an address is successfully found, show it in the popup's content
            that.view.popup.content = response.address
          })
          // eslint-disable-next-line handle-callback-err
          .catch(error => {
            // If the promise fails and no result is found, show a generic message
            that.view.popup.content = 'No address was found for this location'
          })
      })
    }
  }
}
</script>

<style scoped>
html,
body,
.mapDemo,
#map {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
}
#add {
  margin-bottom: 5px;
}
#actions {
  padding: 5px;
}
button:disabled {
  opacity: 0.4;
  -moz-opacity: 0.4; /* Firefox and Mozilla browsers */
  -webkit-opacity: 0.4; /* Safari */
  cursor: default;
}
</style>
