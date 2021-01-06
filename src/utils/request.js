import axios from 'axios'
// import { MessageBox, Message } from 'element-ui'
// import store from '@/store'

import qs from 'qs'
import { Message } from 'element-ui'

import NProgress from 'nprogress' // progress bar
NProgress.configure({ showSpinner: false }) // NProgress Configuration

// create an axios instance
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API, // api 的 base_url
  baseURL: 'http://127.0.0.1:8090/rbac', // api 的 base_url
  // baseURL: 'http://192.168.21.100:8090', // api 的 base_url
  withCredentials: true, // 跨域请求时发送 cookies
  // validateStatus: function(status) { //获取状态码
  //   console.log(status)
  //   // return status >= 200 && status < 300; // 默认
  // },
  timeout: 60000 // request timeout
})
// eslint-disable-next-line no-unused-vars
// let loading
// request interceptor
service.interceptors.request.use(
  config => {
    // loading = Loading.service({
    //   lock: true,
    //   text: 'Loading',
    //   spinner: 'el-icon-loading',
    //   background: 'rgba(0, 0, 0, 0.7)'
    // })
    // this.$loading(options)
    NProgress.start()
    // 开发测试,\\正式环境中没有跨域问题
    // const url = config.url.substr(0, 5)
    if (config.method === 'post') {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      config.data = qs.stringify(config.data)
    }
    // if (url === '/rbac') {
    //   config.url = 'http://192.168.21.100:8090' + config.url
    //   if (config.method === 'post') {
    //     config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    //     config.headers['Access-Token'] = 'token123'
    //     config.data = qs.stringify(config.data)
    //   }
    // }

    return config
  },
  error => {
    NProgress.done()
    // loading.close()
    // bug: 如果接口发生如何错误则返回登陆页面
    window.location = 'http://127.0.0.1:8080/rgba/logout'
    // Do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get information such as headers or status
   * Please return  response => response
  */
  /**
   * 下面的注释为通过在response里，自定义code来标示请求状态
   * 当code返回如下情况则说明权限有问题，登出并返回到登录页
   * 如想通过 XMLHttpRequest 来状态码标识 逻辑可写在下面error中
   * 以下代码均为样例，请结合自生需求加以修改，若不需要，则可删除
   */
  response => {
    NProgress.done()
    // loading.close()
    const res = response.data

    if (typeof (res) === 'string' && res.indexOf('html') > -1) {
      location.href = `http://127.0.0.1:8080/cas/login?service=${location.href}`
      return
    }
    // if (res.code !== 1) {
    //   Message({
    //     message: '出错了，请重试一遍！',
    //     type: 'error',
    //     duration: 5 * 1000
    //   })
    //   // this.$message.error('出错了，请重试一遍！')
    // }

    // 请求出错拦截，不同状态马代表不同的错误信息
    if (res.code !== 1) {
      Message({
        message: res.msg || 'error',
        type: 'error',
        duration: 5 * 1000
      })
      console.log('接口有误：', res)
      // return res
    } else {
      return res
    }

    // if (res.code !== 20000) {
    //   Message({
    //     message: res.message || 'error',
    //     type: 'error',
    //     duration: 5 * 1000
    //   })
    //   if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
    //     // 请自行在引入 MessageBox
    //     // import { Message, MessageBox } from 'element-ui'
    //     MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
    //       confirmButtonText: '重新登录',
    //       cancelButtonText: '取消',
    //       type: 'warning'
    //     })
    //   }
    //   return Promise.reject(res.message || 'error')
    // } else {
    //   return res
    // }
  },
  error => {
    NProgress.done()
    // loading.close()
    // bug: 如果接口出现302或其他问题时跳到登陆页面
    if (error.response === undefined) {
    //   window.location = 'http://192.168.21.100:8080/rgba/logout'
    //  window.open(`http://192.168.21.100:8090/cas/login`, '_self')
    }

    console.log('err::' + error) // for debug
    // console.log('err::' + error.response.status) // for debug
    // Message({ message: error.message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

export default service
