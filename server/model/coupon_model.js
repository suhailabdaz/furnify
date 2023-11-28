const mongoose=require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/furnify")

const couponSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        upppercase:true
    },
    expiry:{
        type:Date,
        required:true
    },
    discount:{
        type:Number,
        required:true
    }
})

const couponModel=new mongoose.model("coupons",couponSchema)

module.exports=couponModel