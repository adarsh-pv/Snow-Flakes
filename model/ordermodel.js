const mongoose = require('mongoose')
const Schema = mongoose.Schema
const orderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    OrderItems:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'products',
            
     }, 
         quantity:'number'
    }],

 
    totalprice:Number,
    deliverycharge:Number,
    
    deliverydetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'address'
    },
    paymentdetails:String,
    totaldicount:Number,
  discount:String,
  deliveystatus:String,
  productstatus:String,
  grandtotal:Number,
  coupendiscount:Number,
  orderstatus:Boolean,
  Date:String,
  InvoiceID:Number,
  totalmrp:Number,
  productdiscount:Number,
  newdate:String

},{timestamps:true})
const ordermodel = mongoose.model('orders',orderSchema)
module.exports = ordermodel