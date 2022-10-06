const mongoose = require('mongoose')
const Schema = mongoose.Schema
const CoupenSchema = new mongoose.Schema({
    userId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    }],
    Coupenname:{
        type:String
    },
    CoupenCode:{
        type:String
    },
    Discountprice:{
        type:'number'
    },
    Coupenlimit:{
        type:'number'
    },
    Date:{
        type:'String'
    }

})
const coupenmodel = mongoose.model('coupen',CoupenSchema)

module.exports = coupenmodel