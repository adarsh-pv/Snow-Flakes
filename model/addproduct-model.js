const mongoose = require('mongoose')
const Schema = mongoose.Schema
const addproductSchema = new mongoose.Schema({
    productname:{
        type:String
    },
    price:{
        type:Number
    },
    discountprice:{
        type:Number
    },
    categoryname:{
        type:Schema.Types.ObjectId,
        ref:'category'
    },
    stock:{
        type:Number
    },
    image:{
        type:Array
    },
    MRP:{
      type:Number
    }
},{timestamps:true})

const productmodel =mongoose.model('products', addproductSchema)
module.exports=productmodel;

