const couponModel=require("../model/coupon_model")




const createCoupon=async(req,res)=>{
    try{

        const newCoupon= await couponModel.create(req.body)
        res.json(newCoupon)

    }
    catch(err){

    }
}


module.exports={
    createCoupon
}