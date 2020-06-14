<template>
  <div>
    <h3 style="margin:20px;text-align: left;">订单明细</h3>
      <el-table
       :data="cartList"
       tooltip-effect="dark"
       style="width: 100%"
     >
        <el-table-column prop="productImage" label="产品图片" align="center">
        	<template slot-scope="scope">
        		<img :src="require(`../assets/${scope.row.productImage}`)" style="cursor: pointer;" v-if="scope.row.productImage" min-width="70" height="70" @click="openBigImg(scope.row.pictureUrl)" />
          </template>
        </el-table-column>
      <el-table-column prop="productName" label="产品名称" align="center">
      </el-table-column>

      <el-table-column prop="salePrice" label="价格" align="center">
      </el-table-column>
      <el-table-column prop="productNum" label="数量" align="center">
      </el-table-column>
      <el-table-column label="金额" prop="money" :formatter="$utils.moneyFormat"></el-table-column>
    </el-table>
   <div style="text-align: right;line-height: 30px;">
      <div>
       Item subtotal:{{subtotal}}
     </div>
     <div>
       Shipping:	{{shipping}}
     </div>
     <div>
        Discount:	{{discount}}
     </div>
     <div>
           Tax:	{{tax}}
     </div>
     <div>
       Order total:	{{total}}
     </div>
   </div>
  </div>
</template>

<script>
   import api from 'common/api.js'
   export default {
     data() {
       return {
         cartList: [],
         subtotal:0,
         shipping:100,
         discount:200,
         tax:40,
         total:0

       }
     },
     methods: {
       selectOne(index,item) {
           console.log(item)
           console.log(index)
           this.checkIndex = index

       },
       getCartList() {
         api.get('/users/cartList', {}).then(res => {
           let cartList = res.result
           cartList.forEach((item)=>{
             if(item.checked == '1'){
               this.cartList.push(item)
               this.subtotal += parseFloat(item.money)
               this.total = this.subtotal+this.discount+this.shipping+this.tax
               sessionStorage.setItem('total',this.total)
             }
           })
         })
       }
     },
     mounted() {
       this.getCartList()
     }
   }
</script>

<style>
</style>
