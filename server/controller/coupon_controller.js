const couponModel=require("../model/coupon_model")

const createCoupon=async(req,res)=>{
    try{
        console.log("ethiib=vida")
        const {couponCode,minimumPrice,discount,expiry}=req.body
        console.log(req.body);

        const couponExists = await couponModel.findOne({ couponCode: couponCode });
    
        if (couponExists) {
            console.log("Coupon exists");
            res.redirect('/admin/couponList');
        } else {
            await couponModel.create({
                couponCode: couponCode,
                minimumPrice:minimumPrice,
                discount:discount,
                expiry:expiry 
                })
            console.log("COUPON created");
            res.redirect('/admin/couponList');
            



    }
}
    catch(err){
        console.log(err);
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
    createCoupon,
    couponList,
    addcouponpage
}