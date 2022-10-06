const bannermodel = require("../model/banner-model");
const multer = require('multer')

module.exports={

    addbanner:(bannerdata)=>{
        console.log("tttttttttttttttt");
        console.log(bannerdata);
        return new Promise((resolve,reject)=>{
        const banner =new bannermodel({
            bannername:bannerdata.bannername,
            image:bannerdata.image,
            description:bannerdata.description,
        })
        console.log("gfhjkl")
        console.log(banner);
        
        banner.save().then((banners)=>{
            console.log(banners);
            resolve(banners)
        })
       
    })

    },


    getbannerdata:(bannerID)=>{
      return new Promise(async(resolve,reject)=>{
        let response={}
        let banner = await bannermodel.find({}).lean()
        response.status
        response = banner
        resolve(response)

      })
    },


    getbannervalue:(bannerID)=>{
        return new Promise(async(resolve,reject)=>{
          let response={}
          let banner = await bannermodel.findOne({_id:bannerID}).lean()
          response.status
          response = banner
          resolve(response)
  
        })
      },

    deletebanner:(bannerID)=>{
        return new Promise(async(resolve,reject)=>{
             bannermodel.findByIdAndDelete({_id:bannerID}).then((response)=>{
                resolve(response)
             })

        })
    },


    updatebanner:(bannerID,bannerdetails)=>{
        console.log(bannerID);
        console.log("varunneee");
        console.log(bannerdetails);
        return new Promise(async(resolve,reject)=>{
            bannermodel.findByIdAndUpdate(bannerID,{bannername:bannerdetails.bannername,
            image:bannerdetails.image,description:bannerdetails.description
        }).then((response)=>{
            console.log("ghjsdfgklk");
            console.log(response);
            resolve(response)
        })
    })
    }

}