import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入用户图标
import './assets/fonts/iconfont.css'
//导入axios
import axios from 'axios'
//导入treetable
import TreeTable from 'vue-table-with-tree-grid'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

//导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

//导入nprogress  对应的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

//配置axios的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//在request拦截器中 展示NProgress.start()
NProgress.start()
// 添加拦截器 为请求头添加token  config就是请求对象
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')

    //最后必须return
    return config
})
//在response拦截器中 隐藏进度条 NProgress.done()
axios.interceptors.response.use((config) => {
    NProgress.done()
    return config
})

//将富文本编辑器 注册为全局可可用的组件
Vue.use(VueQuillEditor)

//挂载到vue原型上面  通过$http来访问
Vue.prototype.$http = axios

Vue.config.productionTip = false
//全局注册该组件
Vue.component('tree-table', TreeTable)
//自定义格式化时间的全局过滤器
Vue.filter('dateFormat', function (originVal) {
    const dt = new Date(originVal)

    const y = dt.getFullYear()
    //需要转为字符串调用padStart  确定为几位 如果不足 就以什么填充 因为 month 是从0开始的，所以需要+1
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')

    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    //
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
