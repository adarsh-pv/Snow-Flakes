const Razorpay= require('razorpay');
const ordermodel = require('../model/ordermodel');
const dotenv = require('dotenv')
dotenv.config({path:"./config.env"})


    var instance = new Razorpay({
        key_id:process.env.key_id,
        key_secret:process.env.key_secret,
      });
    
module.exports={
    
      
  generaterazorpay:(orderid,totlamount)=>{
        console.log(totlamount,"totalllllllllllllll")
        return new Promise((resolve,reject)=>{
            var options = {
                
                amount:totlamount*100,
        
              currency: "INR",
              receipt: ''+orderid
            };
            instance.orders.create(options, function(err, order) {
              console.log(order,"yourrr order");
              resolve(order)
            });
          })
    
      },
      verifypayment:(details)=>{
        return new Promise((resolve,reject)=>{
            try{
                const crypto = require('crypto');
                let hmac = crypto.createHmac('sha256',instance.key_secret);
                let body =details.payment.razorpay_order_id +"|"+ details.payment.razorpay_payment_id;
                console.log(body,'this is body');
                hmac.update(body.toString());
                hmac=hmac.digest('hex')
                if(hmac===details.payment.razorpay_signature){
                  resolve()
                }else{
                  console.log('thsi is tha 1')
                  reject()
                }
              }catch(error){
              console.log(details,'ths is details///////////');
              console.log('thsi is tha 2');

                reject(error)
            }
        })
      },

      changepaymentstatus:(orderid)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                await ordermodel.findOneAndUpdate({_id:orderid},{orderstatus:true,deliveystatus:'success'}).then((response)=>{
                    resolve(response)
                })
            }catch(error){
                reject(error)
            }
        })
      },

    
    
}

 

