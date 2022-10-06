const { response } = require("express");
let express = require("express");
const twiliocontroller = require("../controllers/twiliocontroller");
const usercontroller = require("../controllers/userController");
let router = express.Router();
const userModel = require("../model/user-model");
const usermiddleware = require("../middleware/usermiddleware");
const productController = require("../controllers/productController");
const bannerrController = require("../controllers/bannerrController");
const categoryController = require("../controllers/categoryController");
const cartController = require("../controllers/cartController");
const cartmodel = require("../model/cart-model");
const wishlistController = require("../controllers/wishlistController");
const { itemcount } = require("../controllers/wishlistController");
const addressController = require("../controllers/addressController");
const { getcategory } = require("../controllers/categoryController");
const sweetalert = require("sweetalert");
const { getTotaldiscount, cartcount } = require("../controllers/cartController");
const paymentcontroller = require("../controllers/paymentcontroller");
const coupenmodel = require("../model/coupen-model");
const async = require("hbs/lib/async");
const { changepassword } = require("../controllers/userController");
// const mongoose=require('mongoose')
const multer = require('multer');
const ordermodel = require("../model/ordermodel");

/* GET home page. */

let verifylogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
};



const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `files/users-${file.fieldname}-${Date.now()}.${ext}`);
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

router.get("/", usermiddleware.isblocked, function (req, res, next) {
  if (req.session.user) {
    let user = req.session.user;
    console.log(user);

    productController.getlatestproduct().then((response) => {
      bannerrController.getbannerdata().then((bannerdata) => {
        usercontroller.getuserdata(req.session.user._id).then((user)=>{

        categoryController.getcategory().then(async (categorys) => {
          // console.log("ivede undeeeeeeee");
          console.log(response);

          if (req.session.user.status) {
            // res.send("blocked");
            res.render('user/blockeduser',{noheader:true})
          } else {
            console.log("jingaaaa");
            console.log(bannerdata);
            const cartCount = await cartController.cartcount(
              req.session.user._id
            );
            const itemscount = await wishlistController.itemcount(
              req.session.user._id
            );
            res.render("user/user-home", {
              user: true,
              response,
              bannerdata,
              categorys,
              cartCount,
              itemscount,
              user
            });
          }
        })
        });
      });
    });
  } else {
    categoryController.getcategory().then((categorys) => {
      bannerrController.getbannerdata().then((bannerdata) => {
        productController.getlatestproduct().then((response) => {
          console.log(response,"latest pproooo");
        
         
            res.render("user/user-home", { bannerdata, response, categorys});
          
        });
      });
    });
  }
});

///////////////////////////////////////Login/////////////////////////////////////////

router.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    const user = req.session.usernotfound;
    let wrongpassword = req.session.wrongpassword;
    res.render("user/user-login", { user, wrongpassword });
  }
});

/////////////////////User Login Post Method///////////////////////////

router.post("/login", (req, res, next) => {
  usercontroller.userlogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.email = response.email;
      req.session.userloggedIn = true; //last added for middleware//
      console.log("login success");
      res.redirect("/");
    } else if (response.usernotfound) {
      req.session.usernotfound = true;
      req.session.wrongpassword = false;
      console.log("user not found ");
      res.redirect("/login");
    } else {
      console.log("login failed");
      req.session.usernotfound = false;
      req.session.wrongpassword = true;
      res.redirect("/login");
    }
  });
});

/////////////////////signup///////////////////////////////

router.get("/signup", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/user-signup");
  }
});

router.get("/signup", (req, res) => {
  session = req.session;
  console.log(session.userAlreadyExist);
  res.render("user/user-signup", { session });
});

router.post("/signup", (req, res) => {
  usercontroller.usersignup(req.body).then((state) => {
    if (state.userexist) {
      req.session.userAlreadyExist = true;
      res.redirect("/signup");
    } else {
      req.session.user = state.user;
      req.session.email = state.email;
      req.session.loggedIn = true;
      console.log(state.user);
      console.log("user");
      //res.redirect('/')

      req.session.phonenumber = req.body.phonenumber;
      twiliocontroller.getOtp(req.body.phonenumber).then((response) => {
        if (response.exist) {
          if (response.ActiveStatus) {
            req.session.user = response.user;
            console.log(response.email);
            req.session.email = response.email;

            res.render("user/otpverify");
          }
        }
      });
    }
  });
});
router.get("/logout", (req, res) => {
  console.log("logouttttttttttt");
  req.session.destroy();

   res.json();
});
/////////////OTP////////////////////////////////

