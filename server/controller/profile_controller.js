const categoryModel=require('../model/category_model')
const userModel=require('../model/user_model')
const orderModel=require('../model/order_model')
const productModel=require('../model/product_model')
const cartModel=require('../model/cart_model')
const bcrypt=require("bcrypt")

const {nameValid,
    lnameValid,
    emailValid,
    passwordValid,
    confirmpasswordValid,
    phoneValid}=require("../../utils/validators/signup_Validators")

const {bnameValid,
        adphoneValid,
        pincodeValid,
        }=require("../../utils/validators/address_Validators")
const { default: mongoose } = require('mongoose')





const userdetails = async (req, res) => {
    try {
        const userId=req.session.userId
        console.log("id",userId);
        const data=await userModel.findOne({_id:userId})
        const categories = await categoryModel.find();
        res.render("users/userdetails",{categories,userData:data})
    }
    catch (err) {
        console.log(err);
        res.send("Error Occured")
    }
}

const profileEdit=async(req,res)=>{
    try{
        const userId=req.session.userId
        console.log("id",userId);
        const categories = await categoryModel.find();
        const data=await userModel.findOne({_id:userId})
        console.log("data",data);
        res.render('users/editprofile',{userData:data,categories})
    }
    catch(err){
        res.status(500).send('error occured')
        console.log(err);
    }
}

const profileUpdate=async(req,res)=>{
    try{
        const {email,firstName,lastName,mob}=req.body
        const userId=req.session.userId
        console.log("id",userId);
        console.log("values",firstName,lastName,mob
        )
        const data = await userModel.updateOne(
            { _id: userId },
            {
                $set: {
                    firstname: firstName,
                    lastname: lastName,
                    mobileNumber: mob
                }
            }
        );
        console.log("data",data);
        res.redirect('/userdetails')
    }
    catch(err){
        res.status(500).send('error occured')
        console.log(err);
    }
}

const newAddress=async(req,res)=>{
    try{
        const categories = await categoryModel.find();
        res.render('users/newAddress',{categories})
    }
    catch(err){
        res.status(500).send('error occured')
        console.log(err);
    }
}

const addressUpdate = async (req, res) => {
    try {
        const { saveas,fullname,adname,street,pincode,city,state,country,phone } = req.body;
        const userId = req.session.userId;
        const categories = await categoryModel.find();
        console.log("id", userId);

        const existingUser = await userModel.findOne({ _id: userId });
        const fullnamevalid=bnameValid(fullname)
        const saveasvalid=bnameValid(saveas)
        const adnameValid=bnameValid(adname)
        const streetValid=bnameValid(street)
        const pincodevalid=pincodeValid(pincode)
        const cityValid=bnameValid(city)
        const stateValid=bnameValid(state)
        const countryValid=bnameValid(country)
        const phoneValid=adphoneValid(phone)
        if(!fullnamevalid)
{
    res.render("users/newAddress",{nameerror:"Enter valid name",categories})
}
if(!saveasvalid)
{
    res.render("users/newAddress",{saveaserror:"Enter valid Type",categories})
}
if(!adnameValid)
{
    res.render("users/newAddress",{adnameerror:"Enter valid housename",categories})
}
if(!streetValid)
{
    res.render("users/newAddress",{streeterror:"Enter valid street",categories})
}
if(!pincodevalid)
{
    res.render("users/newAddress",{pincodeerror:"Enter valid housename",categories})
}
if(!cityValid)
{
    res.render("users/newAddress",{cityerror:"Enter valid housename",categories})
}
        if (existingUser) {
    
            const existingAddress = await userModel.findOne({
                '_id': userId,
                'address': {
                    $elemMatch: {
                        'fullname': fullname,
                        'adname': adname,
                        'street': street,
                        'pincode': pincode,
                        'city': city,
                        'state': state,
                        'country': country,
                        'phonenumber': phone
                    }
                }
            });
            
            if (existingAddress) {
                // req.flash('address', 'This Address already existed');
                return res.redirect('/addAddress');
            }

            existingUser.address.push({
                saveas:saveas,
                fullname: fullname,
                adname:adname,
                street: street,
                pincode: pincode,
                city: city,
                state:state,
                country:country,
                phonenumber:phone
               
            });

            await existingUser.save();

            // req.flash('address', 'Address added successfully');
            

           
        }
        
        res.redirect('/userdetails');
    } catch (err) {
        res.status(500).send('Error occurred');
        console.log(err);
    }
};

const changepassword=async(req,res)=>{
    console.log("mele");
    try{
        console.log("vannu");
        const password = req.body.newPassword
        const cpassword = req.body.confirmPassword

        const ispasswordValid = passwordValid(password)
        const iscpasswordValid = confirmpasswordValid(cpassword, password)

        if (!ispasswordValid) {
            res.render('users/userdetails', { perror: "Password should contain one uppercase,one lowercase,one number,one special charecter" })
        }
        else if (!iscpasswordValid) {
            res.render('users/userdetails', { cperror: "Password and Confirm password should be match" })
        }
        else{
            const hashedpassword = await bcrypt.hash(password, 10)
            const userId = req.session.userId;
            console.log("ippo",userId);
            await userModel.updateOne({_id:userId},{password:hashedpassword})
            res.redirect('/userdetails')

        }
        
    }
    catch(err){
        res.status(500).send('error occured')
        console.log(err);
    }
}

