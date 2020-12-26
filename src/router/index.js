import Vue from 'vue'
import VueRouter from 'vue-router'
//此为一组
const Login = () => import(/* webpackChunkName: "login-home-welcome" */ '../components/Login.vue')
// import Login from '../components/Login.vue'

const Home = () => import(/* webpackChunkName: "login-home-welcome" */ '../components/Home.vue')
// import Home from '../components/Home.vue'

const Welcome = () => import(/* webpackChunkName: "login-home-welcome" */ '../components/Welcome.vue')
// import Welcome from '../components/Welcome.vue'

//此为一组
// import Users from '../components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "Users-Rights-Roles" */ '../components/user/Users.vue')

// import Rights from '../components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "Users-Rights-Roles" */ '../components/power/Rights.vue')

// import Roles from '../components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "Users-Rights-Roles" */ '../components/power/Roles.vue')

//此为一组
// import Cate from '../components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate-Params" */ '../components/goods/Cate.vue')

// import Params from '../components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Cate-Params" */ '../components/goods/Params.vue')

//此为一组
// import List from '../components/goods/List.vue'
const List = () => import(/* webpackChunkName: "List-Add" */ '../components/goods/List.vue')

// import Add from '../components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "List-Add" */ '../components/goods/Add.vue')

//此为一组
// import Order from '../components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Order-Report" */ '../components/order/Order.vue')

// import Report from '../components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Order-Report" */ '../components/report/Report.vue')



Vue.use(VueRouter)

// 配置路由映射关系
const routes = [
  //配置重定向
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  // 相当于子路由   重定向到子路由   children 为子路由路径
  {
    path: '/home', component: Home, redirect: '/welcome', children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      // 其中rights  是页面中跳转地地址
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report },

    ]
  }
]

const router = new VueRouter({
  routes
})
//拦截路由导航守卫
// to表示要访问的路径
// from 从哪个路径来的 
// next 为函数  表示继续执行
// next()   next("具体跳转到哪个页面")

router.beforeEach((to, frome, next) => {
  if (to.path == "/login") return next()
  const tokenStr = window.sessionStorage.getItem("token")
  if (!tokenStr) return next("/login")
  next()
})

export default router