router.get("/phonenumber",usermiddleware.isblocked, (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/otpverify");
  }
});
/////post otp//////////////////////////
// router.post('/otplogin',(req,res)=>{
//   req.session.phonenumber = req.body.phonenumber
//   twiliocontroller.getOtp(req.body.phonenumber).then((response)=>{
//     if(response.exist){
//       if(response.ActiveStatus){
//         req.session.user = response.user
//         console.log(response.email);
//         req.session.email = response.email
//         res.render('user/otpverify')
//        }
//       else {
//         req.session.usrBlocked = true
//         res.redirect('/usersignup')
//       }
//     }else{
//       req.session.usernotfound = true
//       res.redirect('/usersignup')
//     }
//   })
// })
////otp veryfying/////////////////////
router.get("/otpverify",usermiddleware.isblocked, (req, res) => {
  res.render("user/otpverify");
});
router.post("/otpverify", (req, res) => {
  console.log(req.session.phonenumber);
  twiliocontroller
    .checkOut(req.body.otp, req.session.phonenumber)
    .then((response) => {
      console.log(response);
      if (response == "approved") {
        // console.log(response.status);
        // req.session.user = true;

        req.session.loggedIn = true;
        //userModel.findOneAndUpdate({mobile:req.session.phonenumber},{verified:true}
        usercontroller
          .updateuserverify(req.session.phonenumber)
          .then((response) => {
            console.log(response);
            res.redirect("/");
          });
      } else {
        res.render("user/otpverify");
      }
    });
});

// router.get('/productlist',(req,res)=>{

// })
router.get("/shop", usermiddleware.isblocked,(req, res) => {
  if(req.session.user){
    productController.getPoductdetails().then((response) => {
      let user = req.session.user;
      let userid = req.session.user._id;
      categoryController.getcategory().then((categorys) => {
        cartController.cartcount(userid).then((cartCount) => {
          wishlistController.itemcount(userid).then((itemscount) => {
            res.render("user/shop", {
              categorys,
              response,
              user,
              cartCount,
              itemscount,
              layout: "layout",
              user: true,
            });
          });
        });
      });
    });
  }else{
    productController.getPoductdetails().then((response) => {
    
      categoryController.getcategory().then((categorys) => {
 
            res.render("user/shop", {
              categorys,
              response,
            
           
              layout: "layout",
             
            });
          });
        });
     
  }
 
});

//single product page//////////////

router.get("/singleproduct/:_id",usermiddleware.isblocked,(req, res) => {
  if(req.session.user){
    console.log("luluuu");
  userid = req.session.user._id;
  productid = req.params._id;
  console.log(productid);
  cartController.cartcount(userid).then((cartCount) => {
    wishlistController.itemcount(userid).then((itemscount) => {
      productController.getPoductvalue(productid).then((response) => {

        console.log(response.categoryname,"cat name");
      // await  categoryController.getcategoryinsingle(productid).then((cat)=>{
        res.render("user/single-product-page", {
          response,
          cartCount,
          itemscount,
          user: true,
        });
      // });
    });
  })
  });
  }else{
    console.log("luluuu");
 
 productid = req.params._id;

      productController.getPoductvalue(productid).then((response) => {
       let category = response.data.categoryname.categoryname
        categoryController.getcategoryinsingle(category).then((categorybasedlist)=>{
          
        console.log(categorybasedlist,"thummmmm");
        console.log(response);
        res.render("user/single-product-page", {
          response,
          categorybasedlist
        })
       
        });
      });
  
  }
  
});

