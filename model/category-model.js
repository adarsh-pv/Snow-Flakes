const mongoose=require('mongoose');

const categorySchema = new mongoose.Schema({
    image:{
        type:Array
       },
    categoryname:{
        type:String
    }
},{timestamps:true})

const categoryModel = mongoose.model('category',categorySchema)
module.exports = categoryModel;

