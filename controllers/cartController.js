// const { router, response } = require("../app");
const { promise, reject } = require("bcrypt/promises");
const async = require("hbs/lib/async");
const { Code } = require("mongodb");
const { isObjectIdOrHexString } = require("mongoose");
const { response } = require("../app");
// const { response } = require("../app");
const cartmodel = require("../model/cart-model");
const coupenmodel = require("../model/coupen-model");
const ordermodel = require("../model/ordermodel");
const productController = require("./productController");
const usercontroller = require("./usercontroller");
// const objectId = require('mongodb').ObjectId
// const ObjectId = require('ObjectId')
// const categoryModel = require("../model/category-model");

let Helpers = {
  addToCart: (productid, userid) => {
    console.log("product");
    const response = {
      duplicate: false,
    };

    console.log("productidddd", productid);
    console.log("useriddddd", userid);

    return new Promise(async (resolve, reject) => {
      try {
        let usercart = await cartmodel.findOne({ userId: userid });
        console.log("llammmmm");
        console.log(usercart);
        if (usercart) {
          let cartproduct = await cartmodel.findOne({
            userId: userid,
            "Cartdata.productId": productid,
          });

          if (cartproduct) {
            console.log(cartproduct);
            cartmodel
              .updateOne(
                { userId: userid, "Cartdata.productId": productid },
                { $inc: { "Cartdata.$.quantity": 1 } }
              ).then((response) => {
                console.log("gujuuuu", response);
                response.duplicate = true;
                resolve(response);
              });
          } else {
            let cartArray = { productId: productid, quantity: 1 };
            cartmodel
              .findOneAndUpdate(
                { userId: userid },
                {
                  $push: { Cartdata: cartArray },
                }
              )
              .then((data) => {
                resolve(response);
              });
          }
        } else {
          let body = {
            userId: userid,
            Cartdata: [{ productId: productid, quantity: 1 }],
          };
          await cartmodel.create(body);
          resolve(response)
        }
      } catch (error) {
        console.log("errrorr");
        reject(error);
      }
    });
  },

  addproductdetails: (userid) => {
    try {
      return new Promise(async (resolve, reject) => {
        const response = {};
        // console.log(Cartdata.productId);
        cartmodel
          .findOne({ userId: userid })
          .populate("Cartdata.productId")
          .lean()
          .then((cart) => {
            console.log(cart, "uhuoihjjjjjjjjjj");
            if (cart) {
              if (cart.Cartdata.length > 0) {
                response.cartempty = false;
                response.cart = cart;
                console.log("cartrespoonse123");
                resolve(response);
              } else {
                response.cartempty = true;
                response.cart = cart;
                console.log("cartrespoonse");
                resolve(response);
              }
            } else {
              response.cartempty = true;
              resolve(response);
              console.log(response, "responseeeeeeee");
            }
          });
      });
    } catch (error) {
      console.log("error");
      reject(error);
    }
  },

  deletecart: (userID, productID) => {
    console.log(productID, "productid");
    console.log(userID, "userid");
    return new Promise(async (resolve, reject) => {
      try {
        await cartmodel
          .updateOne(
            { userId: userID },
            { $pull: { Cartdata: { productId: productID } } }
          )
          .then((response) => {
            console.log(response);
            resolve(response);
          });
      } catch (err) {
        reject(err);
      }
    });
  },
  // Cartdata:{$elemMatch:{productId:productID}}},

  ////increace quantity///////////
  incrementqty: (userID, productID) => {
    return new Promise(async (resolve, reject) => {
      cartmodel
        .updateOne(
          { userId: userID, "Cartdata.productId": productID },
          { $inc: { "Cartdata.$.quantity": 1 } }
        )
        .then(async (response) => {
          let cart = await cartmodel.findOne({ userId: userID });

          let quantity;
          for (let i = 0; i < cart.Cartdata.length; i++) {
            if (cart.Cartdata[i].productId == productID) {
              quantity = cart.Cartdata[i].quantity;
            }
          }
          response.quantity = quantity;
          resolve(response);
        });
    });
  },
  ////decrease quantity
  decrementqty: (userID, productID) => {
    return new Promise(async (resolve, reject) => {
      cartmodel
        .updateOne(
          { userId: userID, "Cartdata.productId": productID },
          { $inc: { "Cartdata.$.quantity": -1 } }
        )
        .then(async (response) => {
          let cart = await cartmodel.findOne({ userId: userID });

          let quantity;
          for (let i = 0; i < cart.Cartdata.length; i++) {
            if (cart.Cartdata[i].productId == productID) {
              quantity = cart.Cartdata[i].quantity;
            }
          }
          response.quantity = quantity;
          resolve(response);
        });
    });
  },

  //total count///////////////
  cartcount: (userid) => {
    return new Promise(async (resolve, reject) => {
      console.log(userid);
      let count = 0;
      let cart = await cartmodel.findOne({ userId: userid });
      if (cart) {
        console.log(cart);
        count = cart.Cartdata.length;
      }
      console.log(count);
      resolve(count);
    });
  },

  //total amount///////////////////
  getTotalAmout: (userid) => {
    console.log(userid, "useriddddddddd");
    try {
      return new Promise(async (resolve, reject) => {
        Helpers.addproductdetails(userid).then((res) => {
          let response = {};
          cart = res.cart;
          console.log(cart, "its cart");
          let total;

          if (cart) {
            let cartlength = cart.Cartdata.length;

            if (cartlength >= 0) {
              total = cart.Cartdata.reduce((acc, curr) => {
                acc += curr.productId.price * curr.quantity;
                return acc;
              }, 0);
              console.log(total, "totalll");

              resolve(total);
            } else {
              console.log("its an error");
              (response.cartempty = true), resolve(response);
            }
          }
        });
      });
    } catch (err) {
      reject(err);
    }
  },

  getTotaldiscount: (userid) => {
    console.log(userid, "useriddddddddd");
    try {
      return new Promise(async (resolve, reject) => {
        Helpers.addproductdetails(userid).then((res) => {
          let response = {};
          cart = res.cart;
          let totaldiscount;

          if (cart) {
            let cartlength = cart.Cartdata.length;

            if (cartlength >= 0) {
              totaldiscount = cart.Cartdata.reduce((acc, curr) => {
                acc += curr.productId.discountprice * curr.quantity;
                return acc;
              }, 0);

              console.log(totaldiscount, "totallldiscount");

              resolve(totaldiscount);
            } else {
              console.log("its an error");
              (response.cartempty = true), resolve(response);
            }
          }
        });
      });
    } catch (err) {
      reject(err);
    }
  },
  getmrptotal: (userid) => {
    console.log(userid, "useriddddddddd");
    try {
      return new Promise(async (resolve, reject) => {
        Helpers.addproductdetails(userid).then((res) => {
          let response = {};
          cart = res.cart;
          console.log(cart, "its cart");
          let totalmrp;

          if (cart) {
            let cartlength = cart.Cartdata.length;

            if (cartlength >= 0) {
              totalmrp = cart.Cartdata.reduce((acc, curr) => {
                acc += curr.productId.MRP * curr.quantity;
                return acc;
              }, 0);

              resolve(totalmrp);
            } else {
              console.log("its an error");
              (response.cartempty = true), resolve(response);
            }
          }
        });
      });
    } catch (err) {
      reject(err);
    }
  },

  ///////////////////////////////////////coupen/////////////////////////////////////////////////

  addcoupen: (coupendata) => {
    return new Promise(async (resolve, reject) => {
      console.log(coupendata,"data of coupen");
      let coupen = new coupenmodel({
        Coupenname: coupendata.coupenname,
        CoupenCode: coupendata.coupencode,
        Discountprice: coupendata.discount,
        Coupenlimit: coupendata.coupenlimit,
        Date: new Date(),
      });
      coupen.save().then((coupens) => {
        resolve(coupens);
      });
    });
  },

  getcoupen: () => {
    return new Promise(async (resolve, reject) => {
      let response = {};

      let coupen = await coupenmodel.find().lean();

      response = coupen;
      resolve(response);
    });
  },

  deletecoupen: (coupenid) => {
    return new Promise(async (resolve, reject) => {
      coupenmodel.findByIdAndDelete({ _id: coupenid }).then((response) => {
        resolve(response);
      });
    });
  },

  getcoupenvalue: (coupenid) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let coupen = await coupenmodel.findOne({ _id: coupenid }).lean();

      response = coupen;
      resolve(response);
    });
  },

  updatecoupen: (coupenid, coupendata) => {
    console.log(coupenid, coupendata, "twoos");
    return new Promise(async (resolve, reject) => {
      coupenmodel
        .findByIdAndUpdate(coupenid, {
          Coupenname: coupendata.coupenname,
          CoupenCode: coupendata.coupencode,
          Discountprice: coupendata.discount,
          Coupenlimit: coupendata.limit,
        })
        .then((response) => {
          console.log(response, "here true or false");
          resolve(response);
        });
    });
  },

  applyCoupen: (userID, coupendata) => {
    console.log(userID, "useriddddddd");
    console.log("coupendataaaaaaa", coupendata);
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};

        response.discount = 0;
        let coupen = await coupenmodel.findOne({
          CoupenCode: coupendata.code,  
           
        })
       
        
        console.log(coupen,"coupenood");
        Helpers.getTotalAmout(userID).then(async (totalamount) => {
          console.log("totalamount", totalamount);

          if (coupen) {
            response.coupen = coupen;
            let coupenuser = await coupenmodel.findOne({
              CoupenCode: coupendata.code,
              userId: { $in: [userID] },
            });
            if (coupen.Coupenlimit <= totalamount) {
              console.log(coupen.Coupenlimit,"coupenlimit");
              response.Status = true;

              if (coupenuser) {
                response.Status = false;
                resolve(response);
              } else {
                response.Status = true;
                response.coupen = response;
                Helpers.addproductdetails(userID).then((cartprod) => {
                  Helpers.getTotaldiscount(userID).then((totaldiscount) => {
                    console.log(cartprod.cart, "productiddddd");
                    cart = cartprod.cart;

                    let grandtotal;

                    if (cart) {
                      let cartlength = cart.Cartdata.length;
                      if (cartlength >= 0) {
                        grandtotal = cart.Cartdata.reduce((acc, curr) => {
                          acc += curr.productId.price * curr.quantity;
                          return acc;
                        }, 0);

                        if (coupen.Discountprice <= coupen.Coupenlimit) {
                          coupen.Discountprice = coupen.Discountprice;
                        } else {
                          coupen.Discountprice = coupen.Coupenlimit;
                        }

                        grandtotal = grandtotal - coupen.Discountprice;

                        response.grandtotal = grandtotal;
                        response.coupen = coupen;
                        resolve(response);
                        console.log(response, "vanditta response");
                      } else {
                        resolve(response);
                      }
                    } else {
                      resolve(response);
                    }
                  });
                });
              }
            } else {
              response.Status = false;
              resolve(response);
              console.log(response, "hearelast response");
            }
          } else {
            response.Status = false;
            resolve(response);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  coupenUser: (userid, coupen) => {
    console.log(userid, coupen, "coupeniddddd");
    return new Promise(async (resolve, reject) => {
      try {
        let coupens = await coupenmodel.findOne({
          CoupenCode: coupen.code,
        });

        if (coupens) {
          await coupenmodel
            .findByIdAndUpdate(coupens._id, { $push: { userId: userid } })
            .then((response) => {
              console.log("ttttttttttt  ",response)
              resolve(response);
            });
        } else {
          Helpers.getTotalAmout(userid).then((response) => {
            resolve(response);
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  addorders: (orderdata, userid,coupon,invoiceid,mrp,productdiscount) => {
    console.log(invoiceid,"invoiceidddddddddd");
    console.log(mrp,"totalmrp");
    
    console.log("ya its a orderdata", orderdata);
    return new Promise((resolve, reject) => {
    
    console.log(coupon,"session coupen")
let date = new Date()
let newdate = date.toISOString()
newdate = newdate.slice(0,10)
console.log(newdate,"newdateeeeeeeeeeeeeeeeeeeeeee");
      try {
        if (orderdata.paymentdetails === "COD") {
          orderstatus = true;
        }
        Helpers.addproductdetails(userid).then((cartdetails) => {
          Helpers.getTotalAmout(userid).then((response) => {
            console.log(cartdetails,"cartdetails")
            console.log("total amount", response);
            // if (orderdata.discount) {
            //   response = response - orderdata.discount;
            // }
            console.log(response,"response at dataaaaaaa");

            console.log(cartdetails.cart, "cart detals may be get");
          if(coupon){
            var order = new ordermodel({
              userId: userid,
             
              OrderItems: cartdetails.cart.Cartdata,
              totalprice: response,
              paymentdetails: orderdata.paymentdetails,
              deliveystatus: "pending",
              deliverydetails: orderdata.deliverydetails,
              discount:  coupon.coupen.Discountprice,
              grandtotal:  coupon.grandtotal,
              orderstatus: true,
              productstatus: "pending",
              Date: new Date(),
              InvoiceID:invoiceid,
              totalmrp:mrp,
              productdiscount:productdiscount,
              newdate:newdate
              
            });
          }else{

            var order = new ordermodel({
              userId: userid,
             
              OrderItems: cartdetails.cart.Cartdata,
              totalprice: response,
              paymentdetails: orderdata.paymentdetails,
              deliveystatus: "pending",
              productstatus:"pending",
              deliverydetails: orderdata.deliverydetails,
              discount: null,
              grandtotal: null,
              orderstatus: true,
              InvoiceID:invoiceid,
              totalmrp:mrp,
              productdiscount:productdiscount,
              Date: new Date(),
              newdate:newdate

            });
          }
          order.save().then(async(orders) => {
            // let remove = await cartmodel.deleteOne({userId:userid})
            // console.log(remove)
              console.log("here orders", orders);
              resolve(orders);
            });
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  getOrder: (userid) => {
    return new Promise(async (resolve, reject) => {
      let order = await ordermodel.find({ userId: userid }).populate('OrderItems.productId').populate('deliverydetails').sort({'createdAt': -1}).lean();  
      resolve(order);
    });
  },

  getOrders: (userid) => {
    return new Promise(async (resolve, reject) => {
      let order = await ordermodel.find().populate('OrderItems.productId').populate('deliverydetails').populate('userId').lean();
      resolve(order);
    });
  },

  getOrdervalue: (orderid) => {
    console.log(orderid, "orderidd");
    return new Promise(async (resolve, reject) => {
      try {
        let order = await ordermodel.findOne({ _id: orderid }).populate('OrderItems.productId').populate('deliverydetails').lean();
    console.log(order,"order");
        resolve(order);
      } catch (error) {
        console.log(error, "error founded at cart controller");
        reject(error);
      }
    });
  },


  shipOrder:(orderid)=>{
    return new Promise((resolve,reject)=>{
      try{
        ordermodel.findByIdAndUpdate({_id:orderid},{productstatus:'shipped'}).then((response)=>{
          resolve(response)
        })
      }catch(error){
        reject(error);
      }
    })
  },

  DeliveredOrder:(orderid)=>{
       return new Promise((resolve,reject)=>{
        try{
          ordermodel.findByIdAndUpdate({_id:orderid},{productstatus:'delivered',deliveystatus:'success'}).then((response)=>{
            resolve(response)
        })
        }catch(error){  
          reject(error)
        }
       })
  },

  cancelorder:(orderid)=>{
    return new Promise((resolve,reject)=>{
      try{
        console.log("cancellation working");
        ordermodel.findByIdAndUpdate({_id:orderid},{productstatus:'Cancelled'}).then((response)=>{
          resolve(response)
        })
      }catch(error){
        reject(error)
      }
    })
  },
  ordercount:()=>{

    return new Promise(async(resolve,reject)=>{
      let orders =await Helpers.getOrders()
     
      let count =0;
       count = orders.length 
       console.log(count,"get orders count");
       resolve(count)

    })
    
  },
  getusercount:()=>{
    console.log("get userdata");
    return new Promise (async(resolve,reject)=>{
        let count =0
        let users = await usercontroller.getuserdatas()
        console.log(users,"userssssssssss")
        count = users.length
        console.log(count,"usr count");
        resolve(count)
    })
  },
  prodictcount:()=>{
    return new Promise(async(resolve,reject)=>{
   let count = 0
   let products = await productController.getPoductdetails()
   console.log(products,"productsssssssssss");
     count = products.data.length
     console.log(count,"productcountttttttttttttttttt");
     resolve(count)

    })
  },
  gettotalnetbanking:()=>{
  return new Promise(async(resolve,reject)=>{
    // let cod = await Helpers.getOrders()
    let netbanking =await ordermodel.find({paymentdetails : 'netbanking'},{_id:0,paymentdetails:1})
    console.log(netbanking,"codddddddddd");
    count =0
    count =  netbanking.length
    console.log( netbanking,"jjjjjjjjjjjj");
    resolve(count)

  })
  },
  gettotalcod:()=>{
    return new Promise(async(resolve,reject)=>{
      // let cod = await Helpers.getOrders()
      let cod =await ordermodel.find({paymentdetails : 'COD'},{_id:0,paymentdetails:1})
      console.log(cod,"codddddddddd");
      count =0
      count =  cod.length
      console.log( cod,"jjjjjjjjjjjj");
      resolve(count)
  
    })
    },
    getsucessdelivey:()=>{
      return new Promise(async(resolve,reject)=>{
        // let cod = await Helpers.getOrders()
        let delivery =await ordermodel.find({deliveystatus :'success'},{_id:0,deliveystatus:1})
        console.log(delivery,"codddddddddd");
        count =0
        count =  delivery.length
        console.log( delivery,"jjjjjjjjjjjj");
        resolve(count)
    
      })
      },
      getpendingdelivey:()=>{
        return new Promise(async(resolve,reject)=>{
          // let cod = await Helpers.getOrders()
          let pending =await ordermodel.find({deliveystatus :'pending'},{_id:0,deliveystatus:1})
          console.log(pending,"codddddddddd");
          count =0
          count =  pending.length
          console.log( pending,"jjjjjjjjjjjj");
          resolve(count)
      
        })
        },
        gettotalincome:()=>{
          return new Promise(async(resolve,reject)=>{
          try{
            let wholeincome =await ordermodel.find().lean()
            console.log(wholeincome,"wholeincome");
            var a=0;
            var b=0;
            var totalamount=0;
            var grandtotal=0;
            for(let i=0;i<wholeincome.length;i++){
              if(wholeincome[i].grandtotal==null){
                for(let x=a;x<=a;x++){
                  totalamount=totalamount+wholeincome[i].totalprice;
                }
              }else{
                for(let y=b;y<=b;y++){
                  grandtotal=grandtotal+wholeincome[i].grandtotal;
                }

              }
            }
            console.log(totalamount,grandtotal,'both are given below');
            totalincome=totalamount+grandtotal;
            console.log(totalincome,'thsi is  total income....');
            resolve(totalincome)
          
          }catch(err){
            reject(err,"error founded")
          }
        })
},

gettotalincome:()=>{
  return new Promise(async(resolve,reject)=>{
  try{
    let wholeincome =await ordermodel.find().lean()
    console.log(wholeincome,"wholeincome");
    var a=0;
    var b=0;
    var totalamount=0;
    var grandtotal=0;
    console.log(wholeincome.length,'is the wolelenght');
    for(let i=0;i<wholeincome.length;i++){
      if(wholeincome[i].grandtotal==null ){
        for(let x=a;x<=a;x++){
          totalamount=totalamount+wholeincome[i].totalprice;
        }
      }else{
        for(let y=b;y<=b;y++){
          grandtotal=grandtotal+wholeincome[i].grandtotal;
        }

      }
    }
    console.log(totalamount,grandtotal,'both are given below');
    totalincome=totalamount+grandtotal;
    console.log(totalincome,'thsi is  total income....');
    resolve(totalincome)
  
  }catch(err){
    reject(err,"error founded")
  }
})
},

todayIncome:()=>{
  return new Promise(async(resolve,reject)=>{
  try{
    let today=new Date().toISOString();
    let day=today.slice(0,10);
    console.log(day,'is today');
    let wholeincome =await ordermodel.find({newdate:day}).lean()
    console.log(wholeincome,"wholeincome");
    var a=0;
    var b=0;
    var totalamount=0;
    var grandtotal=0;
    console.log(wholeincome.length,'is the length of the array');
    for(let i=0;i<wholeincome.length;i++){
      if(wholeincome[i].grandtotal==null ){
        for(let x=a;x<=a;x++){
          totalamount=totalamount+wholeincome[i].totalprice;
          console.log(totalamount,'is totalamount tody');
        }
      }else{
        for(let y=b;y<=b;y++){
          grandtotal=grandtotal+wholeincome[i].grandtotal;
          console.log(grandtotal,'is grandtotal toady');
        }

      }
    }
    console.log(totalamount,grandtotal,'both are given below');
    totalincome=totalamount+grandtotal;
    console.log(totalincome,'thsi is  total income....');
    resolve(totalincome)
    console.console.log("day by day income",totalincome);
  
  }catch(err){
    reject(err,"error founded")
  }
})
},

cancellorders:()=>{
  return new Promise(async(resolve,reject)=>{

    let cancelled =await ordermodel.find({productstatus :'Cancelled'},{_id:0,productstatus:1})
    let count = 0
    count = cancelled.length
    resolve(count)
  })
},
deliveredorders:()=>{
  return new Promise(async(resolve,reject)=>{

    let delivered =await ordermodel.find({productstatus :'delivered'},{_id:0,productstatus:1})
    let count = 0
    count = delivered.length
    resolve(count)
  })
},
pendingorders:()=>{
  return new Promise(async(resolve,reject)=>{

    let pending =await ordermodel.find({productstatus :'pending'},{_id:0,productstatus:1})
    let count = 0
    count = pending.length
    resolve(count)
  })
},

shippedorders:()=>{
return new Promise(async(resolve,reject)=>{
  let shipped = await ordermodel.find({productstatus:'shipped'},{_id:0,productstatus:1})
  let count =0
  count = shipped.length
  console.log(count,"shippped")
  resolve(count)
})
},


}

module.exports = Helpers;
