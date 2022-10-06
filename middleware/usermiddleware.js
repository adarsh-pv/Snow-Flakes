const userModel = require ('../model/user-model');
// const productController =require('../controllers/productController')
// const bannerrController = require('../controllers/bannerrController')
// const usercontroller = require('../controllers/userController')
// const categoryController = require('../controllers/categoryController')
// const cartController = require('../controllers/cartController')
// const wishlistController = require('../controllers/wishlistController')

module.exports = {
    isblocked: (req,res,next) =>{
        if(req.session.user){
            new Promise(async(resolve,reject)=>{
                let user= await userModel.findOne({email:req.session.email})
                resolve(user)
            }).then((user)=>{
                
                if(user.status){
                    res.render('user/blockeduser',{noheader:true})
                }else{
                    // res.sendStatus(404)
                    next()

                }
            })
        }else{
            next()

        }


    },
    
}