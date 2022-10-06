const adminModel = require('../model/admin-model')
const bcrypt = require('bcrypt');
 const userModel = require('../model/user-model');
 const { response } = require('../app');
const { reject } = require('bcrypt/promises');
const ordermodel = require('../model/ordermodel');
const async = require('hbs/lib/async');


module.exports={
    adminlogin:(adminlogindata)=>{
        
        return new Promise (async(resolve,reject)=>{
            let response ={
                adminnotfount:false,
                status:false
            }
            let admin = await adminModel.findOne({email:adminlogindata.email})
            if(admin){
                console.log(admin);
                console.log(adminlogindata);
                bcrypt.compare(adminlogindata.password,admin.password,(err,valid)=>{
                 if(valid){

                    response.status=true,
                    response.admin=admin,
                    response.email=admin.email;
                    resolve(response);
                    console.log("sucess");

                 }else{
                    console.log("wrong password");
                    resolve(response)
                    
                 }
                 if(err){
                    console.log("err fout at bcrypting",err);
                 }

                })



            }else{
                response.adminnotfound=true,
                resolve(response)
            }
        })
    },



getUserData: () =>{
    return new Promise(async (resolve,reject) =>{
    let users= await userModel.find({}).lean()
    console.log(users);
    resolve(users)
    })
},

//block ussr///////////////////////////////////////////
block_user: (id) =>{
    return new Promise(async (resolve,reject)=>{
        let user = await userModel.findById({_id: Object(id) })
        user.status = true
        await userModel.updateOne({_id: Object(id)}, user) 
        resolve('got it')
    })
       
    },

active_user: (id)=>{
    return new Promise(async (resolve,reject)=>{
      let user = await userModel.findById({_id: Object(id) })
      user.status= false
      await userModel.updateOne({_id: Object(id) }, user)
      resolve('its done')

    })

},
  stati:()=>{
    return new Promise(async(resovle,reject)=>{
      try{

        var dateArray =[]
        for(let i = 0;i<5;i++){
            var d = new Date();
            d.setDate(d.getDate()-i)
            var newdate = d.toISOString()
            // console.log(new Date());
            newdate = newdate.slice(0,10)
            dateArray[i] = newdate
        }
        console.log(dateArray,newdate,'jkjhkjhkjhkjh');
        // var Date = new Date()    

        var dateSale =[]
        // var date = new Date() 
        for(i = 0; i <5; i++){
            // dateSale[i] = await ordermodel.find({newdate:dateArray[i]}).lean().count()
            dateSale[i] = await ordermodel.find({newdate:dateArray[i]}).lean().count()
            console.log(   dateSale[i] ,"dateeeeeee");
        }
        var status = {
            dateSale:dateSale,
            dateArray:dateArray
        }
        resovle(status)
        } catch(error){
            console.log("error",error);
      }
    })
  }
    
}












