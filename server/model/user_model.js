
const mongoose=require("mongoose")
const bcyrpt= require('bcrypt')





const usersSchema = new mongoose.Schema({
    firstname:{type:String,required:true},
    lastname:{type:String,required:true},
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String,required:true }, 
    password: { type: String, required: true },
    address: {
        type: [{
          saveas:{type:String},
          fullname:{type:String},
          adname:{type:String},
          street: { type: String},
          pincode:{type:Number},
          city: { type: String },
          state:{type:String},
          country:{type:String},
          phonenumber:{type:Number}
        }]},
     
    isAdmin:{
        type:Boolean,
        default:false,
        required:true,
    },
    status:{
        type:Boolean,
        default:false,
        required:true
    },
    usedCoupons:
     [{ type: String }],


})

const usersModel=new mongoose.model("userdetails",usersSchema)

module.exports=usersModel