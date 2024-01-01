const couponModel=require("../model/coupon_model")
const {alphanumValid,
    onlyNumbers,
    zerotonine,
    uppercaseAlphanumValid,
    isFutureDate}=require("../../utils/validators/admin_validators")

const createCoupon=async(req,res)=>{
    try{
        const {couponCode,minimumPrice,discount,expiry,maxRedeem,couponType}=req.body

        const couponValid=uppercaseAlphanumValid(couponCode)
        const minimumValid = onlyNumbers(minimumPrice) 
        const discountValid = onlyNumbers(discount)
        const expiryValid= isFutureDate(expiry)
        const maxredeemValid = onlyNumbers(maxRedeem)
        const coupontypeValid = alphanumValid(couponType)

        req.session.couponInfo=req.body

        if(!couponValid){
            req.flash("codeError","only Uppercase letters Allowed")
            return res.redirect("/admin/newcoupon")
        }
        else if(!minimumValid){
            req.flash("minError","Invalid Data")
            return res.redirect("/admin/newcoupon")
        }
        else if(!discountValid){
            req.flash("discountError","Invalid Data")
            return res.redirect("/admin/newcoupon")
        }
        else if(!expiryValid){
            req.flash("expiryError","Invalid Data")
            return res.redirect("/admin/newcoupon")
        }
        else if(!maxredeemValid){
            req.flash("maxError","Invalid Data")
            return res.redirect("/admin/newcoupon")

        }
        else if(!coupontypeValid){
            req.flash("typeError","Invalid Data")
            return res.redirect("/admin/newcoupon")
        }


        const couponExists = await couponModel.findOne({ couponCode: couponCode });
        if (couponExists) {
            req.flash("couponExistsError","coupon code Exists")
            res.redirect('/admin/newcoupon');
        } else {
            req.session.couponInfo=null
            await couponModel.create({
                couponCode: couponCode,
                type:couponType,
                minimumPrice:minimumPrice,
                discount:discount,
                maxRedeem:maxRedeem,
                expiry:expiry 
                })
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
        res.render('admin/addCoupon',{couponInfo:req.session.couponInfo,expressFlash:{
        codeError:req.flash("codeError"),
    minimumError:req.flash("minError"),
    discountError:req.flash("discountError"),
    expiryError:req.flash("expiryError"),
    maxError:req.flash("maxError"),
    typeError:req.flash("typeError"),
    existsError:req.flash("couponExistsError")
        }})
        req.session.couponInfo=null
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
        res.render('admin/editCouponPage',{coupon:coupon,expressFlash:{
            codeError:req.flash("codeError"),
            minimumError:req.flash("minError"),
            discountError:req.flash("discountError"),
            expiryError:req.flash("expiryError"),
            maxError:req.flash("maxError"),
            typeError:req.flash("typeError"),
            existsError:req.flash("couponExistsError")}})
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}

const updateCoupon=async(req,res)=>{
    try{
        const id = req.params.id

        const  currentCoupon= await couponModel.find({_id:id})

        

        const {couponId,couponCode,minimumPrice,discount,expiry,maxRedeem,couponType}=req.body

        const couponValid=uppercaseAlphanumValid(couponCode)
        const minimumValid = onlyNumbers(minimumPrice) 
        const discountValid = onlyNumbers(discount)
        const expiryValid= isFutureDate(expiry)
        const maxredeemValid = onlyNumbers(maxRedeem)
        const coupontypeValid = alphanumValid(couponType)

        if(!couponValid){
            req.flash("codeError","only Uppercase letters Allowed")
            return res.redirect(`/admin/editCouponGet/${id}`)
        }
        else if(!minimumValid){
            req.flash("minError","Invalid Data")
            return res.redirect(`/admin/editCouponGet/${id}`)
        }
        else if(!discountValid){
            req.flash("discountError","Invalid Data")
            return res.redirect(`/admin/editCouponGet/${id}`)
        }
        else if(!expiryValid){
            req.flash("expiryError","Invalid Data")
            return res.redirect(`/admin/editCouponGet/${id}`)
        }
        else if(!maxredeemValid){
            req.flash("maxError","Invalid Data")
            return res.redirect(`/admin/editCouponGet/${id}`)

        }
        else if(!coupontypeValid){
            req.flash("typeError","Invalid Data")
            return res.redirect(`/admin/editCouponGet/${id}`)
        }

    

        const currCouponCode = currentCoupon.couponCode;

        const couponExists = await couponModel.findOne({
            $and: [
                { couponCode: couponCode }, // Your original condition
                { couponCode: { $ne: currCouponCode } } // Exclude current coupon
            ]
        });
            
        if (couponExists) {
            req.flash("couponExistsError","coupon code Exists")
            return res.redirect(`/admin/editCouponGet/${id}`)
        }
        else {

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