//  cart///////////////////
router.get("/cart",usermiddleware.isblocked, verifylogin, (req, res) => {
  productid = req.params._id;
  userid = req.session.user._id;
  cartController
    .addproductdetails(req.session.user._id).then(async (productdetails) => {
      cartController.cartcount(userid).then((cartCount) => {
        cartController.getTotalAmout(userid).then((totalamount) => {
          wishlistController.itemcount(userid).then((itemscount) => {
            if(cartCount == 0 || cartcount ==undefined){

              res.render('user/cart-empty',{user:true,cartCount,itemscount})
            }else{
              res.render("user/users-cart", {
                productdetails,
                cartCount,
                totalamount,
                itemscount,
                user: true,
              });
            }
           
          });
        });
      });
    });
    
}),
  // router.get('/addtocart/:_id',(req,res)=>{

  //    const userid = req.params._id;
  //    const productid = req.params._id;
  //    console.log(userid);
  //    console.log("idddd",productid);
  //    usercontroller.getuserdata().then((userid)=>{
  //   productController.getPoductvalue(productid).then((response)=>{

  //     console.log(userid);
  //     console.log("gggggggggg");
  //     console.log(productid);
  //     res.render('user/add-to-cart',{response,userid})
  //   })
  // })
  // })
  router.post("/addtocart/:id",usermiddleware.isblocked,verifylogin, (req, res) => {
    cartController
      .addproductdetails(req.session.user._id)
      .then(async (productdetails) => {
        cartController
          .addToCart(req.params.id, req.session.user._id)
          .then((response) => {
            console.log(productdetails, "thapangalee");
            cart = response.cart;
            // let totalAmount
            cartempty = response.cartempty;
            console.log(productdetails, "productdetailsssss");
            // res.render('user/users-cart',{productdetails})
            // res.redirect('/shop')
            res.json(response);
          });
      })
      .catch((err) => {
        next(err);
      });
  }),
  ///////////////////////////////////////
  router.get("/addtocarts/:id",usermiddleware.isblocked, verifylogin, (req, res) => {
    cartController
      .addproductdetails(req.session.user._id)
      .then(async (productdetails) => {
        cartController
          .addToCart(req.params.id, req.session.user._id)
          .then(async(response) => {
            const deletewishlist=await wishlistController.deleteitem(req.session.user._id,req.params.id);
            console.log(productdetails, "thapangalee");
            cart = response.cart;
            // let totalAmount
            cartempty = response.cartempty;
            console.log(productdetails, "productdetailsssss");
            // res.render('user/users-cart',{productdetails})
            res.redirect("/cart");
            // res.json({response})
          });
      })
      .catch((err) => {
        next(err);
      });
  }),
  router.post("/deletecart/:id",usermiddleware.isblocked, verifylogin, (req, res) => {
    let userid = req.session.user._id;
    let productid = req.params.id;
    console.log(productid);
    cartController.deletecart(userid, productid).then((response) => {
      // res.json(response

      console.log(response, "resssssssss");
      // res.redirect("/cart");

      res.json(response);

    });
  });
/////////increse quantity//////////
router.post("/incrementqty/:id",usermiddleware.isblocked, verifylogin, (req, res) => {
  let userid = req.session.user._id;
  let productid = req.params.id;
  cartController.incrementqty(userid, productid).then((response) => {
    //  res.redirect('/cart')
    res.json(response);
  });
});

router.post("/decrementqty/:id",usermiddleware.isblocked, verifylogin, (req, res) => {
  let userid = req.session.user._id;
  let productid = req.params.id;
  cartController.decrementqty(userid, productid).then((response) => {
    //  res.redirect('/cart')
    res.json(response);
  });
});

//wishlilst///////
router.get("/wlist",usermiddleware.isblocked, verifylogin, (req, res) => {
  (userid = req.session.user._id), (producutid = req.params.id);
  wishlistController.additems(userid).then((items) => {
    wishlistController.itemcount(userid).then((itemscount) => {
      cartController.cartcount(userid).then((cartCount) => {
        if(itemscount == 0 || itemscount == undefined){
          res.render('user/wishlist-empty',{user:true,cartCount})
        }else{
          res.render("user/wishlist", {
            items,
            itemscount,
            cartCount,
            user: true,
          });

        }
       
      });
    });
  });
});
// router.get('/wishlist/:_id'),verifylogin,(req,res)=>{
//   //  let userid = req.session.user._id
//   //  let productid=req.params._id
//    wishlistController.addwishlist(req.session.user._id,req.params._id).then((response)=>{
//     // console.log(userid);
//     // console.log(productid);
//     // wishlist = response.wishlistempty
//     res.redirect('/wishlist')
//    })
// }

