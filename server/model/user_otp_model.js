const mongoose=require("mongoose")
const bcyrpt= require('bcrypt')





const otpSchema = new mongoose.Schema({

    email: { type: String, required: true, unique: true },
    otp: { type: Number, required: true },
    expiry: { type: Date,required:true }, 

})

const otpModel=new mongoose.model("otp_details",otpSchema)

module.exports=otpModel