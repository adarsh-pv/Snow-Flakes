const moongoose = require('mongoose')
const Schema = moongoose.Schema
const bannerSchema =new moongoose.Schema({
   bannername:{
    type:String,
    require:true
   },
   image:{
    type:Array
   },
   description:{
      type:String,
   }

},{timestamps:true})
const bannermodel = moongoose.model('banner',bannerSchema)

module.exports = bannermodel;

