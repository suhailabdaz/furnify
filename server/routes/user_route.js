const express=require("express")
const usrouter=express.Router()
const user_controller=require("../controller/user_controller")
const cart_controller=require("../controller/cart_controller")
const profile_controller=require("../controller/profile_controller")
const checkout_controller=require("../controller/checkout_controller")

usrouter.get("/",user_controller.home)

usrouter.get("/shop",user_controller.shop)

usrouter.get('/singleproduct/:id',user_controller.singleproduct)

usrouter.get("/profile",user_controller.profile)

usrouter.get("/signup",user_controller.signup)

usrouter.post("/signupotp",user_controller.signupotp)

usrouter.get('/otp',user_controller.otp)

usrouter.post("/verifyotp",user_controller.verifyotp)

usrouter.post("/resendotp",user_controller.resendotp)

usrouter.post("/loginaction",user_controller.loginaction)

usrouter.get("/forgotpassword",user_controller.forgotpassword)

usrouter.post("/forgotpasspost",user_controller.forgotpasspost)

usrouter.get('/newpassword',user_controller.new_password)

usrouter.post('/resetpassword',user_controller.reset_password)

// cart section

usrouter.get('/cartpage',cart_controller.showcart)

usrouter.get('/addtocart/:id',cart_controller.addToCart)

usrouter.get('/deletcart/:id/',cart_controller.deletecart)

usrouter.post('/update-cart-quantity/:productId',cart_controller.updatecart)

usrouter.get('/checkoutpage',cart_controller.checkoutpage)

// profile Selection

usrouter.get('/logout',user_controller.logout)

usrouter.get('/userdetails',profile_controller.userdetails)

usrouter.get('/editProfile',profile_controller.profileEdit)

usrouter.post('/updateprofile',profile_controller.profileUpdate)

usrouter.get('/addAddress',profile_controller.newAddress)

usrouter.post('/addressUpdating',profile_controller.addressUpdate)

usrouter.post('/cp',profile_controller.changepassword)

usrouter.get('/editaddress/:addressId',profile_controller.editaddress)

usrouter.post('/updateaddress/:addressId', profile_controller.updateAddress);

usrouter.get('/deleteaddress/:addressId', profile_controller.deleteAddress);

//checkoutsection

usrouter.post('/checkoutreload',checkout_controller.checkoutreload)

usrouter.post('/placeOrder',checkout_controller.placeOrder)























module.exports=usrouter