router.post("/wishlist/:_id",usermiddleware.isblocked, verifylogin, (req, res) => {
  console.log(req.session.user._id, req.params._id, "idddddddss");
  wishlistController
    .addwishlist(req.session.user._id, req.params._id)
    .then((response) => {
      console.log(response, "wishlisttttttttt");
      wishlistempty = response.wishlistempty;
      wishlist = response.wishlist;
      // res.redirect('/Wlist')
      res.json(response);
    });
});
router.post("/deleteitem/:id", usermiddleware.isblocked,verifylogin, (req, res) => {
  userid = req.session.user._id;
  productid = req.params.id;
  wishlistController.deleteitem(userid, productid).then((response) => {
    // res.redirect("/wlist");
    res.json(response)
  });
});
////checkout/////////
router.get("/checkout",usermiddleware.isblocked, verifylogin, (req, res) => {
  let userid = req.session.user._id;
  addressController.getadderss(userid).then((viewaddress) => {
    cartController
      .addproductdetails(req.session.user._id)
      .then(async (productdetails) => {
        cartController.getTotalAmout(userid).then((totalamount) => {
          cartController.cartcount(userid).then((cartCount) => {
            wishlistController.itemcount(userid).then((itemscount) => {
              cartController.getcoupen().then((coupens) => {
                usercontroller.getuserdata(userid).then((userdata) => {
                  cartController
                    .getTotaldiscount(userid)
                    .then((totaldiscount) => {
                      cartController.getmrptotal(userid).then((mrptotal) => {
                        // cartController.applyCoupen(userid,req.body).then((applaycoupen)=>{

                        // cartController.applyCoupen(userid,req.body,userid).then((applaycoupen)=>{

                        console.log(viewaddress, "addressssssssssssssss");
                        res.render("user/checkout", {
                          viewaddress,
                          mrptotal,
                          totaldiscount,
                          userdata,
                          productdetails,
                          status: false,
                          totalamount,
                          cartCount,
                          coupens,
                          itemscount,
                          user: true,
                        });

                        // })
                      });
                    });
                });
              });
            });
          });
        });
      });
  });
});
// })

router.post("/checkout",usermiddleware.isblocked, (req, res, next) => {
  userid = req.session.user._id;
  let coupon = req.session.coupen;
  const getRandomId = (min = 0, max = 500000) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    const num =  Math.floor(Math.random() * (max - min + 1)) + min;
    return num.toString().padStart(6, "0")
};
let invoiceid = getRandomId()
cartController.getmrptotal(userid).then((mrp)=>{
  cartController.getTotaldiscount(userid).then((productdiscount)=>{
console.log("invoice id =",getRandomId());
  cartController.coupenUser(userid, req.body).then((usercoupen) => {
  
  cartController.addorders(req.body, userid, coupon,invoiceid,mrp,productdiscount).then(async (orderdetails) => {
      let orderid = orderdetails._id;
      req.session.orders = orderdetails;
      const coupon=req.session.coupen;
      console.log(coupon,"couponnnnnnnnnnnnnnnnnn");
      if (orderdetails.paymentdetails === "COD") {
        orderdetails.orderstatus = true;  
        console.log("cod", orderdetails);
        res.json({ orderdetails });
      } else {
        console.log('hi');
        if(coupon){
          paymentcontroller.generaterazorpay(orderid,coupon.grandtotal).then((data) => {
            console.log(data,"dataaas")
              res.json({ data });
            });
        }else{
        paymentcontroller.generaterazorpay(orderid,orderdetails.totalprice).then((data) => {
          console.log(data,"dataaas")
            res.json({ data });
        
          });
        }
      }
    })
  })
    .catch((error) => {
      next(error);
    });
  });
})
});


