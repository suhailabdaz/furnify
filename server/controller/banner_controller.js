const bannerModel=require('../model/banner_model')



const bannerList=async(req,res)=>{
    try{
        const banners=await bannerModel.find({})
         res.render("admin/bannerList",banners)
    }
    catch(err){
            console.log(err);
    }
}

const addbanner = async (req, res) => {
    try {
        res.render('admin/newBanner');
    } catch (err) {
        console.log(err);
        res.send("Error Occurred");
    }
}

const addBannerPost=async(req,res)=>{
    try{
        const { bannerLabel, bannerTitle, bannerimage,bannerSubtitle} = req.body

    }
    catch(err){
        console.log(err);
        res.send("error  occured posting")
    }
}

module.exports={
    bannerList,
    addbanner,
    addBannerPost
}