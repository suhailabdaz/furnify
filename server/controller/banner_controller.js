const bannerModel=require('../model/banner_model')



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
        res.render('admin/newBanner');
    } catch (err) {
        console.log(err);
        res.send("Error Occurred");
    }
}

const addBannerPost=async(req,res)=>{
    try{
        const { bannerLabel, bannerTitle, bannerimage,bannerSubtitle} = req.body
       

        const newBanner = new bannerModel({
            label: bannerLabel,
            title: bannerTitle,
            subtitle:bannerSubtitle,
            
            image: {
                public_id: req.file.filename, 
                url: `/uploads/${req.file.filename}` 
            }
           
        })
         
    newBanner.save()
    .then(() => {
        res.redirect('/admin/bannerList');
    })
    .catch((error) => {
        res.status(500).send('Error uploading banner');
        console.error(error);
    });
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
        console.log(banner);
        res.render('admin/updateBanner', { banner: banner })
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
        banner.label = bannerLabel;
        banner.title = bannerTitle;
        banner.subtitle = bannerSubtitle;
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

module.exports={
    bannerList,
    addbanner,
    addBannerPost,
    unlistBanner,
    updateBanner,
    updateBannerPost
}