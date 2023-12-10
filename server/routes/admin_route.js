const express=require('express')
const admin_controller=require('../controller/admin_controller')
const product_controller=require("../controller/product_controller")
const order_controller=require("../controller/order_controller")
const coupon_controller=require("../controller/coupon_controller")
const auth=require("../../middleware/isAuth")
const multer=require('multer')
const upload=multer({dest:'uploads/'})


const app=express();


app.use(express.static('public/admin_assets'))

const adrouter=express.Router()
adrouter.use(express.urlencoded({extended:true}))

adrouter.get('/',auth.logoutAdmin,admin_controller.login)
adrouter.post('/adminlogin',admin_controller.adminloginpost)
adrouter.get('/adminpanel',auth.loggedadmin,admin_controller.adminpanel)
adrouter.get('/userslist',auth.loggedadmin,admin_controller.userslist)
adrouter.get('/update/:email',auth.loggedadmin,admin_controller.userupdate)
adrouter.post('/searchUser',auth.loggedadmin,admin_controller.searchUser)
adrouter.get('/searchview',auth.loggedadmin,admin_controller.searchview)
adrouter.get('/filter/:option',auth.loggedadmin,admin_controller.filter)
adrouter.get('/adminlogout',auth.logouting)
adrouter.post('/chartData',auth.loggedadmin,admin_controller.chartData)

adrouter.get('/category',auth.loggedadmin,admin_controller.category)
adrouter.get('/newcat',auth.loggedadmin,admin_controller.newcat)
adrouter.post('/add-category',auth.loggedadmin,admin_controller.addcategory)
adrouter.get('/unlistcat/:id',auth.loggedadmin,admin_controller.unlistcat)
adrouter.get('/updatecat/:id',auth.loggedadmin,admin_controller.updatecat)
adrouter.post('/update-category/:id',auth.loggedadmin,admin_controller.updatecategory)

adrouter.get('/product',auth.loggedadmin,product_controller.products)
adrouter.get('/newproduct',auth.loggedadmin,product_controller.newproduct)
adrouter.post('/addproduct',auth.loggedadmin,upload.array('images'),product_controller.addproduct)
adrouter.get('/unlist/:id',auth.loggedadmin,product_controller.unlist)
adrouter.get('/deletepro/:id',auth.loggedadmin,product_controller.deletepro)
adrouter.get('/updatepro/:id',auth.loggedadmin,product_controller.updatepro)
adrouter.get('/editimg/:id',auth.loggedadmin,product_controller.editimg)
adrouter.get('/deleteimg',auth.loggedadmin,product_controller.deleteimg)
adrouter.get('/resizeimg',auth.loggedadmin,product_controller.resizeImage)
adrouter.post('/updateimg/:id',auth.loggedadmin,upload.array('images'),product_controller.updateimg)
adrouter.post('/updateproduct/:id',auth.loggedadmin,product_controller.updateproduct)

adrouter.get('/orderPage',auth.loggedadmin,order_controller.orderPage)
adrouter.post('/updateOrderStatus',auth.loggedadmin,order_controller.updateOrderStatus)




adrouter.get('/couponList',auth.loggedadmin,coupon_controller.couponList)
adrouter.get('/newcoupon',auth.loggedadmin,coupon_controller.addcouponpage)
adrouter.post('/add_coupon',auth.loggedadmin,coupon_controller.createCoupon)










module.exports= adrouter