let express = require('express');
const router = express.Router();
const mongoose=require('mongoose');
const adminContrller = require('../controllers/adminContrller');
const categoryController = require('../controllers/categoryController');
const adminModel = require('../model/admin-model')
const path = require('path')
const multer = require('multer')

const productmodel = require("../model/addproduct-model");
const productController = require('../controllers/productController');
const { response } = require('../app');
const { resolve } = require('path');
const bannerrController = require('../controllers/bannerrController');
const bannermodel = require('../model/banner-model');
const cartController = require('../controllers/cartController');
const usercontroller = require('../controllers/userController');


let verifylogin=(req,res,next)=>{
  if(req.session.admin){
    next()
    }else{
      res.redirect('/admin')
    }
  }

/* GET users listing. */

// const storage = multer.diskStorage({

//   destination : (req,file,cb)=>{
//     cb(null,"public,king")
//   },
//   filename:(req,file,cb)=>{
//     console.log(file);
//     cb(null,Date.now()+path.extname(file.originalname))
//   }
// })
// const upload = multer({ storage:storage });
// // const uploads =  multer({
// //   storage
// // });
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `files/admin-${file.fieldname}-${Date.now()}.${ext}`);
  },
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "jpeg" || file.mimetype.split("/")[1] === "png" || file.mimetype.split("/")[1] === "jpg" || file.mimetype.split("/")[1] === "webp" || file.mimetype.split("/")[1] === "svg") {
    cb(null, true);
  } else {
    cb(new Error("Not a image File!!"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});


router.get('/', function(req, res, next) {
  if(req.session.admin){
    let admin=req.session.admin;
    
    console.log(admin);
    // console.log( cancelled,"income id her for admi");
  
  res.redirect('/admin/login')
  
  }
  else{
    res.render('admin/admin-login',{noheader:true})
  }
})
// router.post('/',(req,res)=>{
//    if(req.session.admin){
//   res.render("admin/admin-home",{ })
//    }else{
//     res.render('admin/admin-login')
//    }
// })

router.get('/adminlogin',function(req,res){
  if(req.session.admin){
    res.redirect('/admin')
  } else {
    const admin = req.session.adminnotfound;
    let wrongpassword =req.session.wrongpassword
    res.render('admin/admin-login',{admin,wrongpassword});
  }
});

router.get('/login',verifylogin,(req,res)=>{
  cartController.getusercount().then((usercount)=>{
    cartController.ordercount().then((orderscount)=>{
      cartController.prodictcount().then((productcount)=>{
        cartController.gettotalnetbanking().then(( netbanking)=>{
          cartController.gettotalcod().then((cod)=>{
            cartController.getsucessdelivey().then((sucessdeli)=>{
              cartController.getpendingdelivey().then((pending)=>{
                cartController.gettotalincome().then((income)=>{
                  cartController.cancellorders().then((cancelled)=>{
                  cartController.deliveredorders().then((delivered)=>{
                    cartController.pendingorders().then((pendings)=>{
                      cartController.shippedorders().then(async(shipped)=>{
                        const dailyIncome=await cartController.todayIncome();
                        console.log(dailyIncome,'is the income of todayy...');
 res.render("admin/admin-home",{ layout:"admin-layout",admin:true,dailyIncome,orderscount,shipped,delivered,cancelled,usercount,productcount,pendings, netbanking,cod,sucessdeli,pending,income})
})
})
})
})
})
})
})
})
})
})
})
})
                      
})


router.post('/login',(req,res,next)=>{
  adminContrller.adminlogin(req.body).then((response)=>{
   
    if(response.status){
      
      req.session.admin=response.admin;
      console.log(req.session.admin);
      req.session.email=response.email;
      req.session.userloggedIn=true;     
      console.log('login success')
      
      res.redirect('/admin/login')
   
    }
    else if(response.adminnotfound){
    req.session.adminnotfound=true,
    req.session.wrongpassword=false,
    console.log("user not found");
    res.redirect('/admin')
    }
    else{
      req.session.adminnotfound=false,
      req.session.wrongpassword=true,e
      res.redirect('/admin')
    }

    })
  
  })
  router.get('/adminlogout',(req,res)=>{
    req.session.destroy();
    //req.session.adminlogin=false;
    res.redirect('/admin')
  })

//MANAGE USER//////////////////////////////////////////////////////
  // router.get('/manageuser',(req,res)=>{
  //   if(req.session.admin){
  //     res.render('admin/manage-user',{admin:true,layout:"manage-userlayout"})
  //  }else{
  //   res.redirect('/admin');
  //  }
  // })

  //USER DETAILS//////////////////////////////////////////////////
  router.get('/manageuser',(req,res)=>{
    if(req.session.admin){
       console.log("its fine");
      adminContrller.getUserData().then((users)=>{
        // console.log("uuuuuuuuuuuuuuuuuuuuuuuuu");
        console.log(users);
        res.render('admin/manage-user',{users,layout:'manage-userlayout',admin:true})
      })
    }else{
      res.redirect('/admin')
    }
  })
  //block/////////////////////////////////
  router.get('/block-user/:id',(req,res)=>{
    let id = req.params.id
    console.log("working");
    adminContrller.block_user(id).then((response)=>{
      // req.session.user.status=true;
      console.log(response);
      res.redirect('/admin/manageuser')
    })
  })
  //active user///////////////////////////////
  router.get('/active-user/:id',(req,res)=>{
    let id = req.params.id
    console.log("active-working");
    adminContrller.active_user(id).then((response)=>{
      console.log(response);
      res.redirect('/admin/manageuser')
    })
  })

  //category management////////////////////////////////////
  router.get('/category',(req,res)=>{
     if(req.session.admin){
      categoryController.getcategory().then((response)=>{
        res.render('admin/category-manage',{response,layout:'manage-userlayout'})
      })
     }else{
      res.redirect('/admin')
     }
  })
  //add category page getting////////////////

  router.get('/addcategory',(req,res)=>{
    const categoryexist = req.session.categoryexist;
    req.session.categoryexist= null;
    res.render('admin/add-category',{categoryexist,layout:'manage-userlayout'})
    
  })

  //get category data////////////////////////

// router.post('/addcategory',(req,res)=>{
  // router.post(',upload.array("image",3),(req,res)=>{
    router.post('/addcategory',upload.array("image",3),(req,res)=>{
      const images = req.files
      array = images.map((value)=>value.filename)
      req.body.image = array
    console.log(req.body,"request body");
  categoryController.addcategoryDate(req.body).then((response)=>{
    console.log(response,"responseeeiii");
    if(response.exist){
      req.session.categoryexist = true
      req.session.category=res.category;
      res.redirect('/admin/addcategory')
    }else{
      req.session.category = response.category
      console.log(req.session.category);
      console.log(response);
      res.redirect('/admin/category'); 
    }
  }).catch((err)=>{
    console.log("error found",err);
  })
})

// })

//delete category//////////////////////////

router.get('/delete-category/:_id',(req,res)=>{
  const categoryid=req.params._id;
  
  // categoryController.deletecategory(categoryid).then((data)=>{
  //   res.redirect('/admin/category')
  // })
  productController.checkcategory(categoryid).then((data)=>{
    if(data[0]==undefined){
      categoryController.deletecategory(categoryid).then((data)=>{
        console.log("data condition is worked")
     res.redirect('/admin/category')
   })
     
    }else{
      console.log("else function is worked")
      res.redirect('/admin/category')
    }
  })
})

//update category/////////////////

router.get('/update-category/:id',(req,res)=>{
//  console.log(req.params);

  const categoryid = req.params.id;
  categoryController.getcategorydata(categoryid).then((categorydata)=>{
    console.log(categorydata,"catrre==");
    res.render('admin/update-category',{categorydata,layout:'manage-userlayout'})
  })
})
// router.post('/updatecategory/:id',(req,res)=>{
  router.post('/updatecategory/:id', upload.array("image",3),(req,res)=>{
    const images = req.files
    let array=[];
    array = images.map((value)=>value.filename)
    req.body.image = array
  const categoryid=req.params.id;
  
  categoryController.updatecategory(categoryid,req.body).then((response)=>{
    console.log(response);
    res.redirect('/admin/category')

  })

});
//////////////
// router.get('/products',(req,res)=>{
//   req.session.admin= true,
//   res.render('admin/product-manage')
// })
// router.post('/products',upload.single("myproducts"), (req,res)=>{
//   console.log(req.files);
//   res.redirect('/admin/products')
// })


// const multerstorage = multer.diskStorage({
//   destination:(req, productmodel, cb)=>{
//     cb(null, "public")
//   },
//   filename:(req, productmodel, cb)=>{
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `products/admin -${productmodel.filename}-${Date.now}().${ext}` )
//   },
//    upload = multer({
//     storage: multerstorage,
//     fileFilter: multerFilter,
//   });

