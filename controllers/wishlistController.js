const { promise } = require('bcrypt/promises');
const async = require('hbs/lib/async');
const wishlistmodel = require('../model/wishlist-Model')

module.exports={
    addwishlist:(userid,productid)=>{
        console.log(userid,"wishlist useriddd");
        console.log(productid,"wishlist prooos id");
        const response = {
            duplicate:false
        }
        return new Promise (async(resolve, reject)=>{
            try{
                let wishlist = await wishlistmodel.findOne({userId :userid})
                if(wishlist){
                    let wishproducts = await wishlistmodel.findOne({
                        userId :userid,
                        "Wishlistdata.productId" : productid
                    })
                    console.log(wishlist,"iiiiiiiiiiiiiiiii");
                    if(wishproducts){
                        // wishlist.updateOne(
                        //     {userId : userid, "Wishlistdata.productId" : productid}
                    // ).then((response)=>{
                            response.duplicate = true;
                            resolve(response)
                        } else {
                            let wishArry = { productId : productid };
                            wishlistmodel.updateOne({userId : userid},{ $push  :{Wishlistdata: wishArry }
                            }).then((response)=>{
                                console.log(response.duplicate,"kkkkkkkkkk");
                                resolve(response)
                            });
                        } 
                    
                     
                    }else {
                        let wishlistobj  = new wishlistmodel({
                            userId : userid,
                            Wishlistdata:[{productId:productid}],
                        })
                        wishlistobj.save().then((response)=>{
                            console.log("wishlist response",response);
                            resolve(response)
                        }).catch((err)=>{
                            console.log("error",err);
                        })

                        }
                        
                    }catch (error){
                        reject(error)
                        }
                    })
                    
                    
                    },
                
                
                 
                

    additems:(userid)=>{
        try{
        return new Promise(async(resolve, reject)=>{
            const response={}
            wishlistmodel.findOne({userId : userid}).populate('Wishlistdata.productId').lean().then((list)=>{
                console.log("babbbbb",list);
                   if(list){
                    if(list.Wishlistdata.length >0){
                        response.wishlistempty = false;
                        response.list = list
                        resolve(response)
                    }else{
                        response.wishlistempty = true
                        response.list = list
                        resolve(response)
                    }
                   }else{
                    response.wishlistempty = true
                    resolve(response)
                   }
            })
        })
    }catch(error){
        reject(error)
    }
    },

    deleteitem:(userid,productid)=>{
            return new Promise(async(resolve,reject)=>{
                try{
      await wishlistmodel.updateOne({userId : userid},
        {$pull:{Wishlistdata:{productId : productid}}
    }).then((response)=>{
        resolve(response)
    })
    }catch(err){
        reject(err)
    }
        })
    },
    itemcount:(userid)=>{
        return new Promise(async(resolve,reject)=>{
            let count = 0
            let items = await wishlistmodel.findOne({userId: userid})
            if(items){
                count = items.Wishlistdata.length

            }
            console.log(count,"tharaaaaaa");
            resolve(count)
        })
    }






            }