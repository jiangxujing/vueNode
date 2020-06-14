<template>
  <div class="goodlist">
   <el-breadcrumb separator="/">
      <el-breadcrumb-item>Home</el-breadcrumb-item>
      <el-breadcrumb-item><a href="javascript:;">goods</a></el-breadcrumb-item>
    </el-breadcrumb>
    <div class="sort-style" @click="sortByPrice" style="cursor: pointer;">
      <span>sort by:</span>
      <span>price</span>
      <img src="../assets/arrowD.png" style="width:10px" v-if="dropShow"/>
     <img src="../assets/arrowT.png" style="width:10px" v-else/>
    </div>
    <div style="overflow: hidden;width:100%;display: flex;">
      <div class="price-left">
        <div style="margin-top:30px">
          PRICE:
        </div>
        <div @click="selectAll" :class="{'active':selectIndex<0}" style="cursor: pointer;">
          ALL
        </div>
        <div style="cursor: pointer;" v-for="(p,index) in priceFilter" :key="index" @click="selectPrice(index)" :class="{'active':selectIndex == index}">
          {{p.startPrice}}-{{p.endPrice}}
        </div>
      </div>
      <div class="product-right">
         <ul style="overflow: hidden;width:100%">
            <li class="product" v-for="(l,index) in goodsList" :key="index">
           <img :src="require(`../assets/${l.productImage}`)"/>
             <div>{{l.productName}}</div>
             <div>{{l.salePrice}}</div>
              <el-button type="danger" @click="addCart(l.productId)">加入购物车</el-button>
           </li>
         </ul>
      </div>
    </div>
     <div class="view-more-normal"
         v-infinite-scroll="loadMore"
         infinite-scroll-disabled="busy"
         infinite-scroll-distance="20">
          <img src="../assets/loading-spinning-bubbles.svg" v-show="loading">
    </div>
    <!--  <nav-bread>
      <span slot="A">product</span>
      <span slot="B">good</span>
    </nav-bread> -->
  </div>
</template>

<script>
  //import NavBread from 'components/NavBread'
  import axios from 'axios'
 import api from "../common/api.js";
 import Vue from "vue";
 import { Message, MessageBox } from 'element-ui'
  export default {
    name: 'parent',
    // components:{
    //   NavBread
    // },
    data() {
      return {
        goodsList:[],
        busy:true,
        loading:false,
        priceFilter:[
          {
            startPrice:'0.00',
            endPrice:'100.00'
          },{
            startPrice:'100.00',
            endPrice:'500.00'
          },{
            startPrice:' 500.00',
            endPrice:'1000.00'
          },{
            startPrice:'1000.00',
            endPrice:'5000.00'
          }
        ],
          selectIndex:-1,
          page:1,
          pageSize:8,
          sortFlag:true,
          dropShow:true,
          priceLevel:'all'

      }
    },
    methods: {
      addCart(id){
        console.log(id)
        let params = {
          productId:id
        }
        api.post('goods/addCart',params).then(res=>{
          console.log(res)
          if(res.status == '0'){
            this.$message({
              type: 'info',
              message: '加入购物车成功~'
            });
          }else{
            this.$message({
              type: 'info',
              message: res.msg
            });
          }
        })
      },
      getGoodList(flag) {
        let param = {
          page:this.page,
          pageSize:this.pageSize,
          sort:this.sortFlag?1:-1,
          priceFilter:this.priceLevel
        }
        api.get('/goods/list',param).then(res => {
             if(res.status=="0"){
               //this.goodsList = res.result.list;
            if(flag){
                this.goodsList = this.goodsList.concat(res.result.list);
                if(res.result.count==0){
                    this.busy = true;
                }else{
                  if(res.result.count < this.pageSize){
                    this.busy = true;
                  }else{
                    this.loading = true
                      this.busy = false;
                  }
                }
            }else{
                this.goodsList = res.result.list;
                this.busy = false;
            }
          }else{
            this.goodsList = [];
          }
          console.log(this.goodsList)
        }).catch(()=>{
          console.log("系统异常")
        })
       },
      loadMore(){
         this.busy = true;
         this.loading = false
         console.log('执行到这里了吗')
         setTimeout(() => {
           this.page++
           this.getGoodList(true);
         }, 500);
     },
       sortByPrice(){
        this.sortFlag = !this.sortFlag
        this.dropShow = !this.dropShow
        this.page = 1

        this.getGoodList()
       },
       selectAll(){
          this.selectIndex = -1
           this.priceLevel = 'all'
           this.page = 1
            this.getGoodList()
       },
       selectPrice(index){
         console.log(index)
       this.priceLevel = index
         this.selectIndex = index
         this.page = 1
          this.getGoodList()
       }
    },
    mounted() {
      this.getGoodList()
    }
  }
</script>

<style>
    .el-breadcrumb {
      line-height: 30px;
      padding-left: 30px;
    }
    .active{
      color:#FF5940;
    }
    .sort-style {
      width: 100%;
      height: 45px;
      background: #eee;
      line-height: 45px;
      text-align: right;
      padding-right: 15px;
    }
    .price-left{
      width:200px;
      background: pink;

    }
    .price-left div{
      height: 45px;
    }
    .product-right{
         flex:1;
    }
     .product-right .product{
      width:20%;
      height: 40%;
      border:1px solid #eee;
      float:left;
      padding-right:10px;
      margin-top:30px;
    }
     .product-right .product img{
      width:100%;
    }
</style>
