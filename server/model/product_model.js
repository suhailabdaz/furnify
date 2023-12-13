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
  type:
  {
      type:String
  },
  mrp:{
     type:Number,
     required:true
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
    },
    
        height: {
          type: Number,
          default: 0,
        },
        width:{
            type:Number,
            default:0
        },
        sidelength:{
            type:Number,
            default:0

        },
        weight: {
          type: Number,
          default: 0,
        },
        madeOf: {
          type: String,
          default: '',
        },
        color: {
          type: String,
          default: '',
        },
        manufacturer: {
          type: String,
          default: '',
        },
        userRatings: [
          {
              userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userdetails', required: true },
              rating: { type: Number },
              review: { type: String },
          },
      ]
        
      
    
})


const productModel=new mongoose.model("products",proschema)

module.exports=productModel