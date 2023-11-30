const mongoose=require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/furnify")

const couponSchema=new mongoose.Schema({
    couponCode:{
        type:String,
        required:true,
        upppercase:true
    },
    minimumPrice:{
        type:Number,
        required:true,
},
   
    discount:{
        type:Number,
        min:0,
        max:100,
        required:true
    },
    expiry:{
        type:Date,
        required:true
    },
    status:{
        type:Boolean,
        required:true,
        default:true
    }
})


couponSchema.index({expiry:1},{expireAfterSeconds:0})

const couponModel=new mongoose.model("coupons",couponSchema)

module.exports=couponModel