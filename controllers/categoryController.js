const { reject } = require("bcrypt/promises");
const { response } = require("../app");
const productmodel = require("../model/addproduct-model");
const categoryModel = require("../model/category-model");
const { populate } = require("../model/user-model");

module.exports={

    addcategoryDate:(categorydata)=>{
        console.log(categorydata,"cateeeggooorryyy");
        return new Promise(async (resolve,reject)=>{

            const category = await categoryModel.findOne({categoryname: categorydata.categoryname}).lean()
            console.log(category,'!!!!!!!!!!!!!!!!!!');
            let response = {
                exist:false,
            }
            if(!category){
                categoryModel.create(categorydata).then((data)=>{
                     response.exist = true;
                     response.category =categorydata;
                     console.log(resolve,"exist resolvee");

                     resolve(response);
                }).catch((err)=>{
                    console.log("error at creating",err);
                    resolve(err);
                })
            }else{   
                response.exist =false;
                response.category= categorydata;
                console.log(resolve,"false");

                resolve(response)
            }
        })
    },

        getcategory: () =>{
    try{
    return new Promise(async(resolve,reject)=>{
        const categoryname = await categoryModel.find().lean()
        console.log("ffffffffffffffffffffff");
        console.log(categoryname);
        resolve(categoryname)

    })
}catch(error){
    reject(error)
}
},

   
deletecategory: (categoryid) =>{
    return new Promise(async(resolve,reject)=>{
        categoryModel.findByIdAndDelete({_id:categoryid}).then((response)=>{
            resolve(response)
        })
    })
},

getcategorydata: (categoryid)=>{
    return new Promise(async(resolve,reject)=>{
        const category=await categoryModel.findOne({_id:categoryid}).lean()

      resolve(category)
    })
},

updatecategory:(categoryid,categoryDetails)=>{
    console.log(categoryDetails,"details of category");
    return new Promise((resolve,reject)=>{
        try{
        categoryModel.findByIdAndUpdate(categoryid,{categoryname:categoryDetails.categoryname,image:categoryDetails.image}).then((response)=>{
            console.log(response);
        resolve(response)
    })
}catch(err){
    reject(err)
}

})
},
getcategoryinsingle:(data)=>{
    return new Promise (async(resolve,reject)=>{
        console.log(data,"maybe get data");

        let cat =await categoryModel.find({categoryname:data})
           let category = cat[0]._id
             let products = await productmodel.find({categoryname:category}).lean()
             console.log(products,"pppppppppp");
             resolve(products)
    })
 
}



}

