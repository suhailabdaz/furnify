const fs=require('fs')
const path=require('path')
const productModel = require('../model/product_model')
const categoryModel = require('../model/category_model')



const products = async (req, res) => {
    try {
        const product = await productModel.find({}).populate({
            path: 'category',
            select: 'name'
        });
        res.render("admin/product", { product: product })
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}

const newproduct = async (req, res) => {
    try {
        const categories = await categoryModel.find();

        console.log("Categories:", categories);

        res.render('admin/newproduct', { category: categories });
    }  catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}


const addproduct = async (req, res) => {
    try {
        const { productName, parentCategory, images,productType, stock,price, description , mrp,height,width,sidelength,weight,madeOf,color,manufacturer} = req.body



        const newproduct = new productModel({
            name: productName,
            category: parentCategory,
            type:productType,
            price: price,
            images: req.files.map(file => file.path),
            stock: stock,
            description: description,
            mrp:mrp,
            height:height,
            weight:weight,
            width:width,
            sidelength:sidelength,
            madeOf:madeOf,
            manufacturer:manufacturer,
            color:color

        })

        console.log(parentCategory)
        await categoryModel.updateOne({_id:parentCategory} ,{ $addToSet: { types: productType } },{ upsert: true })

        await newproduct.save()
        res.redirect('/admin/product')
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}
const unlist = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productModel.findOne({ _id: id });
        // console.log(category);

        product.status = !product.status;
        await product.save();
        // console.log(category);
        res.redirect('/admin/product')
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}
const deletepro = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productModel.deleteOne({ _id: id })
        res.redirect('/admin/product')
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}
const updatepro = async (req, res) => {
    try {
        const id = req.params.id
        const product = await productModel.findOne({ _id: id });
        console.log(product);
        res.render('admin/updateproduct', { product: product })
    } catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}
const editimg = async (req, res) => {
    try {
        const id = req.params.id
        const product = await productModel.findOne({ _id: id });
        console.log(product);
        res.render('admin/editimg', { product: product })
    } catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}
const updateimg=async(req,res)=>{
    try{
     const id=req.params.id
     const newimg=req.files.map(file => file.path)
     const product=await productModel.findOne({_id:id})
     product.images.push(...newimg)
     product.save()
     res.redirect('/admin/product')
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}
const deleteimg=async(req,res)=>{
    try{
        const pid=req.query.pid
        const filename=req.query.filename
        const imagePath=path.join('uploads',filename)

        if(fs.existsSync(filename))
        {

        
        try{
            fs.unlinkSync(filename)
            console.log("Image deleted");
            res.redirect('/admin/product')

            await productModel.updateOne(
                { _id: pid },
                { $pull: { images: filename } } 
              );
        
    
        }
        catch (err) {
            console.log(err);
            res.render("users/serverError")
        }

    }
    else{
        console.log("Image not found");
    }
}
catch (err) {
    console.log(err);
    res.render("users/serverError")
}
}


const resizeImage=async(req,res)=>{
    try{

        const pid=req.query.pid
        const filename=req.query.filename
        const imagePath=path.join(filename)
        res.render('admin/resizeImg',{imagePath})
        console.log(imagePath)

    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}
const updateproduct = async (req, res) => {
    try {
        const id = req.params.id
        const { productName,stock,productprice,description,mrp,height,weight,width,sidelength,color,madeOf,manufacturer } = req.body
        const product=await productModel.findOne({_id:id})
        product.name = productName;
        product.price = productprice;
        product.stock = stock;
        product.description = description;
        product.mrp=mrp;
        product.height=height;
        product.width=width;
        product.weight=weight;
        product.sidelength=sidelength;
        product.color=color;
        product.madeOf=madeOf;
        product.manufacturer=manufacturer;


        await product.save()
        res.redirect('/admin/product')
    }  catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}


module.exports = {
    products,
    newproduct,
    addproduct,
    unlist,
    deletepro,
    updatepro,
    deleteimg,
    resizeImage,
    editimg,
    updateimg,
    updateproduct

}