// });
// const miltifilter = (req, productmodel ,cb)=>{
//   if(productmodel.mimetype.split("/")[1] === pdf){
//   cb(null , true)
// }else{
//   cb(new Error("Not a PDF File!!"), false);
// }
// }



router.get('/view_products',(req,res)=>{
 
 if(req.session.admin){
  console.log("raaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
   productController.getPoductdetails().then((productdetails)=>{
    
    console.log("vaaaaaaaaaaaaaaaaaaaaaaa");
 console.log(productdetails);

 
    res.render('admin/product-manage',{productdetails,layout:'manage-userlayout'})
  
  })
 }else{
  res.redirect('/admin')
 }
})
router.get('/addproducts',(req,res,next)=>{
  categoryController.getcategory().then((category)=>{
    // console.log("ggggggggggggggggggggggggggg");
    // console.log(category);
    res.render('admin/add-product',{category,layout:'manage-userlayout'})
  }).catch((err)=>{
    next()
  })
})
//add-product//////////////////
router.post('/products',(req,res,next)=>{
  console.log(req.body);
    productController.addproduct(req.body).then((allproducts)=>{
      productController.getprice(req.body).then((pice)=>{
      console.log(req.body);
      console.log("iiiiiii");
      console.log(allproducts);
      if(req.session.admin){
        res.redirect('/admin/view_products')
  // //res.render('admin/add-product',{allproducts})

  }else{
    res.render('admin/admin-login')
  }
})
}).catch((error)=>{
  next(error)
})

});
////image addim=ng///////////////
router.post('/addproducts',upload.array("image",3),(req,res)=>{
  const images = req.files
  array = images.map((value)=>value.filename)
  req.body.image = array
  productController.addproduct(req.body).then((response)=>{
    // productController.getprice(req.body).then((productprice)=>{

      res.redirect('/admin/view_products');
    }).catch((err)=>{
      console.log("error found",err);
    })
  // })
});

/////deleate product/////////////////////////
router.get('/delete-product/:_id',(req,res)=>{
  let productID= req.params._id
  productController.deleatproducts(productID).then((response)=>{
    res.redirect('/admin/view_products')
  })
})

//getting edit product page////////////////////
router.get('/update-product/:_id',(req,res)=>{
  let productID = req.params._id
  productController.getPoductvalue(productID).then((productdata)=>{
    categoryController.getcategory(productID).then((response)=>{
      
     console.log("areeewaaaaaaaaaaaaaaaaaaa");
    
    
    res.render('admin/update-product',{productdata,response,layout:'manage-userlayout'})
  })
})
})


router.post('/updateproduct/:_id', upload.array("image",3),(req,res)=>{
  const images = req.files
  let array=[];
  array = images.map((value)=>value.filename)
  req.body.image = array
  let productid = req.params._id
  console.log(productid);
 
  productController.updateProduct(productid,req.body).then((productdata)=>{
   
    console.log(productdata);
    
    res.redirect('/admin/view_products')
    
    
  })

})

//banner////////////////////////////////

router.get('/addbanner',(req,res)=>{
  const bannerexist = req.session.bannerrexist;
  req.session.bannerexist= null;
    res.render('admin/add-banner',{bannerexist,layout:'manage-userlayout'})
  
})
router.post('/addbanner',upload.array("image",3),(req,res)=>{
  const images = req.files
  console.log("trueeeeeeee");
  console.log(images);
  array = images.map((value)=>value.filename)
  console.log(array);
  req.body.image = array
  bannerrController.addbanner(req.body).then((response)=>{
    console.log("rrgsdjkhj");
    console.log(response);
      res.redirect('/admin/bannermanage')
    
      
    })
    
  })
  router.get('/bannermanage',verifylogin,(req,res)=>{
    bannerrController.getbannerdata().then((bannerdetails)=>{
      console.log("jahaaa");
      console.log(bannerdetails);
      res.render('admin/banner-manage',{bannerdetails,layout:'manage-userlayout'})
    })
  })
  router.get('/deletebanner/:_id',verifylogin,(req,res)=>{
    bannerID = req.params._id
    bannerrController.deletebanner(bannerID).then((response)=>{
      res.redirect('/admin/bannermanage')
    })
  })

  router.get('/updatebanner/:_id',verifylogin,(req,res)=>{
    log("sdjkfhjk")
    let bannerID = req.params._id
    bannerrController.getbannervalue(bannerID).then((response)=>{
      console.log("its commingg..............");
      console.log(response);
     res.redirect('/admin/bannermanage',response)
    })
    })
  
    router.post('/updatebanner/:_id',verifylogin, upload.array("image",3),(req,res)=>{
      const images = req.files
      let array=[];
      array = images.map((value)=>value.filename)
      req.body.image = array
      let bannerid = req.params._id
      bannerrController.updatebanner(bannerid,req.body).then((response)=>{
        res.redirect('/admin/bannermanage')

    })
  })

  //coupen//////////
  router.get('/coupen',verifylogin,(req,res)=>{
    cartController.getcoupen().then((getcoupens)=>{
   
    res.render('admin/coupen-manage',{layout:'manage-userlayout',getcoupens})
  })
})


  router.post('/coupen',verifylogin,(req,res)=>{
    
    cartController.addcoupen(req.body).then((coupens)=>{
    res.redirect('/admin/coupen')
    })
  })

  router.get('/deletecoupen/:id',verifylogin,(req,res)=>{
  let coupenid = req.params.id
    cartController.deletecoupen(coupenid).then((response)=>{
    res.redirect('/admin/coupen')
    })
  })

  router.get('/updatecoupen/:id',verifylogin,(req,res)=>{
    coupenid = req.params.id
    cartController.getcoupenvalue(coupenid).then((coupendata)=>{
    res.render('admin/updatecoupen',{coupendata,layout:'manage-userlayout'})
    })
  })

  router.post('/updatecoupen/:id',(req,res)=>{
    let coupenid = req.params.id
    cartController.updatecoupen(coupenid,req.body).then((updatecoupen)=>{
      console.log(updatecoupen,"update or flse");
      res.redirect('/admin/coupen')
    })
  })

  router.get('/orderstatus',verifylogin,(req,res)=>{
// userid = req.session.user._id
    cartController.getOrders().then((orderdata)=>{
    res.render('admin/orderstatus',{layout:'manage-userlayout',orderdata})
    })
  })

  router.post('/ShipOrder/:id',verifylogin,(req,res)=>{
    orderid = req.params.id
    console.log(orderid,"orderidd");
    cartController.shipOrder(orderid).then((shipped)=>{
      console.log(shipped,"shipped at adminjs");
      res.json({shipped})
    })
  })
  router.post('/Delivered/:id',verifylogin,(req,res)=>{
    orderid = req.params.id
    cartController.DeliveredOrder(orderid).then((delivered)=>{
      console.log(delivered,"delivered");
      res.json({delivered})
    })
  })

  router.post('/cancelorder/:_id',verifylogin,(req,res)=>{
    console.log("thoommmmm");
    orderid = req.params._id
    console.log("orderid:",orderid);
    cartController.cancelorder(orderid).then((cancelled)=>{
      res.json({cancelled})
    })
  })
  
  router.get('/getdash',(req,res,next)=>{
    adminContrller.stati().then((status)=>{
      res.json({status})
    }).catch((err)=>{
      next(err)
    })
  })
  router.get('/salesreport',(req,res)=>{
    cartController.getOrders().then((order)=>{
      cartController.gettotalincome().then((income)=>{
        res.render('admin/salesreport',{layout:'manage-userlayout',order,income})

      })
  
    })
  })

  // router.get('/salesreport',(req,res)=>{
  //   const salesreport = cartController.getOrders().then((order)=>{
  //     // const json
  //     const data = salesreport.map(row =>({
  //       paymentdetails:row.paymentdetails
  //     }))
  //     const csvData = objectToCsv(salesreport)

  //   })

  // })

 
  



  



                                                                                                                             












module.exports = router;