// router.post("/checkout", (req, res, next) => {
//   userid = req.session.user._id;
//   if(req.session.coupen){
//   let coupon = req.session.coupen;
//   console.log("ssssssssssssssssssssssssssssssssssssss ", coupon);
//   cartController.coupenUser(userid, req.body).then((usercoupen) => {
//   console.log("fffffffffffffffffffffffffffffff", req.body);
//   cartController.addorders(req.body, userid, coupon).then(async (orderdetails) => {
//       let orderid = orderdetails._id;
//       req.session.orders = orderdetails;
//       if (orderdetails.paymentdetails === "COD") {
//         orderdetails.orderstatus = true;
//         console.log("cod", orderdetails);
//         res.json({ orderdetails });
//       } else {
//         paymentcontroller.generaterazorpay(orderid,orderdetails.totalprice,applaycoupen.grandtotal).then((data) => {
//             res.json({ data });
//           });
//       }
//     })
    
//     .catch((error) => {
//       next(error);
//     });
    
//   });
// }else {
//   cartController.addorders(req.body, userid).then(async (orderdetails) => {
//     let orderid = orderdetails._id;
//     req.session.orders = orderdetails;
//     if (orderdetails.paymentdetails === "COD") {
//       orderdetails.orderstatus = true;
//       console.log("cod", orderdetails);
//       res.json({ orderdetails });
//     } else {
//       paymentcontroller.generaterazorpay(orderid,orderdetails.totalprice).then((data) => {
//           res.json({ data });
//         });
//     }
//   })
  
//   .catch((error) => {
//     next(error);
//   });
// }
// });






router.post("/applyCoupon",usermiddleware.isblocked, (req, res) => {
  let userid = req.session.user._id;
  cartController.applyCoupen(userid, req.body).then((applaycoupen) => {
    req.session.coupen = applaycoupen;
    if (applaycoupen) {
      req.session.coupen = applaycoupen;
    }
    cartController.coupenUser(userid, req.body).then((usercoupen) => {
      cartController.getcoupen().then((coupens) => {
        res.json({ applaycoupen });
        // res.redirect('/checkout')
        // res.render("user/checkout", { applaycoupen, usercoupen, coupens });
      });
    });
  });
});

router.get("/address", verifylogin,usermiddleware.isblocked, (req, res) => {
  userid = req.session.user._id
  cartController.cartcount(userid).then((cartCount) => {
    wishlistController.itemcount(userid).then((itemscount) => {
      res.render("user/address", { user: true, cartCount, itemscount });
    });
  });
});

router.post("/address",usermiddleware.isblocked, (req, res) => {
  userid = req.session.user._id;
  addressController.addaddress(req.body, userid).then((addressdata) => {
    res.redirect("/userprofile");
  });
});

router.get("/userprofile", usermiddleware.isblocked,verifylogin, (req, res) => {
  let userid = req.session.user._id;

  addressController.getadderss(userid).then((viewaddress) => {
    usercontroller.getuserdata(userid).then((response) => {
      cartController.cartcount(userid).then((cartCount) => {
        wishlistController.itemcount(userid).then((itemscount) => {
          res.render("user/user-profile", {
            response,
            viewaddress,
            user: true,
            cartCount,
            itemscount,
          });
        });
      });
    });
  });
});

router.get("/updateaddress/:_id", usermiddleware.isblocked,verifylogin, (req, res) => {
  let addressid = req.params._id;
  let userid = req.session.user._id
  cartController.cartcount(userid).then((cartCount) => {
    wishlistController.itemcount(userid).then((itemscount) => {
      addressController.getadderssvalue(addressid).then((addresses) => {
        res.render("user/updateaddress", {
          addresses,
          user: true,
          cartCount,
          itemscount,
        });
      });
    });
  });
});

router.post("/updateaddress/:_id", usermiddleware.isblocked,(req, res) => {
  // userid = req.session.user._id
  let addressid = req.params._id;
  addressController.editaddress(req.body, addressid).then((updateaddress) => {
    res.redirect("/userprofile");
  });
});

