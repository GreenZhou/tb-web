import Vue from 'vue'
import { loadModules, setDefaultOptions } from 'esri-loader'

// 远程引入
// setDefaultOptions({ version: '4.15', css: true })

// 引入本地资源
setDefaultOptions({
  url: 'http://localhost:8081/arcgis_js_api/library/4.15/init.js',
  css: 'http://localhost:8081/arcgis_js_api/library/4.15/esri/css/main.css'
})

// 加载arcgis api的模块到Vue.prototype.$esri
export function loadArcgisModules (arcgisModulePath) {
  return new Promise((resolve, reject) => {
    console.time('arcgis api加载时间：')
    // 加载arcgis api的模块
    loadModules(arcgisModulePath).then(args => {
      let arcgisModuleName = '' // 模块的默认名称
      for (let i = 0; i < args.length; i++) {
        arcgisModuleName = arcgisModulePath[i].split('/').pop()
        // 添加到Vue.prototype.$esri
        Vue.prototype.$esri = Vue.prototype.$esri || {}
        Vue.prototype.$esri[arcgisModuleName] = args[i]
      }
      console.timeEnd('arcgis api加载时间：')
      resolve()
    }).catch(err => {
      console.error(err)
      reject(err)
    })
  })
}

// 通用Symbol
export const commonPointSymbol = {
  type: 'simple',
  symbol: {
    type: 'simple-marker',
    size: 8,
    color: 'red',
    outline: {
      width: 1,
      color: 'white'
    }
  }
}
