const categoryModel=require('../model/category_model')
const userModel=require('../model/user_model')
const orderModel=require('../model/order_model')
const productModel=require('../model/product_model')
const couponModel=require("../model/coupon_model")
const walletModel=require('../model/wallet_model')
const cartModel=require('../model/cart_model')
const Razorpay=require("razorpay")
const bcrypt=require("bcrypt")
const puppeteer=require('puppeteer')
const key_id=process.env.key_id;
const key_secret=process.env.key_secret;

const instance=new Razorpay({key_id:key_id,key_secret:key_secret})


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
        res.render('users/newAddress',{categories,expressFlash:{
            fullnameerror:req.flash('fullnameerror'),
            saveaserror:req.flash("saveaserror"),
            adnameerror:req.flash("adnameerror"),
            streeterror:req.flash("streeterror"),
            pincodeerror:req.flash("pincodeerror"),
            cityerror:req.flash("cityerror"),
            stateerror:req.flash("stateerror"),
            countryerror:req.flash("countryerror"),
            phoneerror:req.flash("phoneerror")
        }})
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
req.flash("fullnameerror","Enter a valid name")
 return res.redirect('/addAddress')
}
if(!saveasvalid)
{
req.flash("saveaserror","Enter a valid addresstype")
return res.redirect('/addAddress')
}
if(!adnameValid)
{
req.flash("adnameerror","Enter a valid address")
return res.redirect('/addAddress')
}
if(!streetValid)
{
req.flash("streeterror","enter a valid street")
return res.redirect('/addAddress')

}
if(!pincodevalid)
{
req.flash("pincodeerror","Enter a valid Pincode")
return res.redirect('/addAddress')
}

if(!cityValid)
{
req.flash("cityerror","Enter Valid City")
return res.redirect('/addAddress')

}
if(!stateValid){
    req.flash("stateerror","Enter valid state")
    return res.redirect('/addAddress')
}
if(!countryValid){
    req.flash("countryerror",'Enter valid country')
    return res.redirect('/addAddress')
}
if(!phoneValid){
    req.flash("phoneerror","Enter valid country ")
    return res.redirect('/addAddress')

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
    
       
        res.render('users/editaddress',{categories,addressToEdit,expressFlash:{
            fullnameerror:req.flash('fullnameerror'),
            saveaserror:req.flash("saveaserror"),
            adnameerror:req.flash("adnameerror"),
            streeterror:req.flash("streeterror"),
            pincodeerror:req.flash("pincodeerror"),
            cityerror:req.flash("cityerror"),
            stateerror:req.flash("stateerror"),
            countryerror:req.flash("countryerror"),
            phoneerror:req.flash("phoneerror")
        }})    }
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
req.flash("fullnameerror","Enter a valid name")
return res.redirect(`/editaddress/${addressId}`)}
if(!saveasvalid)
{
req.flash("saveaserror","Enter a valid addresstype")
return res.redirect(`/editaddress/${addressId}`)}
if(!adnameValid)
{
req.flash("adnameerror","Enter a valid address")
return res.redirect(`/editaddress/${addressId}`)}
if(!streetValid)
{
req.flash("streeterror","enter a valid street")
return res.redirect(`/editaddress/${addressId}`)
}
if(!pincodevalid)
{
req.flash("pincodeerror","Enter a valid Pincode")
return res.redirect(`/editaddress/${addressId}`)}

if(!cityValid)
{
req.flash("cityerror","Enter Valid City")
return res.redirect(`/editaddress/${addressId}`)
}
if(!stateValid){
    req.flash("stateerror","Enter valid state")
    return res.redirect(`/editaddress/${addressId}`)}
if(!countryValid){
    req.flash("countryerror",'Enter valid country')
    return res.redirect(`/editaddress/${addressId}`)}
