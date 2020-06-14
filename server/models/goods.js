var mongoose = require('mongoose')
var Schema = mongoose.Schema;
let productSchema = new Schema({
  "productId":String,
  "productName":String,
  "checked":String,
  "productNum":Number,
  "money":Number,
  "salePrice":Number,
  "productImage":String
})

module.exports = mongoose.model('Good',productSchema)
