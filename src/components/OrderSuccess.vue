<template>
  <div>
    OrderSuccess
    <div>订单id:{{orderId}}</div>
    <div>订单金额:{{$utils.formatMoney(parseFloat(orderTotal),1)}}</div>
    <el-button @click="goCartPage">购物列表</el-button>
      <el-button @click="goGoodsPage">商品列表</el-button>
  </div>
</template>

<script>
  import api from 'common/api.js'
  export default {
    data() {
      return {
          orderId:'',
          orderTotal:''
      }
    },
    methods: {
      getOrderDetail(){
        let params = {
          orderId:this.$route.query.orderId
        }
        api.get('/users/orderDetail',params).then(res=>{

        })
      },
      goCartPage(){
        this.$router.push('/cart')
      },
      goGoodsPage(){
        this.$router.push('/goodList')
      }
    },
    mounted() {
      this.orderId = this.$route.query.orderId
      this.orderTotal = sessionStorage.getItem('total')
      this.getOrderDetail()
    }
  }
</script>

<style>
</style>