router.post("/deleteaddress/:id",usermiddleware.isblocked, verifylogin, (req, res) => {
  let addressid = req.params.id;
  addressController.deleateaddress(addressid).then((deleted) => {
    // res.redirect("/userprofile");

    res.json({deleted})
  });
});

router.get("/shop/:id", usermiddleware.isblocked,(req, res) => {
  if(req.session.user){
    productController.getBycategory(req.params.id).then((listcategory) => {

      let user = req.session.user;
      let userid = req.session.user._id;
      categoryController.getcategory().then((categorys) => {
        cartController.cartcount(userid).then((cartCount) => {
          wishlistController.itemcount(userid).then((itemscount) => {
            res.render("user/Categorybaseshop", { user, cartCount, itemscount, categorys, listcategory, user: true, });
          });
        });
      });
    });
  }else{
    productController.getBycategory(req.params.id).then((listcategory) => {

    categoryController.getcategory().then((categorys) => {
      res.render('user/Categorybaseshop',{listcategory,categorys})
    })
    })
  }
 
});

router.get("/order/:id", verifylogin,usermiddleware.isblocked, async (req, res) => {
  const orderid = req.params.id;
  const userid = req.session.user._id;
  const session = req.session;
  const item = wishlistController.itemcount(userid);
  const cartcount = cartController.cartcount(userid);
  cartController.getOrdervalue(orderid).then((orderdetails) => {
    cartController.getmrptotal(userid).then((mrptotal)=>{
      cartController.getTotaldiscount(userid).then((totaldiscount)=>{
        usercontroller.getuserdata(userid).then((userdata)=>{

    res.render("user/ordersuccess", { item, cartcount, user: true, orderdetails,mrptotal ,totaldiscount,userdata});
        })
      })
    })
  });
});

router.post("/verifyPayment",usermiddleware.isblocked, verifylogin, (req, res) => {


  paymentcontroller.verifypayment(req.body).then((data) => {
    paymentcontroller
      .changepaymentstatus(req.body.order.reciept)
      .then((response) => {
        res.json({ status: true });
      })
      .catch((error) => {
     
        res.json({ status: false });
      });
  });
});
router.get('/allorders',usermiddleware.isblocked,verifylogin,(req,res)=>{
  userid = req.session.user._id
  cartController.getOrder(userid).then((orders)=>{
    cartController.cartcount(userid).then((cartcount)=>{
      wishlistController.itemcount(userid).then((itemscounts)=>{

    res.render('user/orders',{orders,user:true,cartcount,itemscounts})
      })
    })
  })
})

router.get('/singleorder/:id',usermiddleware.isblocked,(req,res)=>{
  orderid = req.params.id
  userid = req.session.user._id
  cartController.getOrdervalue(orderid).then((orders)=>{
    cartController.getTotalAmout(userid).then((totalamount)=>{
      cartController.getTotaldiscount(userid).then((totaldiscount)=>{
        cartController.getmrptotal(userid).then((mrp)=>{
          cartController.cartcount(userid).then((cartcount)=>{
            wishlistController.itemcount(userid).then((itemscounts)=>{
  
          res.render('user/singleorder',{orders,totalamount,totaldiscount,mrp,user:true,cartcount,itemscounts})
            })
          })
        })

      })
    })
  
  })
})

router.post('/cancelorder/:_id',usermiddleware.isblocked,(req,res)=>{

  orderid = req.params._id
  
  cartController.cancelorder(orderid).then((cancelled)=>{
    res.json({cancelled})
  })
})
router.post('/updateuserDetails',usermiddleware.isblocked,upload.single("image"),(req,res)=>{
 
  userid = req.session.user._id
  console.log(req.file,'reqfiles')
  const images = req.file.filename
  // array = images.map((value)=>value.filename)
  console.log(req.body,"bodyy");
  userid= req.session.user._id
  usercontroller.updateuserdetails(userid,req.body,images).then((updateuser)=>{
    res.redirect('/userprofile')
    // res.json(updateuser)
  })
})

router.post('/changepassword',usermiddleware.isblocked,(req,res)=>{
  console.log("chamge ppasssss");
  userid = req.session.user._id
  usercontroller.changepassword(userid,req.body).then((response)=>{
    if(response){
    console.log("changed password");
  
    res.json(changepassword)
    }
    else
    {
      console.log("wrong password ");
    }
  })
})

