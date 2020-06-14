var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var Goods = require('../models/goods')
mongoose.connect('mongodb://127.0.0.1:27017/imoc')
mongoose.connection.on("connected",function(){
  console.log("success")
})
mongoose.connection.on("disconnected",()=>{
  console.log("disconnected")
})
//二级路由
router.get('/list',function(req,res,next){
  //res.send('hello goods')
  let page = parseInt(req.param("page"))
  let pageSize = parseInt(req.param("pageSize"))
  let sort = req.param("sort")
  let skip = (page-1)*pageSize
  let priceFilter = req.param("priceFilter");
 let priceGt = '',priceLte = '';
  let params = {}
  if(priceFilter!='all'){
    switch (priceFilter){
      case '0':priceGt = 0;priceLte=100;break;
      case '1':priceGt = 100;priceLte=500;break;
      case '2':priceGt = 500;priceLte=1000;break;
      case '3':priceGt = 1000;priceLte=5000;break;
    }
    params = {
      salePrice:{
          $gt:priceGt,
          $lte:priceLte
      }
    }
  }
  let goodsModel = Goods.find(params).skip(skip).limit(pageSize)
  goodsModel.sort({'salePrice':sort});
  goodsModel.exec((err,doc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message
      })
    }else{
      res.json({
        status:'0',
        msg:'',
        result:{
          count:doc.length,
          list:doc
        }
      })
    }
  })
})
//加入购物车
router.post('/addCart',(req,res,next)=>{
  let userId = req.cookies.userId,productId = req.body.productId
  let User = require('../models/users')
  User.findOne({userId:userId},(err,userDoc)=>{
    if(err){
      res.json({
          status:"1",
          msg:err.message
      })
    }else{
      if(userDoc){
        let goodsItem=''
        userDoc.cartList.forEach(item=>{
          if(item.productId == productId){ //如果加购的商品id，购物车表里面已经有了，那么就把这条数据存在goodsItem变量里
            goodsItem = item
            item.productNum++
            item.money = item.productNum*item.salePrice
          }
        })
        if(goodsItem){//如果加购的商品购物车已经存在这条数据了，就不重新创建数据了，只在原有基础上数量加加
          userDoc.save((err2,doc2)=>{
            if(err2){
              res.json({
                status:"1",
                msg:err2.message
              })
            }else{
              res.json({
                status:"0",
                msg:"",
                result:"success"
              })
            }
          })
        }else{
          //这种情况是加购的商品购物车里面没有这条数据，那么就需要创建
           Goods.findOne({productId:productId},(err1,doc)=>{
            if(err1){
              res.json({
                status:"1",
                msg:err1.message
              })
            }else{
              if(doc){
                doc.productNum = 1
                doc.checked = 1
                doc.money = doc.salePrice
                userDoc.cartList.push(doc) //往文档也就是数据库里面插入数据
                userDoc.save((err2,doc2)=>{ //保存数据
                  if(err2){
                    res.json({
                      status:"1",
                      msg:err2.message
                    })
                  }else{
                    res.json({
                      status:"0",
                      msg:"",
                      result:"success"
                    })
                  }
                })
              }
            }
          })
        }
      }
    }
  })
})
module.exports = router
