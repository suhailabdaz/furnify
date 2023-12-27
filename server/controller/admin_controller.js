const bcrypt=require("bcrypt")
const usersModel=require("../model/user_model")
const categoryModel=require("../model/category_model")
const orderModel=require('../model/order_model')

const fs=require('fs')
const os=require('os')
const path=require('path')
const puppeteer=require('puppeteer')





const login = async (req,res) => {
    try {
        res.render('admin/admin_login');
    }  catch (err) {
        console.log(err);
        res.render("users/serverError")
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
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}

const adminpanel=async(req,res)=>{
    try{
        res.render("admin/admin_panel")
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
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
      catch (err) {
        console.log(err);
        res.render("users/serverError")
    }

}

const userslist=async(req,res)=>{
    try{
        const user=await usersModel.find({})
        console.log(user);
        res.render("admin/users_list",{users:user})
        
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
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
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}

const searchUser=async(req,res)=>{
    try{
        const searchName= req.body.search
        const data = await usersModel.find({
            firstname: { $regex: new RegExp(`^${searchName}`, 'i') }
          });
          
        req.session.searchUser=data
        res.redirect('/admin/searchview')
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}

const searchview=async(req,res)=>{
    try {
        const user = req.session.searchUser
        res.render('admin/users_list',{users:user})
      }
      catch (err) {
        console.log(err);
        res.render("users/serverError")
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
      catch (err) {
        console.log(err);
        res.render("users/serverError")
    }

}

const category=async(req,res)=>{
    try{
        const category=await categoryModel.find({})
        res.render("admin/categories",{cat:category})
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
}
const newcat=async(req,res)=>{
    try{
        
        res.render("admin/addcategories")
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
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
    catch (err) {
        console.log(err);
        res.render("users/serverError")
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
            res.render("users/serverError")
        }
    }


const updatecat=async(req,res)=>{
    try{
        const id=req.params.id
        const cat=await categoryModel.findOne({_id:id})
        res.render('admin/updatecat',{itemcat:cat})
    }
    catch (err) {
        console.log(err);
        res.render("users/serverError")
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
    catch (err) {
        console.log(err);
        res.render("users/serverError")
    }

}

const downloadsales = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

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

        const products = await orderModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                },
            },
            {
                $unwind: '$items',
            },
            {
                $group: {
                    _id: '$items.productId',
                    totalSold: { $sum: '$items.quantity' },
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails',
                },
            },
            {
                $unwind: '$productDetails',
            },
            {
                $project: {
                    _id: 1,
                    totalSold: 1,
                    productName: '$productDetails.name',
                },
            },
            {
                $sort: { totalSold: -1 },
            },
        ]);


    
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Sales Report</title>
                <style>
                    body {
                        margin-left: 20px;
                    }
                </style>
            </head>
            <body>
                <h2 align="center"> Sales Report</h2>
                Start Date:${startDate}<br>
                End Date:${endDate}<br> 
                <center>
                    <table style="border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #000; padding: 8px;">Sl N0</th>
                                <th style="border: 1px solid #000; padding: 8px;">Product Name</th>
                                <th style="border: 1px solid #000; padding: 8px;">Quantity Sold</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map((item, index) => `
                                <tr>
                                    <td style="border: 1px solid #000; padding: 8px;">${index + 1}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item.productName}</td>
                                    <td style="border: 1px solid #000; padding: 8px;">${item.totalSold}</td>
                                </tr>`).join('')}
                                <tr>
                                <td style="border: 1px solid #000; padding: 8px;"></td>
                                <td style="border: 1px solid #000; padding: 8px;">Total No of Orders</td>
                                <td style="border: 1px solid #000; padding: 8px;">${salesData[0].totalOrders}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #000; padding: 8px;"></td>
                                <td style="border: 1px solid #000; padding: 8px;">Total Revenue</td>
                                <td style="border: 1px solid #000; padding: 8px;">${salesData[0].totalAmount}</td>
                            </tr>
                        </tbody>
                    </table>
                </center>
            </body>
            </html>
        `;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);

        // Generate PDF
        const pdfBuffer = await page.pdf();

        await browser.close();

        const downloadsPath = path.join(os.homedir(), 'Downloads');
        const pdfFilePath = path.join(downloadsPath, 'sales.pdf');

        // Save the PDF file locally
        fs.writeFileSync(pdfFilePath, pdfBuffer);

        // Send the PDF as a response
        res.setHeader('Content-Length', pdfBuffer.length);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales.pdf');
        res.status(200).end(pdfBuffer);
    
    }  catch (err) {
        console.log(err);
        res.render("users/serverError")
    }
};


module.exports={login,adminloginpost,adminpanel,userslist,userupdate,searchUser,searchview,filter,category,
newcat,addcategory,updatecat,updatecategory,unlistcat,chartData,downloadsales}