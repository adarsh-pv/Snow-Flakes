const mongoose = require('mongoose')

const addressSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    Name:{
       type:String
    },
    Lastname:{  
      type:String
    },
    Number:{
        type:'number'
    },
    Pincode:{
        type:'number'
    },
    Locality:{
        type:String
    },
    Housename:{
        type:String
    },
    State:{
        type:String
    },
    LandMark:{
        type:String
    }
    
})
const addressModel = mongoose.model('address',addressSchema)

module.exports = addressModel;