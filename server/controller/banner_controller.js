const bannerModel=require('../model/banner_model');
const categoryModel = require('../model/category_model');
const productModel = require('../model/product_model');
const couponModel=require('../model/coupon_model');
const mongoose=require('mongoose');



const bannerList=async(req,res)=>{
    try{
        const banners=await bannerModel.find({})
        console.log(banners);
         res.render("admin/bannerList",{banners:banners})
    }
    catch(err){
            console.log(err);
    }
}

const addbanner = async (req, res) => {
    try {
        const categories=await categoryModel.find();
        const products=await productModel.find();
        const coupons=await couponModel.find();
        res.render('admin/newBanner',{categories,products,coupons});
    } catch (err) {
        console.log(err);
        res.send("Error Occurred");
    }
}

const addBannerPost=async(req,res)=>{
    try{
        
        const { bannerLabel, bannerTitle, bannerimage,bannerSubtitle,bannerColor} = req.body

        const isValidObjectId = mongoose.Types.ObjectId.isValid;
        let bannerLink

       if(bannerLabel=="category"){
        bannerLink=req.body.category
       }
       else if(bannerLabel=="product"){
        bannerLink=req.body.product
       }
       else if(bannerLabel=="coupon"){
        bannerLink=req.body.coupon
       }
       else{
        bannerLink="general"
       }
        const newBanner = new bannerModel({
            label: bannerLabel,
            title: bannerTitle,
            subtitle:bannerSubtitle,
            
            image: {
                public_id: req.file.filename, 
                url: `/uploads/${req.file.filename}` 
            },
            color:bannerColor,
            bannerlink:bannerLink

           
        })
         
    await newBanner.save()
    const banners=await bannerModel.find()
    res.render("admin/bannerList",{banners:banners})
   
    }
    catch(err){
        console.log(err);
        res.send("error  occured posting")
    }
}

const unlistBanner=async(req,res)=>{
    try {
        const id = req.params.id;
        const banner= await bannerModel.findOne({ _id: id });


        banner.active = !banner.active;
        await banner.save();

        res.redirect('/admin/bannerList')
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const updateBanner = async (req, res) => {
    try {
        const id = req.params.id
        const banner = await bannerModel.findOne({ _id: id });
        const categories=await categoryModel.find();
        const products=await productModel.find();
        const coupons=await couponModel.find();
       
        res.render('admin/updateBanner', { banner: banner,categories:categories,products:products,coupons:coupons })
    } catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const updateBannerPost = async (req, res) => {
    try {
        const id = req.params.id
        const { bannerLabel,bannerTitle,bannerSubtitle,bannerImage } = req.body
        console.log("the filke is here",req.file);
        const banner=await bannerModel.findOne({_id:id})

        let bannerLink;

        if(bannerLabel=="category"){
            bannerLink=req.body.category
           }
           else if(bannerLabel=="product"){
            bannerLink=req.body.product
           }
           else if(bannerLabel=="coupon"){
            bannerLink=req.body.coupon
           }
           else{
            bannerLink="general"
           }


        banner.bannerlink=bannerLink;
        banner.label = bannerLabel;
        banner.title = bannerTitle;
        banner.subtitle = bannerSubtitle;
        banner.color=req.body.bannerColor
        if (req.file) {
            banner.image = {
            public_id: req.file.filename, 
            url: `/uploads/${req.file.filename}` 
        }
    }

        await banner.save()
        res.redirect('/admin/bannerList')
}
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const deleteBanner=async(req,res)=>{
    try{
        const bannerId = req.params.id;
        const deletedBanner = await bannerModel.findByIdAndDelete(bannerId);
        res.redirect('/admin/bannerList')

    }
    catch(err){
        console.log(err);
        res.send('error occured')
    }
}

const bannerURL=async(req,res)=>{
    try{

        const bannerId=req.query.id
        const banner=await bannerModel.findOne({_id:bannerId})
        if(banner.label=="category"){
            const categoryId=mongoose.Types.ObjectId(banner.bannerlink)
            const  category=await categoryModel.findOne({_id: categoryId})
            res.redirect(`/shop/?category=${categoryId}`)
            
        }
        else if(banner.label=="product"){
            const productId=new mongoose.Types.ObjectId(banner.bannerlink)
            const  product=await productModel.findOne({_id: productId})
            res.redirect(`/singleproduct/${productId}`)
        
        }
        else if(banner.label=="coupon"){
            const couponId=new mongoose.Types.ObjectId(banner.bannerlink)
            const  coupon=await couponModel.findOne({_id: couponId})
            res.redirect("/Rewards")
        
        }
        else{
            res.redirect("/")
        }

    }
    catch(err){
        console.log(err);
        res.send(err)
    }
}

module.exports={
    bannerList,
    addbanner,
    addBannerPost,
    unlistBanner,
    updateBanner,
    updateBannerPost,
    deleteBanner,
    bannerURL
}