import Vue from 'vue'
import Router from 'vue-router'
import Header from '@/components/Header'
import GoodList from '@/components/GoodList'
import GoodsCopy from '@/components/GoodsCopy'
import Cart from '@/pages/Cart'
import Steps from '@/components/Steps'
import Address from '@/components/Address'
import OrderConfirm from '@/components/OrderConfirm'
import OrderSuccess from '@/components/OrderSuccess'
Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [{
      path: '/',
      name: 'Header',
      component: Header,
      children: [{
        path: '/goodsCopy',
        name: 'GoodsCopy',
        component: GoodsCopy
      },{
        path: '/goodList',
        name: 'GoodList',
        component: GoodList
      },{
         path: '/cart',
        name: 'Cart',
        component: Cart
      },{
        path: '/steps',
        name: 'Steps',
        component: Steps,
        children: [{
          path: '/orderConfirm',
          name: 'OrderConfirm',
          component: OrderConfirm
        },{
          path: '/address',
          name: 'Address',
          component: Address
        },{
          path: '/orderSuccess',
          name: 'OrderSuccess',
          component: OrderSuccess

        }]
      }]
    }

  ]
})
