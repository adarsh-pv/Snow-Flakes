const userModel = require('../model/user-model');
const { checkout } = require('../routes/admin');
const dotenv = require('dotenv')
dotenv.config({path:"./config.env"})

let config = {
    serviceid: process.env.serviceid,
    accountSID: process.env.accountSID,
    authToken: process.env.authToken
};


const client = require('twilio')(config.accountSID, config.authToken);

module.exports={
    getOtp : (number)=>{
        return new Promise(async (resolve,reject)=>{
            let user = await userModel.findOne({phonenuumber:number});
            let response ={}

            if(user){
                response.exist = true;
                if(!user.ActiveStatus) {
                     client.verify.v2.services(config.serviceid).verifications.create({
                        to:'+91'+ number,
                        channel: "sms"
                     })
                     .then((data)=>{
                        console.log("response",data);
                        response.data = data;
                        response.user = user;
                        response.email = user.email = user.email,
                        response.ActiveStatus = true;
                        resolve(response)
                     }).catch((err)=>{
                        console.log("ERROR FOUND AT VERIFICATIION"),

                        reject(err)
                     })
                } else {
                    response.userBlocker = true;
                    resolve(response)
                }
            } else {
                response.exist = false,
                resolve(response)
            }

        })

        
    },


  checkOut: (otp , number)=>{   
    let phonenuumber = "+91" + number;
    return new Promise((resolve,reject)=>{
        client.verify.v2.services(config.serviceid).verificationChecks.create({
            to: phonenuumber,
            code: otp
        }).then((verification_check) => { 
            console.log(verification_check);    
        
        console.log("verification success");
        resolve(verification_check.status)
    }).catch((err) => {
        console.log("error",err);
    })

});


  }
  



}