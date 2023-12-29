const fs = require("fs");
const path = require("path");
const productModel = require("../model/product_model");
const categoryModel = require("../model/category_model");
const flash = require("express-flash");

const { alphanumValid,
    onlyNumbers}=require('../../utils/validators/admin_validators')

const products = async (req, res) => {
  try {
    const product = await productModel.find({}).populate({
      path: "category",
      select: "name",
    });
    res.render("admin/product", { product: product });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

 
const newproduct = async (req, res) => {
  try {
    const categories = await categoryModel.find();

    res.render("admin/newproduct", { category: categories,productInfo:req.session.productInfo,expressFlash:{
      productNameError:req.flash("productNameError"),
      parentCategoryError:req.flash("parentCategoryError"),
      productTypeError:req.flash("productTypeError"),
      stockError:req.flash("stockError"),
      priceError:req.flash("priceError"),
      discountError:req.flash("discountError"),
      descriptionError:req.flash("descriptionError"),
      mrpError:req.flash("mrpError"),
      heightError:req.flash("heightError"),
      widthError:req.flash("widthError"),
      sidelengthError:req.flash("sideLengthError"),
      weightError:req.flash("weightError"),
      madeOfError:req.flash("madeofError"),
      colorError:req.flash("colorError"),
      manufacturerError:req.flash("manufacturerError")

    }});
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const addproduct = async (req, res) => {
  try {
    const {
      productName,
      parentCategory,
      images,
      productType,
      stock,
      price,
      discount,
      description,
      mrp,
      height,
      width,
      sidelength,
      weight,
      madeOf,
      color,
      manufacturer,
    } = req.body;

    const productNameValid= alphanumValid(productName)
    const productTypeValid= alphanumValid(productType)
    const stockValid= onlyNumbers(stock) 
    const priceValid = onlyNumbers(price)
    const descriptionValid = alphanumValid(description)
    const mrpValid = onlyNumbers(mrp)
    const parentCategoryValid = alphanumValid(parentCategory)
    const discountValid = onlyNumbers(discount)
    const heightValid =  onlyNumbers(height)
    const weightValid = onlyNumbers(weight)
    const widthValid = onlyNumbers(width)
    const sidelengthValid = onlyNumbers(sidelength)
    const madeofValid = alphanumValid(madeOf)
    const colorValid = alphanumValid(color)
    const manufacturerValid = alphanumValid(manufacturer)

    req.session.productInfo=req.body

    if(!productNameValid){
        req.flash("productNameError","Enter Valid Data")
        return res.redirect('/admin/newproduct')
    }
    else if(!productTypeValid){
      req.flash("productTypeError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }
    else if(!stockValid){
      req.flash("stockError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }
    else if(!priceValid){
      req.flash("priceError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }
    else if(!descriptionValid){
      req.flash("descriptionError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }
    else if(!mrpValid){
      req.flash("mrpError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }
    else if(!parentCategoryValid){
      req.flash("parentCategoryError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }
    else if(!discountValid){
      req.flash("discountError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }
    else if(!heightValid){
      req.flash("heightError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }
    else if(!weightValid){
      req.flash("weightError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }
    else if(!widthValid){
      req.flash("widthError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }
    else if(!sidelengthValid){
      req.flash("sidelengthError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }
    else if(!madeofValid){
      req.flash("madeofError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }
    else if(!colorValid){
      req.flash("colorError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }
    else if(!manufacturerValid){
      req.flash("manufacturerError","Enter Valid Data")
      return res.redirect("/admin/newproduct")
    }


    req.session.productInfo=null
    

    
    

    




    const newproduct = new productModel({
      name: productName,
      category: parentCategory,
      type: productType,
      price: price,
      images: req.files.map((file) => file.path),
      stock: stock,
      description: description,
      mrp: mrp,
      discount:discount,
      height: height,
      weight: weight,
      width: width,
      sidelength: sidelength,
      madeOf: madeOf,
      manufacturer: manufacturer,
      color: color,
    });

    console.log(parentCategory);
    await categoryModel.updateOne(
      { _id: parentCategory },
      { $addToSet: { types: productType } },
      { upsert: true }
    );

    await newproduct.save();
    res.redirect("/admin/product");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};
const unlist = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findOne({ _id: id });
    // console.log(category);

    product.status = !product.status;
    await product.save();
    // console.log(category);
    res.redirect("/admin/product");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};
const deletepro = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.deleteOne({ _id: id });
    res.redirect("/admin/product");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};
const updatepro = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findOne({ _id: id });
    console.log(product);
    res.render("admin/updateproduct", { product: product });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};
const editimg = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findOne({ _id: id });
    console.log(product);
    res.render("admin/editimg", { product: product });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};
const updateimg = async (req, res) => {
  try {
    const id = req.params.id;
    const newimg = req.files.map((file) => file.path);
    const product = await productModel.findOne({ _id: id });
    product.images.push(...newimg);
    product.save();
    res.redirect("/admin/product");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};
const deleteimg = async (req, res) => {
  try {
    const pid = req.query.pid;
    const filename = req.query.filename;
    const imagePath = path.join("uploads", filename);

    if (fs.existsSync(filename)) {
      try {
        fs.unlinkSync(filename);
        console.log("Image deleted");
        res.redirect("/admin/product");

        await productModel.updateOne(
          { _id: pid },
          { $pull: { images: filename } }
        );
      } catch (err) {
        console.log(err);
        return res.render("users/serverError");
      }
    } else {
      console.log("Image not found");
    }
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const resizeImage = async (req, res) => {
  try {
    const pid = req.query.pid;
    const filename = req.query.filename;
    const imagePath = path.join(filename);
    res.render("admin/resizeImg", { imagePath });
    console.log(imagePath);
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};
const updateproduct = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      productName,
      stock,
      productprice,
      description,
      mrp,
      height,
      weight,
      width,
      sidelength,
      color,
      madeOf,
      manufacturer,
    } = req.body;
    const product = await productModel.findOne({ _id: id });
    product.name = productName;
    product.price = productprice;
    product.stock = stock;
    product.description = description;
    product.mrp = mrp;
    product.height = height;
    product.width = width;
    product.weight = weight;
    product.sidelength = sidelength;
    product.color = color;
    product.madeOf = madeOf;
    product.manufacturer = manufacturer;

    await product.save();
    res.redirect("/admin/product");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

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
  updateproduct,
};
