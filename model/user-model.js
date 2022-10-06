const bcrypt=require("bcrypt");

const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    image:{
        type:String
    },
    name:String,
    email:String,
    phonenumber:Number,
    password:String,
    status:Boolean,
    verified:{
        type:Boolean,
        default:false,
    }
});

userSchema.pre('save',async function(next){
    try{
        const hash = await bcrypt.hash(this.password,10);
        this.password=hash;
        next();
    }catch(error){
        next(error);
    }
})
const userModel=mongoose.model('users',userSchema);

module.exports=userModel;