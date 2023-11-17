const mongoose=require('mongoose')
const Schema = mongoose.Schema;
const { category } = require('../controller/admin_controller')

mongoose.connect("mongodb://127.0.0.1:27017/furnify")

const proschema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'categories', 
      required: true,
  },
    price:{
        type:Number,
        required:true
    },
    images: {
    type:Array,
    required:true,
    },
    stock: {
  
          type: Number,
          required: true,
      
      },
      status:{
        type:Boolean,
        default:true,
      },
    description:{
        type:String,
        required:true
    }
})


const productModel=new mongoose.model("products",proschema)

module.exports=productModel