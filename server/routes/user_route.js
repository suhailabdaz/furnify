const express=require("express")
const usrouter=express.Router()
const user_controller=require("../controller/user_controller")
const cart_controller=require("../controller/cart_controller")
const profile_controller=require("../controller/profile_controller")
const checkout_controller=require("../controller/checkout_controller")
const rating_controller=require("../controller/rating_controller")
const banner_controller=require('../controller/banner_controller')
const auth=require('../../middleware/isAuth')

usrouter.get("/",user_controller.home)

usrouter.get("/bannerURL",banner_controller.bannerURL)

usrouter.post("/searchProducts",user_controller.searchProducts)

usrouter.get("/shop",user_controller.shop)

usrouter.get('/filterProducts',user_controller.filterProducts)

usrouter.get('/sortProducts',user_controller.sortProducts)

usrouter.get('/singleproduct/:id',user_controller.singleproduct)

usrouter.get("/profile",user_controller.profile)

usrouter.get("/signup",auth.iflogged,user_controller.signup)

usrouter.post("/signupotp",user_controller.signupotp)

usrouter.get('/otp',auth.checkSessionVariable('otppressed','/'),user_controller.otp)

usrouter.post("/verifyotp",auth.iflogged,user_controller.verifyotp)

usrouter.post("/resendotp",auth.iflogged,user_controller.resendotp)

usrouter.post("/loginaction",user_controller.loginaction)

usrouter.get("/forgotpassword",auth.checkSessionVariable('forgetpressed','/'),user_controller.forgotpassword)

usrouter.post("/forgotpasspost",user_controller.forgotpasspost)

usrouter.get('/newpassword',auth.checkSessionVariable('newpasspressed','/'),user_controller.new_password)

usrouter.post('/resetpassword',user_controller.reset_password)

// cart section

usrouter.get('/cartpage',auth.islogged,cart_controller.showcart)

usrouter.get('/addtocart/:id',auth.islogged,cart_controller.addToCart)

usrouter.get('/deletcart/:id/',auth.islogged,cart_controller.deletecart)

usrouter.post('/update-cart-quantity/:productId',auth.islogged,cart_controller.updatecart)

usrouter.get('/checkoutpage',auth.checkSessionVariable('checkout','/'),cart_controller.checkoutpage)

// profile Selection

usrouter.get('/logout',auth.islogged,user_controller.logout)

usrouter.get('/userdetails',auth.islogged,profile_controller.userdetails)

usrouter.get('/editProfile',auth.islogged,profile_controller.profileEdit)

usrouter.post('/updateprofile',auth.islogged,profile_controller.profileUpdate)

usrouter.get('/addAddress',auth.islogged,profile_controller.newAddress)

usrouter.post('/addressUpdating',auth.islogged,profile_controller.addressUpdate)

usrouter.post('/cp',auth.islogged,profile_controller.changepassword)

usrouter.get('/editaddress/:addressId',auth.islogged,profile_controller.editaddress)

usrouter.post('/updateaddress/:addressId',auth.islogged, profile_controller.updateAddress)

usrouter.get('/deleteaddress/:addressId',auth.islogged, profile_controller.deleteAddress)

usrouter.get('/orderHistory',auth.islogged,profile_controller.orderHistory)

usrouter.get('/singleOrder/:id',auth.islogged,profile_controller.singleOrderPage)

usrouter.get('/cancelorder/:id',auth.islogged,profile_controller.ordercancelling)

usrouter.get('/returnorder/:id',auth.islogged,profile_controller.orderreturning)

usrouter.get('/cancelitem/:id/:orderId',auth.islogged,profile_controller.itemcancelling)

usrouter.get('/returnitem/:id/:orderId',auth.islogged,profile_controller.itemreturning)

usrouter.get('/rateAndReview',auth.islogged,rating_controller.ratePage)

usrouter.get('/favouritespage',auth.islogged,cart_controller.favouritespage)

usrouter.get('/addtofavourites/:id',auth.islogged,cart_controller.addToFvourites)

usrouter.get('/deletefav/:id',auth.islogged,cart_controller.deletefav)

usrouter.get("/addtocartviafav/:id",auth.islogged,cart_controller.addtocartviafav)

usrouter.get("/download-invoice/:orderId",auth.islogged,profile_controller.downloadInvoice)

usrouter.get('/wallet',auth.islogged,profile_controller.wallet)

usrouter.post('/walletcreate/orderId',auth.islogged,profile_controller.walletupi)

usrouter.post('/walletTopup',auth.islogged,profile_controller.walletTopup)

usrouter.get("/Rewards",auth.islogged,profile_controller.couponsAndRewards)

//checkoutsection

usrouter.post("/applyCoupon",checkout_controller.applyCoupon)

usrouter.post("/revokeCoupon",checkout_controller.revokeCoupon)


usrouter.post('/checkoutreload',auth.islogged,checkout_controller.checkoutreload)

usrouter.post('/placeOrder',auth.islogged,checkout_controller.placeOrder)

usrouter.post('/wallettransaction',auth.islogged,checkout_controller.wallettransaction)

usrouter.post('/create/orderId',auth.islogged,checkout_controller.upi)
























module.exports=usrouter