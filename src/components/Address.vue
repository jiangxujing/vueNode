<template>
  <div class="address">
    <div>收件地址</div>
    <div style="overflow: hidden;">
      <div class="address-list" v-for='(item,index) in addressList' :key="index" @click="selectOne(index,item)" :class="{'active':checkIndex == index}" @mouseover="hoverDefault(index)"   @mouseout="outStyle()">
        <div>{{item.userName}}</div>
        <div>{{item.streetName}}</div>
        <div style="overflow: hidden;padding-top:20px">
          <div style="float:left">
            <div>{{item.tel}}</div>
            <div v-if="item.isDefault">默认地址</div>
            <div v-if="!item.isDefault && setDefaultIndex == index" @click="setDefault(item)">设置默认</div>
          </div>
          <img style="float:right" src="../assets/del.jpg" @click="del(item)"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import api from 'common/api.js'
  export default {
    data() {
      return {
        active: 0,
        addressList: [],
        checkIndex:-1,
        setDefaultIndex:-1
      }
    },
    methods: {
      hoverDefault(index){
        this.setDefaultIndex = index
      },
      del(item){
        let params = {
          addressId:item.addressId
        }
        api.post('/users/delAddress',params).then(res=>{
          if(res.status == 0){
            this.getAddressList()
          }
        })
      },
      outStyle(){
        //this.setDefaultIndex = -1
      },
      setDefault(item){
        console.log(item)
        let params = {
          addressId : item.addressId
        }
        api.post('/users/setDefault',params).then(res=>{
            if(res.status == 0){
              this.getAddressList()
            }
        })
      },
      selectOne(index,item) {
          console.log(item)
          console.log(index)
          this.checkIndex = index
          this.addressId = item.addressId
          sessionStorage.setItem('addressId',this.addressId)

      },
      next() {
        if (this.active++ > 2) this.active = 0;
      },
      getAddressList() {
        api.get('/users/addressList', {}).then(res => {
          this.addressList = res.result
          this.addressList.forEach((item,i)=>{
            console.log(item)
            console.log(i)
            if(item.isDefault){
              this.checkIndex = i
              this.addressId = item.addressId
              sessionStorage.setItem('addressId',this.addressId)
            }
          })
        })
      }
    },
    mounted() {
      this.getAddressList()
    }
  }
</script>

<style lang="scss">
  .address {

    .address-list {
      padding: 30px;
      text-align: left;
      width: 23%;
      height: 166px;
      border: 1px solid #ccc;
      margin-right: 15px;
      margin-top: 15px;
      float: left;
    }

    .active,.active-default {
      border: 1px solid red;
    }
  }
</style>
