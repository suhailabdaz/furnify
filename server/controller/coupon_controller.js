const couponModel=require("../model/coupon_model")




const createCoupon=async(req,res)=>{
    try{

        const newCoupon= await couponModel.create(req.body)
        res.json(newCoupon)

    }
    catch(err){

    }
}

const couponList=async(req,res)=>{
    try{
        const coupons=await couponModel.find({})
        res.render('admin/couponList',{coupons})

    }
    catch(err){
        console.log(err)

    }
}

const addcouponpage=async(req,res)=>{
    try{
        res.render('admin/addCoupon')
    }
    catch(err){
        console.log(err)
    }
}


module.exports={
    createCoupon,couponList,
    addcouponpage
}