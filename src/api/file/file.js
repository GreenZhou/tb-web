// import request from '@/utils/request'
import axios from 'axios'

// 合并文件
export function merge (data) {
  axios({
    url: '/file/merge',
    method: 'post',
    data,
    transformRequest: [
      function (data) {
        // Do whatever you want to transform the data
        let ret = ''
        // eslint-disable-next-line no-unused-vars
        for (const it in data) {
          ret += encodeURIComponent(it) +
            '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret
      }
    ],
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => {
    // console.log(3,res)
  })

  // return request({
  //   url: '/file/merge',
  //   method: 'post',
  //   data
  // })
}
