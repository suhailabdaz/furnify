const couponModel=require("../model/coupon_model")

const createCoupon=async(req,res)=>{
    try{
        const {couponCode,minimumPrice,discount,expiry,maxRedeem,couponType}=req.body

        const couponExists = await couponModel.findOne({ couponCode: couponCode });
    
        if (couponExists) {
            console.log("Coupon exists");
            res.redirect('/admin/couponList');
        } else {
            await couponModel.create({
                couponCode: couponCode,
                type:couponType,
                minimumPrice:minimumPrice,
                discount:discount,
                maxRedeem:maxRedeem,
                expiry:expiry 
                })
            console.log("COUPON created");
            res.redirect('/admin/couponList');

    }
}
catch (err) {
    console.log(err);
    res.render("users/serverError")
}
}

const couponList=async(req,res)=>{
    try{
        const coupons=await couponModel.find({})
        res.render('admin/couponList',{coupons})

    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}

const addcouponpage=async(req,res)=>{
    try{
        res.render('admin/addCoupon')
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}

const unlistCoupon=async (req,res)=>{
    try{
        const id = req.params.id;
        const coupon = await couponModel.findOne({ _id: id });

        coupon.status = !coupon.status;
        await coupon.save();
        res.redirect('/admin/couponList')
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}

const editCouponPage=async (req,res)=>{
    try{
        const id=req.params.id
        const coupon=await couponModel.findOne({_id:id})
        res.render('admin/editCouponPage',{coupon:coupon})
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}

const updateCoupon=async(req,res)=>{
    try{
        const {couponId,couponCode,minimumPrice,discount,expiry,maxRedeem,couponType}=req.body

        const couponExists = await couponModel.findOne({ couponCode: couponCode });
    
        if (couponExists) {
            console.log("Coupon exists");
            res.redirect('/admin/couponList');
        } else {

            const updatedCoupon = await couponModel.findByIdAndUpdate(
                couponId,
                {
                    $set: {
                        couponCode:couponCode,
                        type:couponType,
                        minimumPrice:minimumPrice,
                        discount:discount,
                        maxRedeem:maxRedeem,
                        expiry:expiry,
                    }
                }
                
            );
        
            console.log("COUPON created");
            res.redirect('/admin/couponList');
    
    }


    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}


module.exports={
    createCoupon,
    couponList,
    addcouponpage,
    unlistCoupon,
    editCouponPage,
    updateCoupon
}