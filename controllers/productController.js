const productmodel = require("../model/addproduct-model")
const multer = require('multer')
const upload = multer({ dest: "public/productimage" });
const { router } = require("../app");
const ordermodel = require("../model/ordermodel");






module.exports={


    

    addproduct:(productData)=>{
        console.log(productData);
        console.log("sghghgdf");
        return new Promise((resolve,reject)=>{
         products= new productmodel({
         productname:productData.productname,
         discountprice:productData.discountprice,
         categoryname:productData.catname,
         stock:productData.stock,
         image:productData.image,
         MRP:productData.mrp,
         price:productData.mrp - productData.discountprice
         
        }) 
        // console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjj");
        // console.log(productData.categoryname);
        products.save().then((data)=>{
            console.log("lalaaa");
            

            resolve(data)
        })
    })

    },

    deleatproducts(productID){
        return new Promise(async(resolve,reject)=>{
            productmodel.findByIdAndDelete({_id:productID}).then((response)=>{
                
            
                resolve(response)
            })
        })

    },

    getPoductdetails:()=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
          let product = await productmodel.find({}).populate("categoryname").lean()
         
          response.status;
          response.data=product;
          resolve(response)
        }) 
    },


    getlatestproduct:()=>{
           return new Promise(async(resolve,reject)=>{
            let products = await productmodel.find().sort({createdAt:-1}).lean()
            let arr = []
            for(i=0;i<3;i++){
                arr[i] = products[i]
            }
            resolve(arr)
           })
    },
    // getPoductdetails:(productID)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let response={}
    //       let product = await productmodel.find().populate("categoryname").lean()
         
    //       response.status;
    //       response.data=product;
    //       resolve(response)
    //     }) 
    // },
    getPoductvalue:(productID)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
          let product = await productmodel.findOne({_id:productID}).populate("categoryname").lean()
         
          response.status;
          response.data=product;
          console.log("ushafuafjskk");
          console.log(response);
          resolve(response)
         
        }) 
    },

    updateProduct:(productID,productDetails)=>{
         return new Promise(async(resolve,reject)=>{
            
            console.log("huuuuuuuuuuuuuuuuuuuuu");
             console.log(productID);
             console.log(productDetails);
             productmodel.findByIdAndUpdate(productID,{productname:productDetails.productname,
            price:productDetails.price,
            discountprice:productDetails.discountprice,
            categoryname:productDetails.categoryname,            
            stock:productDetails.stock,
            image:productDetails.image,
            MRP:productDetails.mrp,
            // image:<img 
        }).then((response)=>{   
            resolve(response)
            })
        })
         
    },

   productlist:(productID)=>{
    return new promise(async(resolve,reject)=>{
       let response = {}
       let listproduct = await productmodel.find({}).lean()
       response.status;
       response = listproduct,
       resolve(response)
    })
   },

   getBycategory:(categoryid)=>{
          return new Promise(async(resolve,reject)=>{
            try{
                let products = await productmodel.find({categoryname:categoryid}).lean()
                resolve(products)
                console.log(products,"category based products");
            }catch{
                reject(error)

            }
          })
   },
   checkcategory:(categoryid)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            let products = await productmodel.find({categoryname:categoryid}).lean()
            console.log(products,"productis heree");
    
            resolve(products)
        }catch(err){
            reject(err)
        }
        
    })
   },
   

   







}



