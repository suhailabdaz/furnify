const bcrypt=require("bcrypt")
const usersModel=require("../model/user_model")
const categoryModel=require("../model/category_model")
const orderModel=require('../model/order_model')
const ExcelJS = require('exceljs');





const login = async (req,res) => {
    try {
        res.render('admin/admin_login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const adminloginpost=async(req,res)=> {
    try{
        const email=req.body.email
        const user=await usersModel.findOne({email:email})
        const passwordmatch=await bcrypt.compare(req.body.password,user.password)
        console.log(user);
        if(passwordmatch && user.isAdmin){
            console.log("getin");
            req.session.admin = true;
            res.redirect('/admin/adminpanel');
        }
        else{
            console.log("get");
            res.render("admin/admin_login",{passworderror:"Invalid-password"} )
        }
    }
    catch{
      
        console.log("gettt");
        res.render("admin/admin_login",{emailerror:"Invalid-email"})

    }
}

const adminpanel=async(req,res)=>{
    try{
        res.render("admin/admin_panel")
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}


const chartData=async(req,res)=>{
    try {
        const selected=req.body.selected
        console.log(selected);
        if(selected=='month'){
            const orderByMonth= await orderModel.aggregate([
                {
                    $group:{
                        _id:{
                            month:{$month:'$createdAt'},
                        },
                        count:{$sum:1},
                    }
                }
            ])
            const salesByMonth= await orderModel.aggregate([
                {
                    $group:{
                        _id:{
                            month:{$month:'$createdAt'},
                        },
                        totalAmount: { $sum: '$totalPrice' },
                        
                    }
                }
            ])
            console.log('order2',orderByMonth);
            console.log('sales2',salesByMonth);
            const responseData = {
                order: orderByMonth,
                sales: salesByMonth
              };
              
              
              res.status(200).json(responseData);
        }
        else if(selected=='year'){
            const orderByYear= await orderModel.aggregate([
                {
                    $group:{
                        _id:{
                            year:{$year:'$createdAt'},
                        },
                        count:{$sum:1},
                    }
                }
            ])
            const salesByYear= await orderModel.aggregate([
                {
                    $group:{
                        _id:{
                            year:{$year:'$createdAt'},
                        },
                        totalAmount: { $sum: '$totalPrice' },
                    }
                }
            ])
            console.log('order1',orderByYear);
            console.log('sales1',salesByYear);
            const responseData={
                order:orderByYear,
                sales:salesByYear,
            }
            res.status(200).json(responseData);
        }
        
      }
    catch(err){
      console.log(err);
      res.send("Error Occured")
    }

}

const userslist=async(req,res)=>{
    try{
        const user=await usersModel.find({})
        console.log(user);
        res.render("admin/users_list",{users:user})
        
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const userupdate=async(req,res)=>{
    try{
       
        
        const email = req.params.email; 
const user = await usersModel.findOne({ email: email }); 

if (!user) {
    return res.status(404).json({ message: 'User not found' });
}


const currentStatus = user.status;


user.status = !user.status;
await user.save();


if (currentStatus === false && user.status === true){

    if (req.session.isAuth && req.session.userId === user._id.toString()) {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).send("Internal Server Error");
            }
            console.log('User session destroyed');
            return res.redirect('/admin/userslist');
        });
    } else {

        return res.redirect('/admin/userslist');
    }
} else {

    return res.redirect('/admin/userslist');
}

    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const searchUser=async(req,res)=>{
    try{
        const searchName= req.body.search
        const data = await usersModel.find({
            username: { $regex: new RegExp(`^${searchName}`, 'i') }
          });
          
        req.session.searchUser=data
        res.redirect('/admin/searchview')
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const searchview=async(req,res)=>{
    try {
        const user = req.session.searchUser
        res.render('admin/users_list',{users:user})
      }
    catch(err){
      console.log(err);
      res.send("Error Occured")
    }

}

const filter=async(req,res)=>{
    try {
        const option = req.params.option
        if(option==='A-Z'){
            user=await usersModel.find().sort({username:1})
        }
        else if(option==='Z-A'){
            user=await usersModel.find().sort({username:-1})
        }
        else if(option==='Blocked'){
            user=await usersModel.find({status:true})
        }
        else{
            user=await usersModel.find()
        }
        res.render('admin/users_list',{users:user})
      }
    catch(err){
      console.log(err);
      res.send("Error Occured")
    }

}

const category=async(req,res)=>{
    try{
        const category=await categoryModel.find({})
        res.render("admin/categories",{cat:category})
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}
const newcat=async(req,res)=>{
    try{
        
        res.render("admin/addcategories")
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const addcategory=async(req,res)=>{
    try {
        const catName = req.body.categoryName;
        const catDes = req.body.description;
    
        const categoryExists = await categoryModel.findOne({ name: catName });
    
        if (categoryExists) {
            console.log("Category exists");
            res.redirect('/admin/category');
        } else {
            await categoryModel.create({ name: catName, description: catDes });
            console.log("Category created");
            res.redirect('/admin/category');
        }
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const unlistcat=async(req,res)=>{
        try {
            const id = req.params.id;
            const category= await categoryModel.findOne({ _id: id });

    
            category.status = !category.status;
            await category.save();

            res.redirect('/admin/category')
        }
        catch (err) {
            console.log(err);
            res.send("Error Occured")
        }
    }


const updatecat=async(req,res)=>{
    try{
        const id=req.params.id
        const cat=await categoryModel.findOne({_id:id})
        res.render('admin/updatecat',{itemcat:cat})
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}
const updatecategory=async(req,res)=>{
    try{
        const id=req.params.id
        const catName=req.body.categoryName
        const catdes=req.body.description
        await categoryModel.updateOne({_id:id},{$set:{name:catName,description:catdes}})
        res.redirect('/admin/category')
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }

}

const downloadsales=async(req,res)=>{
    try {
       const {startDate,endDate}= req.body

       const salesData = await orderModel.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(startDate),
                    $lt: new Date(endDate),
                },
            },
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalAmount: { $sum: '$totalPrice' },
            },
        },
    ]);

    let workbook;
        try {
            workbook = await ExcelJS.readFile('SalesReport.xlsx');
        } catch (error) {
            workbook = new ExcelJS.Workbook();
        }

        const worksheet = workbook.getWorksheet('Sales Report') || workbook.addWorksheet('Sales Report');

        worksheet.addRow(['Start Date', 'End Date', 'Total Orders', 'Total Amount']);
        worksheet.addRow([new Date(startDate), new Date(endDate), '', '']);

        salesData.forEach(entry => {
            worksheet.addRow(['', '', entry.totalOrders, entry.totalAmount]);
        });

       
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=SalesReport.xlsx');

      
        await workbook.xlsx.write(res);

        console.log('Sales report updated successfully.');
    
    }
    catch(err){
      console.log(err);
      res.send("Error Occured")
    }

}


module.exports={login,adminloginpost,adminpanel,userslist,userupdate,searchUser,searchview,filter,category,
newcat,addcategory,updatecat,updatecategory,unlistcat,chartData,downloadsales}