if(!phoneValid){
    req.flash("phoneerror","Enter valid country ")
    return res.redirect(`/editaddress/${addressId}`)
}

        if (isAddressExists) {
            req.flash("addrssexists","Address Already Exist")
            return res.redirect(`/editaddress/${addressId}`)
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
                const orders = await orderModel.aggregate([
                    {
    $match: {
      userId: userId,
    },
  },
  {
    $sort: {
      createdAt: -1, // Sort in ascending order (use -1 for descending order)
    },
  },
  {
    $lookup: {
      from: 'products',
      localField: 'items.productId',
      foreignField: '_id',
      as: 'productDetails',
    },
  },
]);
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
        if(result.paymentMethod=='Razorpay'|| result.paymentMethod=='Wallet'){
        const user=await walletModel.findOne({userId:userId})
       
        const refund=result.totalPrice;
       
        const currentWallet = user.wallet; 
        console.log(currentWallet);
        
        const newWallet = currentWallet + refund;
        console.log(newWallet);
        const amountUpdate = await walletModel.updateOne(
            { userId: userId },
            {
              $set: { wallet: newWallet },
              $push: {
                walletTransactions: {
                  date: new Date(),
                  type: 'Credited', // or 'debit' depending on your use case
                  amount: refund, // Replace with the actual amount you want to add
                },
              },
            }
          );        
        


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
        const user=await walletModel.findOne({userId:userId})
        
        console.log("paranja order",order)
        const refund=order.totalPrice;
        console.log("refundAmount",refund)

        const currentWallet = user.wallet; 
        const newWallet = currentWallet + refund;
        const amountUpdate = await walletModel.updateOne(
            { userId: userId },
            {
              $set: { wallet: newWallet },
              $push: {
                walletTransactions: {
                  date: new Date(),
                  type: 'Credited', 
                  amount: refund, 
                },
              },
            }
          );   

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

const itemcancelling=async(req,res)=>{
    try{
        const userId=req.session.userId
    const id=req.params.id
    const orderId=req.params.orderId

    const order = await orderModel.findOne({ _id:orderId });

    const itemIndex = order.items.findIndex(item => item.productId == id);

    if (itemIndex === -1) {
        return res.status(404).send("Item not found in the order");
    }


    if (!order) {
        return res.status(404).send("Order not found");
    }

    if(order.paymentMethod=='Razorpay' || order.paymentMethod=='Wallet'){
        const user=await walletModel.findOne({userId:userId})
       
        const refund=order.items[itemIndex].price;
       
        const currentWallet = user.wallet; 
        console.log(currentWallet);
        
        const newWallet = currentWallet + refund;
        console.log(newWallet);
        const amountUpdate = await walletModel.updateOne(
            { userId: userId },
            {
              $set: { wallet: newWallet },
              $push: {
                walletTransactions: {
                  date: new Date(),
                  type: 'Credited', // or 'debit' depending on your use case
                  amount: refund, // Replace with the actual amount you want to add
                },
              },
            }
          );        
        


       }


    const nonCancelledItems = order.items.filter(item => item.status !== 'cancelled');


    if (nonCancelledItems.length < 2) {

        order.status='Cancelled'

        await orderModel.updateOne(
            { _id: orderId ,'items.productId': order.items[itemIndex].productId},
            {
              $set: {
                'items.$.status': 'cancelled', // Update the status of the specific item in the array
                updatedAt: new Date(),
              },
            }
          );
    

         await order.save()
       return res.redirect(`/singleOrder/${orderId}`)
       
           }

  
 
    const result = await orderModel.updateOne(
        { _id: orderId ,'items.productId': order.items[itemIndex].productId},
        {
          $set: {
            'items.$.status': 'cancelled', // Update the status of the specific item in the array
            totalPrice: order.totalPrice - order.items[itemIndex].price,
            updatedAt: new Date(),
          },
        }
      );

    res.redirect(`/singleOrder/${orderId}`)


    
    }
    catch(err){
        console.log(err);
        res.send("couldnt cancel")
    }
}

const itemreturning=async(req,res)=>{
    try{
        const userId=req.session.userId
        const id=req.params.id
        const orderId=req.params.orderId
    
        const order = await orderModel.findOne({ _id:orderId });

        const user=await walletModel.findOne({userId:userId})



        
        const itemIndex = order.items.findIndex(item => item.productId == id);
    
        if (itemIndex === -1) {
            return res.status(404).send("Item not found in the order");
        }
    
    
        if (!order) {
            return res.status(404).send("Order not found");
        }

        const refund=order.items[itemIndex].price;
        console.log("refundAmount",refund)

        const currentWallet = user.wallet; 
        const newWallet = currentWallet + refund;
        const amountUpdate = await walletModel.updateOne(
            { userId: userId },
            {
              $set: { wallet: newWallet },
              $push: {
                walletTransactions: {
                  date: new Date(),
                  type: 'Credited', 
                  amount: refund, 
                },
              },
            }
          ); 
    

        const nonReturnedItems = order.items.filter(item => item.status !== 'returned');


        if (nonReturnedItems.length < 2) {

            order.status='Returned'

            await orderModel.updateOne(
                { _id: orderId ,'items.productId': order.items[itemIndex].productId},
                {
                  $set: {
                    'items.$.status': 'returned', 
                    updatedAt: new Date(),
                  },
                }
              );

         await order.save()
       return res.redirect(`/singleOrder/${orderId}`)
          
        }
    
     
        const result = await orderModel.updateOne(
            { _id: orderId ,'items.productId': order.items[itemIndex].productId},
            {
              $set: {
                'items.$.status': 'returned', 
                totalPrice: order.totalPrice - order.items[itemIndex].price,
                updatedAt: new Date(),
              },
            }
          );
    
        res.redirect(`/singleOrder/${orderId}`)
    
    
        
        }
        catch(err){
            console.log(err);
            res.send("couldnt cancel")
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


const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId
    console.log(orderId)
    const order=await orderModel.findOne({orderId:orderId})
   


    // Replace the following line with logic to fetch order details and generate dynamic HTML
    const orderHistoryContent =` <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="author" content="Your Company">
        <title>Order Invoice</title>
        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
    </head>
    
    <body>
    
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            <h3 class="mb-0">Order Invoice</h3>
                        </div>
                        <div class="card-body">
                            <div class="row mb-4">
                                <div class="col-sm-6">
                                    <h5>Order ID: ${ order.orderId }</h5>
                                    <h5>Order Status: ${ order.status }</h5>
                                </div>
                                <div class="col-sm-6 text-sm-right">
                                    <h5>Order Date: ${order.createdAt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }</h5>
                                    <h5>Payment Method:${order.paymentMethod }</h5>
                                </div>
                            </div>
    
                            <div class="mb-4">
                                <h5>Shipping Address</h5>
                                <p>${order.shippingAddress.fullname }<br>
                                    ${ order.shippingAddress.adname }, ${ order.shippingAddress.street }<br>
                                    ${ order.shippingAddress.city }, ${ order.shippingAddress.pincode }<br>
                                    ${ order.shippingAddress.phonenumber }
                                </p>
                            </div>
    
                            <div class="mb-4">
                                <h5>Order Items</h5>
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Item Name</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    ${order.items.map(item => `
                                    <tr>
                                        <td>${item.productName}</td>
                                        <td>${item.singleprice}</td>
                                        <td>${item.quantity}</td>
                                        <td>${item.price}</td>
                                    </tr>`).join('')}
                                        <tr>
                                            <td colspan="3">Total After Discount</td>
                                            <td>${ order.totalPrice }</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    
    </body>
    
    </html>
    
    `;

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setContent(orderHistoryContent, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=order_invoice_${req.params.orderId}.pdf`);

    res.send(pdfBuffer);
    
  } catch (error) {   
    console.error('Error generating PDF:', error);
    res.status(500).send('Internal Server Error');
  }
};

const wallet = async (req, res) => {
    try {
    const userId = req.session.userId;
    const categories = await categoryModel.find({});
    let user = await walletModel.findOne({ userId: userId }).sort({ 'walletTransactions.date': -1});
    
    if (!user) {
        user = await walletModel.create({ userId: userId });
    }
    
    const userWallet = user.wallet;
    const usertransactions=user.walletTransactions
    
    res.render("users/wallet", { categories, userWallet ,usertransactions});
    } catch (err) {
    console.log(err);
      res.status(500).send("Internal Server Error");
    }
};

const couponsAndRewards=async (req,res)=>{
    try{

        const userId = req.session.userId;
        console.log(userId);
        const user = await userModel.findById(userId);
        const coupons = await couponModel.find({
          couponCode: { $nin: user.usedCoupons },
          status:true
        });
        const categories=await categoryModel.find()
        res.render('users/rewardsPage',{categories,coupons,referralCode:userId})
    }
    catch(err){
        console.log(err);
        res.send(err)
    }
}







const walletupi = async (req, res) => {
  console.log('body:', req.body);
  var options = {
      amount: 500,
      currency: "INR",
      receipt: "order_rcpt"
  };
  instance.orders.create(options, function (err, order) {
      console.log("order1 :", order);
      res.send({ orderId: order.id})
    })
}

const walletTopup= async(req,res)=>{
    try {
        const userId = req.session.userId;
        const { razorpay_payment_id, razorpay_order_id } = req.body;
    const Amount=parseFloat(req.body.Amount)
    console.log(Amount);
        const wallet = await walletModel.findOne({ userId :userId});
    
        
        wallet.wallet += Amount;
        wallet.walletTransactions.push({ type: 'Credited', amount:Amount, date: new Date() });
    
      
        await wallet.save();
        res.redirect("/wallet")
      } catch (error) {
        console.error('Error handling Razorpay callback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}









module.exports={userdetails,profileEdit,profileUpdate,newAddress,addressUpdate,changepassword
,editaddress,updateAddress,deleteAddress,orderHistory,ordercancelling,
singleOrderPage,orderreturning,downloadInvoice,wallet,walletupi,walletTopup,itemcancelling,itemreturning,
couponsAndRewards}