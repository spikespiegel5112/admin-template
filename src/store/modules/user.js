import service from '@/utils/request'
import {
  login,
  logout,
  getInfo
} from '@/api/login'
import {
  getToken,
  setToken,
  removeToken
} from '@/utils/auth'

const user = {
  state: {
    userInfo: {},
    token: getToken(),
    name: 'innben',
    avatar: '',
    // roles: ["admin"],
    roles: [],
    permissions: ["*:*:*"],
    login: true
  },

  mutations: {
    setUserInfo: (state, data) => {
      // state.token = token
      state.userInfo = data
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    },
    setLogin: (state, payload) => {
      state.login = payload
    }
  },

  actions: {
    // 登录
    Login({
      commit,
      dispatch
    }, userInfo) {
      return new Promise((resolve, reject) => {
        // debugger
        console.log(userInfo)
        // 临时跳过登录
        resolve()
        return


        service.post('/api/login', {
          "imageCode": userInfo.imageCode,
          "loginName": userInfo.loginName.trim(),
          "password": userInfo.password,
          "sessionUUID": userInfo.sessionUUID
        }).then(response => {
          // setToken(response.token)
          // commit('SET_TOKEN', response.token)
          const code = response.code
          switch (code) {
            case 0:
              resolve(response)
            case 10001:
              reject(response)
            default:
              resolve(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    getUserInfo({
      commit,
      state
    }) {
      return new Promise((resolve, reject) => {
        let response = {
          "code": 0,
          "data": {
            "account": "admin",
            "createByName": null,
            "email": null,
            "enterpriseId": null,
            "headerUrl": null,
            "id": 1,
            "jobNumber": null,
            "mobile": null,
            "nickName": "管理员",
            "openId": null,
            "perRoleId": null,
            "resourceCode": null,
            "status": 0,
            "token": null,
            "type": 0,
            "wxName": null
          },
          "msg": "操作成功"
        }
        response = response.data
        const avatar = !response.avatar || response.avatar === '' ? require("@/image/access/profile.jpg") : process.env.VUE_APP_BASE_API + user.avatar;
        commit('SET_AVATAR', avatar)
        // 临时跳过登录
        commit('setUserInfo', response)
        commit('setLogin', true)

        // service.get('/api/getCurrent', {}).then(response => {
        //   response = response.data
        //   commit('SET_AVATAR', avatar)
        //   commit('setUserInfo', response)
        //   commit('setLogin', true)
        //   resolve(response)
        // }).catch(error => {
        //   reject(error)
        // })
        resolve(response)


      })
    },

    // 退出系统
    LogOut({
      commit,
      state
    }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_PERMISSIONS', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({
      commit
    }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    }
  }
}

export default user
