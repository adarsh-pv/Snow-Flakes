const userModel=require('../model/user-model');
const multer = require('multer')
const bcrypt=require('bcrypt');
const { response } = require('../app');
const async = require('hbs/lib/async');
const { reject, promise } = require('bcrypt/promises');
const { Promise } = require('mongoose');
const Helpers = require('./cartController');

module.exports={
    userlogin:(logindata)=>{
        return new Promise(async (resolve,reject)=>{
            let response={
                status:false,
                usernotfound:false
            }
            let user=await userModel.findOne({email:logindata.email});
            if(user){
                console.log(user);
                console.log(logindata);
                bcrypt.compare(logindata.password,user.password,(err,valid)=>{
                    if(valid){
                        response.status=true;
                        response.user=user;
                        response.email=user.email;
                        resolve(response);
                        console.log('success');
                    }else{
                       
                       console.log('wrong password')
                        resolve(response);
                    }
                    if(err){
                        console.log('error found while bcrypt ',err);
                    }
                })
            }else{
                response.usernotfound=true;
                resolve(response);
            }
        })
    },
    usersignup:(userdata)=>{
        return new Promise(async (resolve,reject)=>{
            let user=await userModel.findOne({email:userdata.email});
            const state={
                userexist:false,
                user:null
            }
            if(!user){
                // userdata.password= await bcrypt.hash(userdata.password,10);
                console.log(userdata.password);
                userModel.create(userdata).then((data)=>{
                    console.log(data);
                    state.userexist=false;
                    state.user=userdata;
                    state.email=userdata.email;
                    //state.phone=userdata.phonenumber;
                    resolve(state);
                })
            }else{
                state.userexist=true;
                resolve(state);
            }
        })
    },
   updateuserverify: (phone)=>{
    return new Promise (async(resolve,reject)=>{
        let response={status:true}
   await userModel.findOneAndUpdate({phonenumber:phone},{verified:true}).then(()=>{
    response.status=true; 
    resolve(response)
   })
  
    })
   },

   getuserdata:(userid)=>{
       return new Promise (async(resolve,reject)=>{
        let user =await userModel.findById({_id:userid}).lean()
        console.log(user,"userin profile")
        resolve(user)
       })
   },

   getuserdatas:()=>{
    return new Promise (async(resolve,reject)=>{
     let user =await userModel.find().lean()
     console.log(user,"userin profile")
     resolve(user)
    })
},

  updateuserdetails:(userid,userdata,image)=>{
    console.log(image);
    console.log(userdata,"suerdata");
   return new Promise(async(resolve,reject)=>{
    if(image){
        let users = await userModel.findByIdAndUpdate(userid,{name:userdata.Name,email:userdata.Email,image:image},{new:true}).lean()
    console.log(users,"update userdetails");
    resolve(users)

    }else{
        let user = await userModel.findByIdAndUpdate(userid,{name:userdata.Name,email:userdata.Email},{new:true}).lean()
   resolve(user)
    }
   })
  },

  changepassword:(userid,userdata)=>{
   
    let response = null;
  return new Promise(async(resolve,reject)=>{    
        try{
          
            let alreadyPassword =  await userModel.findOne({_id:userid})
             bcrypt.compare(userdata.oldpassword,alreadyPassword.password,async(err,valid)=>{
                if(valid){
                     console.log(valid,"thimmissss");
               let newpassword = await bcrypt.hash(userdata.newpassword,10)
                 console.log(newpassword,"new one");
                userModel.findByIdAndUpdate(userid,{password:newpassword}).then((response)=>{
                     console.log(response,"response aadaa");
                     response = true;
                     resolve(response)
                     console.log('successinfooo');
                  })
                }else{
                   
                    console.log('wrong password',err)
                    response= false;
                    resolve(response)
    
                 }
            })
            // console.log(alreadyPassword.password,"jimmmmmmmmmm");
    //         let upcomingpassword =await  bcrypt.hash(userdata.oldpassword,10)
    //         console.log(upcomingpassword,"upcomingg");
    //    let result =  await bcrypt.compare(userdata.password,alreadyPassword.password)
    //         console.log("camparison",result);

            // if(result){
            //    response.passwordexist = true
            //    console.log("aaaaaaaaa ",response)
            //    let newpassword =await  bcrypt.hash(userdata.newpassword,10)
            //     console.log("rrrrrrrrrrr ",newpassword)
            //      userModel.findByIdAndUpdate(userid,{password:newpassword}).then((response)=>{
            //         console.log("last ",response)
            //         resolve(response)
            //     })
            //    resolve(response)
            // }
            // else{
            //     response.passwordexist = false
            //     console.log("failed",response)
                
            // }
        // })
        }catch(error){
            reject(error);
        }
    })

  },


//   addImage:(userid,userdata)=>{
//     console.log(userdata,"ushhhhh");
//     console.log(userdata.filename,'file');
//     return new Promise((resolve,reject)=>{
//     //     console.log('hiii');
//     //   let image = new userModel({
//     //     image:userdata.filename      
//     //   })
//     //   console.log(image,"image is here");
//     //   image.save().then((Image)=>{
//     //     console.log(Image,"data must be consoled");
//         // resolve(Image)
//         userModel.findByIdAndUpdate(userid,{})
//       })
    // })
//   }
  

//    getuserdata:(userid)=>{
//         return new Promise(async(resolve,reject)=>{
     
//      let userid =await userModel.findOne(resolve.session._id).lean()
//      console.log("userid",userid);
//      resolve(userid)
//         })
//    }
}