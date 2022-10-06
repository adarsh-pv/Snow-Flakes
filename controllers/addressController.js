const { promise } = require('bcrypt/promises');
const async = require('hbs/lib/async');
const { response } = require('../app');
const productmodel = require('../model/addproduct-model');
const addressmodel = require('../model/address-model');
const ordermodel = require('../model/ordermodel');
const { cartcount } = require('./cartController');
const categoryController = require('./categoryController');
const productController = require('./productController');


module.exports = {
      addaddress:(addressdata,userid)=>{
        console.log(userid,"userid");
        return new Promise(async(resolsve,reject)=>{
           const address = new addressmodel({
                Name:addressdata.name,
                Lastname:addressdata.lastname,
                Number:addressdata.number,
                Pincode:addressdata.pincode,
                Locality:addressdata.locality,
                Address:addressdata.address,
                State:addressdata.state,
                LandMark:addressdata.landmark,
                Housename:addressdata.housename,
                userId:userid
            })
            address.save().then((address)=>{
                resolsve(address)
                console.log(address);
            })
        })

      },
     
      getadderss:(userid)=>{
         return new Promise(async (resolve,reject)=>{
          let useraddress = await addressmodel.find({userId:userid}).lean()
          // let product = await cartController
          //  let address = await addressmodel.find({}).lean()
        //    response = address
           resolve(useraddress)
            })
      },

      //--------------------------

      getadderssvalue:(userid)=>{
        return new Promise(async (resolve,reject)=>{
         let useraddresses = await addressmodel.findOne({_id:userid}).lean()
         // let product = await cartController
         //  let address = await addressmodel.find({}).lean()
       //    response = address
       console.log("mujeeeee");
          resolve(useraddresses)
           })
     },

     editaddress:(userdata,addressid)=>{
      console.log(userdata,"jabaaaaaaa");
      console.log(addressid);
      return new Promise(async(resolve,reject)=>{
       await  addressmodel.findByIdAndUpdate(addressid,{Name:userdata.name,
        Lastname:userdata.lastname,
        Number:userdata.number,
        Pincode:userdata.pincode,
        Locality:userdata.locality,
        State:userdata.state,
        LandMark:userdata.landmark,
        Housename:userdata.housename
      }).then((response)=>{
        console.log(userdata.lastname)
        console.log(response,"responseeeeeeeee")
        resolve(response)
      })
      })
     },

     deleateaddress:(addressid)=>{
      return new Promise(async(resolve,reject)=>{
        addressmodel.findByIdAndDelete({_id:addressid}).then((response)=>{
          resolve(response)
        })
      })
     },

    






}