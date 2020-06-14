<template>
  <div class="Cart">
    <nav-bread>
      <span style="color:#FF5940">My Cart</span>
    </nav-bread>
      <el-table
       :data="cartList"
       tooltip-effect="dark"
       style="width: 100%"
     >
   <!--   <el-table-column label="" label-class-name="scene-condition">
          <template slot-scope="scope">
            {{scope.row.checked}}
            <el-checkbox @change="changeSelect(scope.row)" v-model="checked"></el-checkbox>
          </template>
        </el-table-column> -->
        <el-table-column align="center" label="全选" width="76">
          <template slot-scope="scope">
                <el-checkbox  :checked="scope.row.checked == 1" @change="selectChange(scope.row)" v-model="scope.row.checked"></el-checkbox>
          </template>
 </el-table-column>
      <el-table-column prop="productName" label="产品名称" width="180" align="center">
      </el-table-column>
      <el-table-column prop="salePrice" label="价格" width="180" align="center">
      </el-table-column>
      <el-table-column prop="productNum" label="数量" width="180" align="center">
        	<template slot-scope="scope">
              <el-input-number v-model="scope.row.productNum" @change="handleChange(scope.row)" :min="1" :max="10" label="描述文字"></el-input-number>
      	</template>
      </el-table-column>
      <el-table-column label="金额" prop="money" :formatter="$utils.moneyFormat"></el-table-column>
      <el-table-column fixed="right" label="操作" width="100" align="center">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="deleteCart(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="text-align: left;display: flex;padding-top: 20px;">
       <div style="flex:1">
         <el-checkbox v-model="checkAllFlag" @change="selectAll"></el-checkbox>
         <span>全选</span>
       </div>
       <div style="flex:1">订单总金额：{{$utils.formatMoney(totalPrice,1)}}</div>
       <div style="flex:1">
         <el-button type="primary" @click="goAddress">结算</el-button>
       </div>
    </div>
  </div>
</template>

<script>
  import NavBread from '../components/NavBread'
  import api from "../common/api.js";
  import Vue from "vue";
  import {
    Message,
    MessageBox
  } from 'element-ui'
  export default {
    components: {
      NavBread
    },
    name: 'Cart',
    data() {
      return {
        cartList: [],
        num: 1,
        money:''        //checkAllFlag:false//这里用做计算属性就可以删除掉了
      }
    },
    computed:{
      checkAllFlag(){
        //把计算属性得到的选中的个数与购物车的数量做比较，如果相等，那么就是全选了，checkAllFlag就为true,否则就为false
        return this.checkedCount == this.cartList.length
      },
      //计算选中的个数
      checkedCount(){
        let i = 0
        this.cartList.forEach(item=>{
          if(item.checked == '1')i++
        })
        return i
      },
      totalPrice(){
        let money = 0
        this.cartList.forEach(item=>{
          if(item.checked == '1'){
            money += item.salePrice*item.productNum
          }
        })
        return money
      }
    },
    methods: {
      goAddress(){
        this.$router.push('/address')
      },
      selectChange(rows){
        let params = {
          productId:rows.productId,
          productNum:rows.productNum,
          checked:rows.checked == false?'0':'1'
        }
        api.post("/users/cartEdit",params).then(res=>{
          console.log(res.result)
        })
      },
      handleChange(rows) {
        console.log(rows)
        let params = {
          productId:rows.productId,
          productNum:rows.productNum,
          checked:rows.checked == false?'0':'1'
        }
        api.post("/users/cartEdit",params).then(res=>{
        })
      },
     selectAll(){
        //this.checkAllFlag = !this.checkAllFlag
        let flag = !this.checkAllFlag
         this.cartList.forEach(item=>{
           item.checked = flag
         })
         let params = {
           checkAll:this.checkAllFlag
         }
         api.post('/users/editCheckAll',params).then(res=>{

         })
     },
      deleteCart(rows) {
        let params = {
          productId: rows.productId
        }
        api.post('/users/cartDel', params).then(res => {
          if (res.status == '0') {
            this.$message({
              type: 'info',
              message: '删除成功'
            });
            this.getCartList()
          }
        })
      },
      getCartList() {
        api.get('/users/cartList', {}).then(res => {
          this.cartList = res.result
        })
      }
    },
    mounted() {
      this.getCartList()
    }

  }
</script>

<style lang="scss">
.el-input-number{
  width: 130px;
}
</style>
