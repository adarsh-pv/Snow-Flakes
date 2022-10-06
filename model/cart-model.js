const mongoose = require('mongoose')

const doc = new mongoose.Schema({
userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users',
    require:true
    
},
Cartdata:[{
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'products',
        require:true 
 }, 
     quantity:'number'
}]
},{timestamps:true})

const cartmodel = mongoose.model('carts',doc)
module.exports = cartmodel;

