var express = require('express');
var router = express.Router();
require('./../util/util')
var User = require('../models/users')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post("/login", (req, res, next) => {
  let param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  User.findOne(param, (err, doc) => {
    if (err) {
      res.json({
        status: "1",
        msg: err.message
      })
    } else {
      if (doc) {
        res.cookie("userId", doc.userId, {
          path: '/',
          maxAge: 1000 * 600 * 600
        })
        res.cookie("userName", doc.userName, {
          path: '/',
          maxAge: 1000 * 600 * 600
        })
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      }
    }
  })
})

//登出接口
router.post("/logout", (req, res, next) => {
  //保存cookie到浏览器
  res.cookie("userId", "", {
    path: "/",
    maxAge: -1
  })
  res.cookie("userName", "", {
    path: "/",
    maxAge: -1
  })
  res.json({
    status: "0",
    msg: "",
    result: "success"
  })
})

//购物车列表
router.get("/cartList", (req, res, next) => {
  let userId = req.cookies.userId
  User.findOne({
    userId: userId
  }, (err, doc) => {
    if (err) {
      res.json({
        status: "1",
        msg: err.message,
        result: ""
      })
    } else {
      if (doc) {
        res.json({
          status: "0",
          msg: "",
          result: doc.cartList
        })
      }
    }
  })
})

router.post("/cartDel", (req, res, next) => {
  let userId = req.cookies.userId,
    productId = req.body.productId;
  User.update({
      userId: userId
    }, {
      $pull: {
        "cartList": {
          'productId': productId
        }
      }
    }, (err, doc) => {
      if (err) {
        res.json({
          status: "1",
          msg: err.message,
          result: ""
        })
      } else {
        res.json({
          status: "0",
          msg: "",
          result: "success"
        })
    }
  })
})
//编辑购物车
router.post("/cartEdit",(req,res,next)=>{
  let userId = req.cookies.userId,
  productId = req.body.productId,
  checked = req.body.checked,
  productNum = req.body.productNum;
    User.findOne({userId:userId},(err,userDoc)=>{
      if(err){
        res.json({
            status:"1",
            msg:err.message
        })
      }else{
        let salePrice = ''
        userDoc.cartList.forEach(item=>{
          if(item.productId == productId){ //如果加购的商品id，购物车表里面已经有了，那么就把这条数据存在goodsItem变量里
             salePrice = item.salePrice
          }
        })
   User.update({"userId":userId,"cartList.productId":productId},{
    "cartList.$.productNum":productNum,
     "cartList.$.money":productNum*salePrice,
     "cartList.$.checked":checked
  },(err,doc)=>{
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:""
      })
    }else{
      let money = productNum*salePrice
          res.json({
         status:"0",
         mag:"",
         result:money
       })

      // console.log('doc============='+JSON.stringify(doc))

    }
  })
      }
  })

})
router.post("/editCheckAll",(req,res,next)=>{
  let userId = req.cookies.userId,
  checkAll = req.body.checkAll?'1':'0';
  User.findOne({userId:userId},(err,userDoc)=>{
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:""
      })
    }else{
      if(userDoc){
        userDoc.cartList.forEach(item=>{
          item.checked = checkAll
        })
        userDoc.save((err1,doc)=>{
          if(err1){
            res.json({
              status:"1",
              msg:err1.message,
              result:""
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
})

//查询用户地址借口
router.get("/addressList",(req,res,next)=>{
  let userId = req.cookies.userId;
  User.findOne({userId:userId},(err,doc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      res.json({
        status:'0',
        msg:'',
        result:doc.addressList
      })
    }
  })
})
//地址删除
router.post('/delAddress',(req,res,next)=>{
  let userId = req.cookies.userId,addressId = req.body.addressId;
  User.update({userId:userId},{
    $pull:{
      'addressList':{
        'addressId':addressId
      }
    }
  },(err,doc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      res.json({
        status:'0',
        msg:'',
        result:''
      })
    }
  })
})
//设置默认地址接口
router.post("/setDefault",(req,res,next)=>{
  let userId = req.cookies.userId,
  addressId = req.body.addressId;
  if(!addressId){
    res.json({
      status:'1003',
      msg:'addressId is null',
      result:''
    })
  }else{
    User.findOne({userId:userId},(err,doc)=>{
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        })
      }else{
        let addressList = doc.addressList;
        addressList.forEach(item=>{
          if(item.addressId == addressId){
            item.isDefault = true
          }else{
            item.isDefault = false
          }
        })
        doc.save((err1,doc1)=>{
          if(err){
            res.json({
              status:'1',
              msg:err.message,
              result:''
            })
          }else{
            res.json({
              status:'0',
              msg:'',
              result:''
            })
          }
        })
      }
    })
  }
})

//下单接口
router.post('/payMent',(req,res,next)=>{
  let userId = req.cookies.userId,
  addressId = req.body.addressId,
  orderTotal = req.body.orderTotal;
  User.findOne({userId:userId},(err,doc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:""
      })
    }else{
      let address = '',goodsList = []
      //获取当前用户的地址信息
      doc.addressList.forEach(item=>{
        if(addressId == item.addressId){
          address = item
        }
      })
      //获取用户购物车的购买商品
      doc.cartList.filter(item=>{
        if(item.checked == '1'){
          goodsList.push(item)
        }
      })
      let platform = '622'
      let r1 = Math.floor(Math.random()*10);//0-9的一个随机数，Math.floor是返回小于等于x的最大整数:
      let r2 = Math.floor(Math.random()*10);
      let sysDate = new Date().Format('yyyyMMddhhmmss')
      let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
      let orderId = platform+r1+sysDate+r2
      let order = {
        orderId:orderId,
        orderTotal:orderTotal,
        addressInfo:address,
        goodsList:goodsList,
        orderStatus:'1',
        createDate:createDate
      }
      doc.orderList.push(order);
      console.log('doc='+doc)
      doc.save((err1,doc1)=>{
          if(err1){
          res.json({
            status:'1',
            msg:err.message,
            result:""
          })
        }else{
          res.json({
            status:'0',
            msg:'',
            result:{
              orderId:order.orderId,
              orderTotal:order.orderTotal
            }
          })
        }
      })
    }
  })
})

//根据订单id查询订单信息
router.get('/orderDetail',(req,res,next)=>{
  let userId = req.cookies.userId,orderId = req.param("orderId")
  User.findOne({userId:userId},(err,userInfo)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      let orderList = userInfo.orderList
      if(orderList.length > 0){
        let orderTotal = 0;
        orderList.forEach(item=>{
          if(item.orderId = orderId){
            orderTotal = item.orderTotal
          }
        })
        if(orderTotal > 0){
          res.json({
            status:'0',
            msg:'',
            result:{
              orderId:orderId,
              orderTotal:orderTotal
            }
          })
        }else{
          res.json({
            status:'120002',
            msg:'无此订单',
            result:''
          })
        }
      }else{
        res.json({
          status:'120001',
          msg:'当前用户未创建订单',
          result:''
        })
      }
    }
  })
})
module.exports = router;
