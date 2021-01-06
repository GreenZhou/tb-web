/**
 * Created by jiachenpan on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
// 时间解析
export function parseTime (time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return timeStr
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
// 时间安排
export function formatTime (time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
// 获取：对象
export function getQueryObject (url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/**
 * @param {string} input value
 * @returns {number} output value
 */
// 获取：字节长度
export function byteLength (str) {
  // returns the byte length of an utf8 string
  let s = str.length
  for (var i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7f && code <= 0x7ff) s++
    else if (code > 0x7ff && code <= 0xffff) s += 2
    if (code >= 0xDC00 && code <= 0xDFFF) i--
  }
  return s
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
// 清除数组
export function cleanArray (actual) {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
}

/**
 * @param {Object} json
 * @returns {Array}
 */
// 参数
export function param (json) {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map(key => {
      if (json[key] === undefined) return ''
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    })
  ).join('&')
}

/**
 * @param {string} url
 * @returns {Object}
 */
// 参数
export function param2Obj (url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace(/\+/g, ' ') +
    '"}'
  )
}

/**
 * @param {string} val
 * @returns {string}
 */
// 转换：html代码=>文本
export function html2Text (val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
// 合并
export function objectMerge (target, source) {
  if (typeof target !== 'object') {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  Object.keys(source).forEach(property => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
// 类名切换
export function toggleClass (element, className, type) {
  if (!element || !className) {
    return
  }
  let classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += '' + className
  } else {
    classString =
      classString.substr(0, nameIndex) +
      classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

/**
 * @param {string} type
 * @returns {Date}
 */
// 获取：时间
// export function getTime(type) {
//   if (type === 'start') {
//     return new Date().getTime() - 3600 * 1000 * 24 * 90
//   } else {
//     return new Date(new Date().toDateString())
//   }
// }

// 获取：时间戳
export function getTimes (data) {
  const D = data ? data.replace(/-/g, '/') : '' // 把所有-转化成/
  return D ? new Date(D).getTime() : new Date().getTime()
}

// 数据转换：获取各种时间
export function getTime (type, times) {
  const T = times ? new Date(+times) : new Date()

  const year = T.getFullYear()
  const month = toTwo(T.getMonth() + 1)
  const day = toTwo(T.getDate())
  const hour = toTwo(T.getHours())
  const minute = toTwo(T.getMinutes())
  const second = toTwo(T.getSeconds())

  switch (type) {
    case 'year':return `${year}`
    case 'mouthTrue':return `${month}`
    case 'dayTrue':return `${day}`
    case 'hourTrue':return `${hour}`
    case 'month':return `${year}-${month}`
    case 'day':return `${year}-${month}-${day}`
    case 'second':return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }
  return `${year}-${month}-${day} ${hour}:${minute}`
}
// 数据转换：加零
export function toTwo (num) {
  num = parseInt(num)
  return num > 9 ? '' + num : '0' + num
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
// 弹回
export function debounce (func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function (...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
// 数组去重
export function uniqueArr (arr) {
  return Array.from(new Set(arr))
}

/**
 * @returns {string}
 */
// 获取：随机字符串
export function createUniqueString () {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536) + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
// 类名：判断是否有该类名
export function hasClass (ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
// 类名：增加
export function addClass (ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
// 类名：删除
export function removeClass (ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}

// 树形列表: 通过id和parentId,返回多级数据（前提：一级菜单的parentId为0或者空）
export function changeTreeData ({ list = [], FunChangeData }) {
  // 改变原来每一项的数据
  if (FunChangeData) {
    list.map(item => { item = FunChangeData(item, list) })
  }

  // 排序
  list = list.sort(function (a, b) { return a.id - b.id })

  const NA = [] // new array: 新数组
  let FE = null // father element: 每一项的父元素

  list.map(item => {
    item.children = item.children || []
    if (item.parentId > 0) {
      FE = null
      const FFE = findFatherEle(NA, item.parentId) // find father element: 找到匹配的父元素
      if (FFE) FFE.children.push(item)
    } else {
      NA.push(item)
    }
  })
  // 递归函数: 找到匹配的父元素
  function findFatherEle (arr, parentId) {
    arr.map(item => {
      if (item.id === parentId) {
        FE = item
      } else if (item.children.length) {
        FE = findFatherEle(item.children, parentId)
      }
    })
    return FE
  }
  return NA
}

// 获取盒子在页面的相对高度
export function getElementTop (el) {
  if (!el) return ''
  var top = el.offsetTop
  var parent = el.offsetParent
  while (parent !== null) {
    top += parent.offsetTop
    parent = parent.offsetParent
  }
  return top
}

// 文件下载
export function filesDownload (list) {
  list.map(ele => {
    const a = document.createElement('a')
    a.href = ele.url
    a.download = ele.name || ''
    a.style.display = 'none'
    a.click()
  })
}

/**
 * Array transform to tree
 * @param {array} data
 * @param {string} id
 */
// 数组转换成tree
export function arrayToTree (data, id) {
  const result = []
  if (!Array.isArray(data)) {
    return result
  }
  const map = {}
  data.forEach(item => {
    delete item.children
    map[item[id]] = item
  })
  // const map = {}
  // data.forEach(item => {
  //   map[item[id]] = item
  // })
  data.forEach(item => {
    const parent = map[item.parentId]

    if (parent) {
      (parent.children || (parent.children = [])).push(item)
    } else {
      result.push(item)
    }
  })
  return result
}

/**
 * Tree transform to array
 * @param {array} data
 * @param {string} id
 */
// 非树形结构转换
export function treeToArray (tree) {
  const arr = []
  const expanded = datas => {
    if (datas && datas.length > 0) {
      datas.forEach(e => {
        arr.push(e)
        expanded(e.children)
      })
    }
  }
  expanded(tree)
  return arr
}

export function sortByItem (arr, item) {
  arr.sort(function (a, b) {
    if (a[item] < b[item]) {
      return -1
    } else if (a[item] === b[item]) {
      return 0
    } else {
      return 1
    }
  })

  return arr
}

/**
 * @param {number} date
 * @param {string} split
 * @returns {string}
 */
// 获得年月日
export function getDateYMD (date, split) {
  if (!date) {
    return
  }
  const year = date.getFullYear()
  const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  return year + split + month + split + day
}