const editaddress=async(req,res)=>{
    try{
        
        const addressId = req.params.addressId;
        
        const userId = req.session.userId; 
        
        const user = await userModel.findById(userId);
        const addressToEdit = user.address.id(addressId);
        const categories = await categoryModel.find();
    
       
        res.render('users/editaddress',{ addressToEdit,categories });
    }
    catch(err){
        res.status(500).send('error occured')
        console.log(err);

    }
}
const updateAddress = async (req, res) => {
    try {
        const { saveas, fullname, adname, street, pincode, city, state, country, phone } = req.body;
        const addressId=req.params.addressId
        const userId = req.session.userId;
        console.log("id", userId);

        const isAddressExists = await userModel.findOne({
            '_id': userId,
            'address': {
                $elemMatch: {
                    '_id': { $ne: addressId }, 
                    'saveas': saveas,
                    'fullname': fullname,
                    'adname': adname,
                    'street': street,
                    'pincode': pincode,
                    'city': city,
                    'state': state,
                    'country': country,
                    'phonenumber': phone
                }
            }
        });

        if (isAddressExists) {
            return res.status(400).send('Address already exists');
        }


        const result = await userModel.updateOne(
            { '_id': userId, 'address._id': addressId },
            {
                $set: {
                    'address.$.saveas': saveas,
                    'address.$.fullname': fullname,
                    'address.$.adname': adname,
                    'address.$.street': street,
                    'address.$.pincode': pincode,
                    'address.$.city': city,
                    'address.$.state': state,
                    'address.$.country': country,
                    'address.$.phonenumber': phone
                }
            }
        );

        
            res.redirect('/userdetails');
    } catch (err) {
        res.status(500).send('Error occurred');
        console.log(err);
    }
};

const deleteAddress=async(req,res)=>{
    try{
        const addressId=req.params.addressId
        const userId=req.session.userId
        const result = await userModel.updateOne(
            { _id: userId, 'address._id': addressId },
            { $pull: { address: { _id: addressId } } }
        );
        console.log('userId:', userId);
        console.log('addressId:', addressId);
        console.log('Update result:', result);
        res.redirect('/userdetails');

    }
    catch(err){
        res.status(500).send('Error occurred');
        console.log(err);

    }
}

const orderHistory=async (req,res)=>{
    try{
                const userId=req.session.userId;
                console.log(userId);
                const categories=await categoryModel.find({})
                const od=await orderModel.find({userId:userId})
                const allOrderItems = [];
                od.forEach(order => {
                  allOrderItems.push(...order.items);
                });
                const orders=await orderModel.aggregate([
                    {
                        $match: {
                            userId: userId,
                        }
                    },
                    // {
                    //     $unwind: '$items'
                    // },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'items.productId',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                ])
                const updatedOrders = orders.map(order => ({
                    ...order,
                    items: order.items.map(item => ({
                      ...item,
                      productDetails: order.productDetails.find(product => product._id.toString() === item.productId.toString()),
                    })),
                  }));
                
                
            
                
                res.render('users/order_history',{od,orders:updatedOrders,categories,allOrderItems})
           
        }
        
    
    catch(err){
        console.log(err)
    }
}

const ordercancelling=async(req,res)=>{
    try{
    
       const id= req.params.id
       const userId=req.session.userId
       const update=await orderModel.updateOne({_id:id},{status:"Cancelled"})
       const result=await orderModel.findOne({_id:id})
       if(result.paymentMethod=='Razorpay'){
        const user=await userModel.findOne({_id:userId})
        const refund=result.totalPrice;
        const currentWallet = user.wallet; 
        const newWallet = currentWallet + refund;
        const amountUpdate = await userModel.updateOne({ _id: userId }, { wallet: newWallet });


       }
       console.log("result",result);
       const items=result.items.map(item=>({
        productId:item.productId,
        quantity:item.quantity,
        
    }))

    for(const item of items){
        const product =await productModel.findOne({_id:item.productId})
        product.stock+=item.quantity
        await product.save()
       
    }

       res.redirect("/orderhistory")

    }
    catch(err){
        res.status(500).send('error occured')
        console.log(err);
    }
}

const orderreturning=async(req,res)=>{
    try{
        const userId=req.session.userId

        const id= req.params.id
        const update=await orderModel.updateOne({_id:id},{status:"Returned"})
        const order=await orderModel.findOne({_id:id})
        const user=await userModel.findOne({_id:userId})
        
        console.log("paranja order",order)
        const refund=order.totalPrice;
        console.log("refundAmount",refund)

        const currentWallet = user.wallet; 
        const newWallet = currentWallet + refund;
        const amountUpdate = await userModel.updateOne({ _id: userId }, { wallet: newWallet });

        const result=await orderModel.findOne({_id:id})
        
        const items=result.items.map(item=>({
         productId:item.productId,
         quantity:item.quantity,
         
     }))
     for(const item of items){
        const product =await productModel.findOne({_id:item.productId})
        product.stock+=item.quantity
        await product.save()
       
    }

       res.redirect("/orderhistory")

    }
    catch(err){
        console.log(err)
    }
}


const singleOrderPage=async (req,res)=>{
    try{
        const id= req.params.id
        const order=await orderModel.findOne({_id:id})
        const categories=await categoryModel.find({})
        res.render('users/orderDetails',{categories,order})

    }
    catch(err){
        console.log(err)
    }
}










module.exports={userdetails,profileEdit,profileUpdate,newAddress,addressUpdate,changepassword
,editaddress,updateAddress,deleteAddress,orderHistory,ordercancelling,
singleOrderPage,orderreturning}