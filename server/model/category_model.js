const mongoose=require('mongoose')


const catschema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    types:{
        type: Array,
        default: ['All'],
    },
    status:{
        type:Boolean,
        required:true,
        default:true
    
    }
    
})


const categoryModel=new mongoose.model("categories",catschema)

module.exports=categoryModel