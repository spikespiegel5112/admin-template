import axios from 'axios'
import router from '../router/router'

import {
  Notification,
  MessageBox,
  Message
} from 'element-ui'
import store from '@/store/store'
import {
  getToken,
  getCookie
} from '@/utils/auth'
function getSessionId() {
  var c_name = 'JSESSIONID';
  debugger

  if (document.cookie.length > 0) {

    c_start = document.cookie.indexOf(c_name + "=")
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1
      c_end = document.cookie.indexOf(";", c_start)
      if (c_end == -1) c_end = document.cookie.length
      return unescape(document.cookie.substring(c_start, c_end));
    }
  }
}
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  // baseURL: process.env.VUE_APP_BASE_API,
  baseURL: '/api',
  // baseURL: 'http://122.112.224.131:8090',

  // 超时
  timeout: 10000,
  withCredentials: true
})
// request拦截器
service.interceptors.request.use(
  config => {
    // if (getToken()) {
    //   config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    // }
    if (getCookie()) {
      // config.headers['Cookie'] = 'Bearer ' + getCookie() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    let sessionId = getSessionId()

    config.headers['Cookie'] = 'JSESSIONID=' + getSessionId() // 让每个请求携带自定义token 请根据实际情况自行修改

    return config
  },
  error => {
    console.log(error)
    Promise.reject(error)
  }
)

let logedOutFlag = false
// 响应拦截器
service.interceptors.response.use(res => {
  // console.log('interceptors+++', res)
  // if (!res.data) {
  //   debugger
  //   return res
  // }
  let result
  const code = res.data.respCode
  const hadnleLogout = () => {
    MessageBox.confirm(
      '登录状态已过期，您可以继续留在该页面，或者重新登录',
      '系统提示', {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning'
    }
    ).then(() => {
      store.dispatch('LogOut').then(() => {
        location.reload() // 为了重新实例化vue-router对象 避免bug
      })
    })
  }
  const handleLogout2 = () => {
    MessageBox({
      title: '提示',
      message: '已退出登录，请重新登录',
      distinguishCancelAndClose: true,
      confirmButtonText: '确定',
      type: 'prompt',
      showClose: false,
      closeOnPressEscape: false,
      closeOnClickModal: false,
      // showCancelButton: true,
      callback(action) {
        if (action === 'confirm') {
          // console.log(to.path)
          // debugger
          localStorage.removeItem('loginFlag')
          router.push({
            path: '/login'
          })
        }
      }
    })
  }

  switch (code) {
    case '01':
      result = res.data.data
      return Promise.reject(res.data.respMsg)
      break
    default:
      result = res.data
  }
  return result
}, error => {
  console.log('err' + error)
  Message({
    message: error.message,
    type: 'error',
    duration: 5 * 1000
  })
  return Promise.reject(error)
})

export default service

export const baseUrl = process.env.VUE_APP_BASE_API
