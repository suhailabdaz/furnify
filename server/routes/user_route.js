const express=require("express")
const usrouter=express.Router()
const user_controller=require("../controller/user_controller")
const cart_controller=require("../controller/cart_controller")
const profile_controller=require("../controller/profile_controller")
const checkout_controller=require("../controller/checkout_controller")
const auth=require('../../middleware/isAuth')
usrouter.get("/",user_controller.home)

usrouter.get("/shop",user_controller.shop)

usrouter.get('/singleproduct/:id',user_controller.singleproduct)

usrouter.get("/profile",user_controller.profile)

usrouter.get("/signup",auth.checkSessionVariable('signupPressed','/'),user_controller.signup)

usrouter.post("/signupotp",auth.iflogged,user_controller.signupotp)

usrouter.get('/otp',auth.checkSessionVariable('otppressed','/'),user_controller.otp)

usrouter.post("/verifyotp",auth.iflogged,user_controller.verifyotp)

usrouter.post("/resendotp",auth.iflogged,user_controller.resendotp)

usrouter.post("/loginaction",user_controller.loginaction)

usrouter.get("/forgotpassword",auth.checkSessionVariable('forgrtpressed','/profile'),user_controller.forgotpassword)

usrouter.post("/forgotpasspost",user_controller.forgotpasspost)

usrouter.get('/newpassword',auth.checkSessionVariable('newpasspressed','/profile'),user_controller.new_password)

usrouter.post('/resetpassword',user_controller.reset_password)

// cart section

usrouter.get('/cartpage',auth.islogged,cart_controller.showcart)

usrouter.get('/addtocart/:id',auth.islogged,cart_controller.addToCart)

usrouter.get('/deletcart/:id/',auth.islogged,cart_controller.deletecart)

usrouter.post('/update-cart-quantity/:productId',auth.islogged,cart_controller.updatecart)

usrouter.get('/checkoutpage',auth.islogged,cart_controller.checkoutpage)

// profile Selection

usrouter.get('/logout',auth.islogged,user_controller.logout)

usrouter.get('/userdetails',auth.islogged,profile_controller.userdetails)

usrouter.get('/editProfile',auth.islogged,profile_controller.profileEdit)

usrouter.post('/updateprofile',auth.islogged,profile_controller.profileUpdate)

usrouter.get('/addAddress',auth.islogged,profile_controller.newAddress)

usrouter.post('/addressUpdating',auth.islogged,profile_controller.addressUpdate)

usrouter.post('/cp',auth.islogged,profile_controller.changepassword)

usrouter.get('/editaddress/:addressId',auth.islogged,profile_controller.editaddress)

usrouter.post('/updateaddress/:addressId',auth.islogged, profile_controller.updateAddress);

usrouter.get('/deleteaddress/:addressId',auth.islogged, profile_controller.deleteAddress);

usrouter.get('/orderHistory',auth.islogged,profile_controller.orderHistory)

usrouter.get('/cancelorder/:id',auth.islogged,profile_controller.ordercancelling)

usrouter.get('/favouritespage',auth.islogged,cart_controller.favouritespage)

usrouter.get('/addtofavourites/:id',auth.islogged,cart_controller.addToFvourites)

usrouter.get('/deletefav/:id',auth.islogged,cart_controller.deletefav)

usrouter.get("/addtocartviafav/:id",auth.islogged,cart_controller.addtocartviafav)

//checkoutsection

usrouter.post("/applyCoupon",checkout_controller.applyCoupon)

usrouter.post('/checkoutreload',auth.islogged,checkout_controller.checkoutreload)

usrouter.post('/placeOrder',auth.islogged,checkout_controller.placeOrder)

usrouter.post('/create/orderId',auth.islogged,checkout_controller.upi)

























module.exports=usrouter