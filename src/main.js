// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'
import api from './common/api.js'
import utils from './common/utils.js'
import VueLazyload from 'vue-lazyload'
import infiniteScroll from  'vue-infinite-scroll'
import './assets/css/base.css'
import './assets/css/checkout.css'
import './assets/css/product.css'
Vue.config.productionTip = false
Vue.prototype.$utils = utils
// 将API方法绑定到全局
Vue.prototype.$api = api
Vue.use(infiniteScroll)
Vue.use(ElementUI)
Vue.use(VueLazyload, {
  loading: 'assets/loading-svg/loading-bars.svg',
  try: 3 // default 1
})
// import {sum,minus} from './common/utils' //解构，一一对应
// import * as utils from './common/utils'
//import utils from './common/utils'
// console.log(`sum:${sum(1,6)}`)
// console.log(`mins:${minus(5,2)}`)
// console.log(`sum:${utils.sum(1,6)}`)
// console.log(`mins:${utils.minus(5,2)}`)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
