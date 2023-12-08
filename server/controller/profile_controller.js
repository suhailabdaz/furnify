const categoryModel=require('../model/category_model')
const userModel=require('../model/user_model')
const orderModel=require('../model/order_model')
const productModel=require('../model/product_model')
const cartModel=require('../model/cart_model')
const bcrypt=require("bcrypt")
const puppeteer=require('puppeteer')

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
res.redirect('/addAddress')
}
if(!saveasvalid)
{
req.flash("saveaserror","Enter a valid addresstype")
res.redirect('/addAddress')
}
if(!adnameValid)
{
req.flash("adnameerror","Enter a valid address")
res.redirect('/addAddress')
}
if(!streetValid)
{
req.flash("streeterror","enter a valid street")
res.redirect('/addAddress')

}
if(!pincodevalid)
{
req.flash("pincodeerror","Enter a valid Pincode")
res.redirect('/addAddress')
}

if(!cityValid)
{
req.flash("cityerror","Enter Valid City")
res.redirect('/addAddress')

}
if(!stateValid){
    req.flash("stateerror","Enter valid state")
    res.redirect('/addAddress')
}
if(!countryValid){
    req.flash("countryerror",'Enter valid country')
    res.redirect('/addAddress')
}
if(!phoneValid){
    req.flash("phoneerror","Enter valid country ")
    res.redirect('/addAddress')

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


const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId
    console.log(orderId)
    const order=await orderModel.findOne({orderId:orderId})


    // Replace the following line with logic to fetch order details and generate dynamic HTML
    const orderHistoryContent = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="author" content="Untree.co">
        <meta name="description" content="" />
        <meta name="keywords" content="bootstrap, bootstrap4" />
    
        <!-- Bootstrap CSS -->
        <link href="/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
        <link href="/css/tiny-slider.css" rel="stylesheet">
        <link href="/css/style.css" rel="stylesheet">
        <style>
    
            
          
       
    
        .order-tracking h1 {
            color: #3b5d50;
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 20px;
        }
    
        .tracking-dots {
            display: flex;
            justify-content: space-between;
        }
    
        .tracking-lines {
        display: flex;
        justify-content: space-between;
        position: relative;
    }
    
    .line {
        flex: 1;
        height: 3px;
        background-color: #008000; /* Set the color of the connecting line */
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: -1; /* Set the z-index to position the lines behind the dots */
    }
    
    .dot {
        width: 30px;
        height: 30px;
        background-color: #f7faf9;
        border-radius: 50%;
        animation: moveDot 1s infinite alternate;
        position: relative;
        z-index: 1; /* Set the z-index to position the dots on top of the lines */
    }
    
    /* Add specific styling for each dot */
    #pendingDot::before {
        content: '';
        width: calc(100% - 30px); /* Adjust the width of the line based on your design */
        left: 50%;
        transform: translateX(-50%);
    }
    #processingDot::before {
        content: '';
        width: calc(100% - 60px); /* Adjust the width of the line based on your design */
        left: 50%;
        transform: translateX(-50%);
    }
    #shippedDot::before {
        content: '';
        width: calc(100% - 90px); /* Adjust the width of the line based on your design */
        left: 50%;
        transform: translateX(-50%);
    }
    #deliveredDot::before {
        content: '';
        width: calc(100% - 120px); /* Adjust the width of the line based on your design */
        left: 50%;
        transform: translateX(-50%);
    }
       
            body {
                background-color:#3b5d50;
              
                color:#3b5d50;
                margin: 0;
                padding: 0;
            }
    
            .search-bar {
                background-color: #3b5d50;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 35px;
                margin: 0;
                display: flex;
                border: 2px solid #efeeee;
                border-radius: 30px;
                overflow: hidden;
            }
    
            .search-input {
                border: none;
                padding: 10px;
                width: 800px;
                background-color: #3b5d50;
                color: white;
            }
    
            .search-button {
                background-color: #3d5d50;
                color: white;
                border: none;
                padding: 10px;
                border-top-right-radius: 20px;
                border-bottom-right-radius: 20px;
                cursor: pointer;
            }
    
            .hero {
                background-color: #3b5d50;
                color: #fff;
                padding: 100px 0;
            }
    
            .order_details {
                padding: 60px 0;
            }
    
            .title_confirmation {
                color: #3b5d50;
                font-size: 36px;
                font-weight: 600;
                margin-bottom: 30px;
            }
    
            .order_d_inner {
                background-color: #fff;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                padding: 30px;
            }
    
            .details_item h4 {
                color: #3b5d50;
                font-size: 24px;
                margin-bottom: 20px;
            }
    
            .details_item ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
    
            .details_item ul li {
                margin-bottom: 15px;
            }
    
            .order_details_table {
                margin-top: 50px;
            }
    
            .order_details_table h2 {
                color: #3b5d50;
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 20px;
            }
    
            .table th,
            .table td {
                border: none;
            }
    
            .table th {
                background-color: #3b5d50;
                color: #fff;
            }
    
            .table tbody tr:nth-child(even) {
                background-color: #f2f2f2;
            }
    
            .table-responsive {
                overflow-x: auto;
            }
    
            .order-info {
                margin-bottom: 30px;
            }
    
            .order-address,
            .order-tracking {
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                padding: 30px;
                margin-bottom: 20px;
            }
    
            .order-address h3,
            .order-tracking h3 {
                color: #3b5d50;
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 20px;
            }
    
            .order-total {
                margin-top: 30px;
            }
        </style>
        <title>Furni Free Bootstrap 5 Template for Furniture and Interior Design Websites by Untree.co </title>
    </head>
    
    <body>
    
        <!-- Start Header Area -->
        
    
        <!-- End Header Area -->
    
        <div style="margin-bottom: 1px;" class="hero"style="margin-bottom:1px">
            <div class="container">
                <div class="row">
                    <div class="col-lg-8">
                        <div class="intro-excerpt">
                          
                          <div class="order-info">
                            <div class="row">
                                <div class="col-lg-6">
                                    <h2 style="font-size: 30px;">Order ID: ${order.orderId}</h2>
                                    <h2 style="font-size: 30px;">Order Status: ${order.status}</h2>

                                </div>
                            </div>
                        
                            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                            <p><strong>Ordered On:</strong>${order.createdAt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
        <div style="background-color: #efeeee; border: solid #3b5d50;border-radius: 50px;margin-bottom: 10px;margin-top: 1px;" class="container order-details">
            <div class="row">
                <!-- Order Address Section (Add actual address data) -->
                <div style="color:#3b5d50;" class="col-md-6">
                    <div class="order-address">
                        <h3>Order Address</h3>
                        <p style="font-size: 20px;">${order.shippingAddress.fullname}<br>${order.shippingAddress.adname}&nbsp;,&nbsp;${order.shippingAddress.street}<br>${order.shippingAddress.city}&nbsp;,&nbsp;${order.shippingAddress.pincode}<br>${order.shippingAddress.phonenumber}</p>
                    </div>
                </div>
    
                <!-- Order Tracking Section -->
               
            </div>
    
    
            <!-- Order Items Section (Add actual order items data) -->
            <div class="order-items">
                <h3>Order Items</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Item Total</th>
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
                <td></td>
                <td></td>
                <td>Total After Discount</td>
                <td>${order.totalPrice}</td>
            </tr>
                    </tbody>
                </table>
            </div>
    
            <!-- Order Total Section (Add actual order total data) -->
           
            
            
        </div>
    
        <!-- Include footer and scripts -->
       
       <!-- JavaScript to update order status and move dots -->
    <script>
      // Simulating order with status changes
      const order = {
          status: '<%= order.status %>', // Set the initial order status
          updatedAt: '<%= order.updatedAt %>'
      };
    
      // Function to update order status and move dots
      function updateOrderStatus() {
          // Reset animation for all dots
          resetDotsAnimation();
    
          // Move the corresponding dot based on the order status
          switch (order.status.toLowerCase()) {
              case 'pending':
                  moveDot('pendingDot');
                  break;
              case 'processing':
                  moveDot('pendingDot');
                  moveDot('processingDot');
                  break;
              case 'shipped':
                  moveDot('pendingDot');
                  moveDot('processingDot');
                  moveDot('shippedDot');
                  break;
              case 'delivered':
                  moveDot('pendingDot');
                  moveDot('processingDot');
                  moveDot('shippedDot');
                  moveDot('deliveredDot');
                  break;
                  
    
              // Add more cases for other order statuses
          }
    
          // Display order status and updatedAt dynamically
          document.getElementById('orderStatus').innerText = order.status;
          document.getElementById('updatedAt').innerText = order.updatedAt;
      }
    
      // Function to move a specific dot
      function moveDot(dotId) {
          const dot = document.getElementById(dotId);
          dot.style.backgroundColor = '#008000'; // Set green color
          
    
      }
    
      // Function to reset animation for all dots
      function resetDotsAnimation() {
          const dots = document.getElementsByClassName('dot');
          for (const dot of dots) {
              dot.style.backgroundColor = '	#F4B400'; 
              dot.style.border='solid 1px black'// Reset to default color
          }
      }
    
      // Initial call to update the order status
      updateOrderStatus();
    </script>
    
        <script src="/js/bootstrap.bundle.min.js"></script>
        <script src="/js/tiny-slider.js"></script>
        <script src="/js/custom.js"></script>
    
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











module.exports={userdetails,profileEdit,profileUpdate,newAddress,addressUpdate,changepassword
,editaddress,updateAddress,deleteAddress,orderHistory,ordercancelling,
singleOrderPage,orderreturning,downloadInvoice}