<template>
  <div>
    <el-steps :active="active" finish-status="success">
      <el-step title="步骤 1"></el-step>
      <el-step title="步骤 2"></el-step>
      <el-step title="步骤 3"></el-step>
    </el-steps>
    <router-view />
    <el-button style="margin-top: 12px;" @click="next" v-if="isNextShow">下一步</el-button>

  </div>
</template>

<script>
  import api from 'common/api.js'
  export default {
    data() {
      return {
        active: 1,
        isNextShow:true
      }
    },
    methods: {
      next() {
        console.log(this.active)
        if (this.active++ > 3) this.active = 1;
        console.log(this.active)
        switch (this.active) {
          case 1:
             this.$router.push("/address" )
          case 2:
            this.$router.push("/orderConfirm?addressId="+sessionStorage.getItem('addressId') )
            break;
          case 3:
          let params = {
            addressId : sessionStorage.getItem('addressId'),
            orderTotal : sessionStorage.getItem('total')
          }
            api.post('/users/payMent',params).then(res=>{
              let orderId = res.result.orderId
              this.isNextShow = false
               this.$router.push("/orderSuccess?orderId="+orderId )
            })

            break;
        }
      }
    },
    mounted(){

      console.log(this.$route.path)
      if(this.$route.path.indexOf('orderConfirm') > 0){
        this.active = 2
      }else if(this.$route.path.indexOf('address') > 0){
        this.active = 1
      }
      console.log('actives='+this.active)
      if(this.$route.path.indexOf('orderSuccess') > 0){
        this.isNextShow = false
        this.active = 3
      }

    }
  }
</script>

<style lang="scss">
  .el-step__head.is-success{
        color: red;
        border-color: red;
}
</style>
