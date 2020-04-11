import {
  constantRoutes,
  errorRoutes
} from '@/router/router'
import {
  getRouters
} from '@/api/menu'
import Layout from '@/layout/index'
import InnerLayout from '@/views/InnerLayout'

const permission = {
  state: {
    routes: [{
      path: '',
      component: Layout,
      children: [{
        "name": "dashboard",
        "path": "/dashboard",
        component: () => import("@/views/Dashboard.vue"),
        // "alwaysShow": true,
        "meta": {
          "title": "主页",
          "icon": "dashboard",
          functionaility: []
        },
      }, {
        "name": "baseData",
        "path": "/baseData",
        // "redirect": "noRedirect",
        component: () => import("@/views/Dashboard.vue"),
        // "alwaysShow": true,
        hidden: true,
        configurable: false,
        "meta": {
          "title": "基础数据",
          "icon": "gear",
          functionaility: []
        },
      }, {
        "name": "roles",
        "path": "/roles",
        // "redirect": "noRedirect",
        component: InnerLayout,
        // "alwaysShow": true,
        "meta": {
          "title": "角色权限",
          "icon": "authority",
          functionaility: []
        },
        "children": [{
          "name": "rolesManagement",
          "path": "roles-management",
          component: () => import("@/views/Authority/RolesManagement.vue"),
          "meta": {
            "title": "角色管理",
            "icon": "user",
            functionaility: ['query', 'create']
          }
        }, {
          "name": "memberManagement",
          "path": "member-management",
          component: () => import("@/views/Authority/MemberManagement.vue"),
          "hidden": true,
          "meta": {
            "title": ["角色管理", "成员管理"],
            "icon": "user",
            functionaility: ['query', 'create', 'delete']
          }
        }, {
          "name": "authorityManagement",
          "path": "authority-management",
          component: () => import("@/views/Authority/AuthorityManagement.vue"),
          configurable: true,
          "meta": {
            "title": "权限配置",
            "icon": "secretchat",
            functionaility: ['query', 'save']

          }
        }, {
          "name": "authoritySetting",
          "path": "authority-setting",
          component: () => import("@/views/Authority/AuthoritySetting.vue"),
          "hidden": true,
          alwaysHidden: true,
          "meta": {
            "title": ["权限配置", '权限设定'],
            "icon": "secretchat",
            functionaility: ['query', 'save', '']

          }
     
        }]
      }]
    }],
    addRoutes: [],
    functionaility: []
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRoutes.concat(routes)
    },
    setFunctionaility: (state, payload) => {
      state.functionaility = payload
    }
  },
  actions: {
    // 生成路由
    GenerateRoutes({
      commit
    }) {
      return new Promise(resolve => {
        // 向后端请求路由数据
        getRouters().then(res => {
          const accessedRoutes = filterAsyncRouter(res.data)
          commit('SET_ROUTES', accessedRoutes)
          resolve(accessedRoutes)
        })
      })
    }
  }
}


// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap) {
  return asyncRouterMap.filter(route => {
    if (route.component) {
      // Layout组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    }
    return true
  })
}

export const loadView = (view) => { // 路由懒加载
  return () => import(`@/views/${view}`)
}

export default permission