router.get('/orderreciept/:id',usermiddleware.isblocked,verifylogin,(req,res)=>{
 
  userid = req.session.user._id
   cartController.getOrdervalue(req.params.id).then((orders)=>{
    cartController.cartcount(userid).then((cartcount)=>{
wishlistController.itemcount(userid).then((itemscount)=>{




    res.render('user/orderreciept',{user:true,orders,cartcount,itemscount})
  })
  })
   })
  // userid = req.session.user._id
  // let totalamount = cartController.getTotalAmout(userid)
  // let coupon = req.session.coupen.grandtotal
  // console.log(coupon,"coupooo")
})




// router.post('/addprofilephoto',upload.single("image"),(req,res)=>{
//   console.log("jijijjij");
//   userid = req.session.user._id
//   console.log(req.file,'reqfiles')
//   const images = req.file
//   // array = images.map((value)=>value.filename)
//   req.body = images
//   console.log(req.body,"req.body");
//   usercontroller.addImage(userid,req.body).then((response)=>{
//     console.log(response,'response');
//     res.redirect('/userprofile')
//     // res.json({response})
    
//   })

//   })



  
// })

  
//orders----------------------------

// router.get('/order',verifylogin,(req,res)=>{
//   userid = req.session.user._id
//   // cartController.addproductdetails(req.session.user._id).then(async(productdetails)=>{
//   // cartController.cartcount(userid).then((cartCount)=>{
//   //   wishlistController.itemcount(userid).then((itemscount)=>{
//   usercontroller.getuserdata(userid).then((userdata)=>{
//   cartController.getOrder(userid).then((orderdata)=>{
//   //   cartController.getTotalAmout(userid).then((totalamount)=>{
//     // cartController.addorders(req.body,userid).then((orderdata)=>{
//     // cartController.getOrdervalue(req.params.id).then((orderdata)=>{
//       console.log("orderdataa jinga",orderdata);
// res.render('user/orders',{user:true,userdata,orderdata})
//   })
//     })
//   })
// })
// })
// })
// })

// router.post('/orderplace',verifylogin,(req,res)=>{
//    uerid = req.session.user._id
//    console.log("orderplacedddddddddd",userid);
//   cartController.addorders(req.body,userid).then((response)=>{
//     console.log("here response",response);

//   res.redirect('/order')

// })
// })

// router.get('/getsingleorder/:id',verifylogin,(req,res)=>{
//   let orderid = req.params.id
//   userid = req.session.user._id
//    cartController.getOrdervalue(orderid,userid).then((order)=>{
//     console.log(order,"order----");
//     res.render('user/getsingleorder',{order,user:true})
//    })
// })

// })

// router.get('/view-address',verifylogin,(req,res)=>{

//     res.redirect('/checkout',{viewaddress})
//   })

// router.get('/cartcount',(req,res)=>{
//   let userid = req.session.user._id
//   console.log(userid,"jaggggggggg");
//   cartController.cartcount(userid).then(response)
//   res.redirect('/cart')
// })

// router.get('/addtocart/:_id',verifylogin,(req,res)=>{

//     console.log(response,"resui");
//       console.log(req.params._id,"iddddddddddddddddddddddddddddddddddddd");
//     console.log("vanditta singamm"),
//     console.log(req.params._id);
//     console.log(req.session.user._id);
//     res.render('user/users-cart')
//     })

// router.get('/addprodut/:id',verifylogin,(req,res)=>{

//     res.render('user/users-cart',{response})
//   })

// router.post('/singleproduct',(req,res)=>{
//   productController.getPoductvalue().then((response)=>{
//     console.log("memmmmmmmmmmmmm");
//     console.log(response);
//     res.redirect('/singleproduct',{response})
//   })
// })

// router.post('/signup',async (req,res)=>{
//   try{
//     const newUser=await new userModel(req.body);
//     newUser.save();
//     res.render('user/user-home');
//   }catch(error){
//     console.log(error);
//   }
// });


module.exports = router;
