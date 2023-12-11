const categoryModel=require('../model/category_model')
const userModel=require('../model/user_model')
const cartModel=require('../model/cart_model')
const orderModel=require('../model/order_model')
const productModel=require('../model/product_model')
const couponModel=require('../model/coupon_model')
const walletModel=require('../model/wallet_model')
const bcrypt=require("bcrypt")
const shortid=require("shortid")
const mongoose=require("mongoose")
const Razorpay=require("razorpay")
const {key_id,key_secret}=require("../../.env")

const checkoutreload = async (req, res) => {
    try {
        const { saveas, fullname, adname, street, pincode, city, state, country, phone } = req.body;
        const userId = req.session.userId;
        console.log("id", userId);

        const existingUser = await userModel.findOne({ _id: userId });

        if (existingUser) {
            // Corrected query to find existing address for the user
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
                // Address already exists, handle accordingly
                // req.flash('address', 'This Address already existed');
                return res.redirect('/addAddress');
            }

            existingUser.address.push({
                saveas: saveas,
                fullname: fullname,
                adname: adname,
                street: street,
                pincode: pincode,
                city: city,
                state: state,
                country: country,
                phonenumber: phone
            });

            await existingUser.save();
        }

        const categories = await categoryModel.find();
        const cartId = req.body.cartId;
        const addresslist = await userModel.findOne({ _id: userId });

        if (!addresslist) {
            console.log('User not found');
            // Handle the case where the user with the given userId is not found
            return res.status(404).send('User not found');
        }

        const addresses = addresslist.address;

        // Check if cartId is provided and is valid
        if (!cartId) {
            console.log('Cart ID not provided');
            return res.status(400).send('Cart ID not provided');
        }

        // Find the cart by ID
        const cart = await cartModel.findById(cartId).populate('item.productId');

        // Check if cart exists
        if (!cart) {
            console.log('Cart not found');
            return res.status(404).send('Cart not found');
        }

        const cartItems = cart.item.map((cartItem) => ({
            productName: cartItem.productId.name,
            quantity: cartItem.quantity,
            itemTotal: cartItem.total,
        }));

        console.log('Cart Total:', cart.total);

        res.render('users/checkout', { addresses, cartItems, categories, cart });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred');
    }
};

const placeOrder = async (req, res) => {
  try {
    console.log(req.body);
    const categories = await categoryModel.find({});

    const addressId = req.body.selectedAddressId;
    const user = await userModel.findOne({
      address: { $elemMatch: { _id: addressId } },
    });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const selectedAddress = user.address.find((address) =>
      address._id.equals(addressId)
    );
    const userId = req.session.userId;
    const username = selectedAddress.fullname;
    const paymentMethod = req.body.selectedPaymentOption;
    const cartId = req.body.cartId;

    const items = req.body.selectedProductNames.map((productName, index) => ({
      productName: req.body.selectedProductNames[index],
      productId: new mongoose.Types.ObjectId(req.body.selectedProductIds[index]),
      singleprice:parseInt(req.body.selectedProductPrices[index]),
      quantity: parseInt(req.body.selectedQuantities[index]),
      price: parseInt(req.body.selectedCartTotals[index]),
    }));

    const order = new orderModel({
      orderId: shortid.generate(),
      userId: userId,
      userName: username,
      items: items,
      totalPrice: parseInt(req.body.carttotal),
      shippingAddress: selectedAddress,
      paymentMethod: paymentMethod,
      createdAt: new Date(),
      status: 'Pending',
      updatedAt: new Date(),
    });
    console.log('Items:', items);

    await order.save();

    for (const item of items) {
      await cartModel.updateOne(
        { userId: userId },
        { $pull: { item: { productId: item.productId } } }
      );

      await cartModel.updateOne({ userId: userId }, { $set: { total: 0 } });
    }

    for (const item of items) {
      await productModel.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }

    res.render('users/order_confirmation', { order, categories });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

const instance=new Razorpay({key_id:key_id,key_secret:key_secret})

const upi = async (req, res) => {
  console.log('body:', req.body);
  var options = {
      amount: 500,
      currency: "INR",
      receipt: "order_rcpt"
  };
  instance.orders.create(options, function (err, order) {
      console.log("order1 :", order);
      res.send({ orderId: order.id })
    })
}
const wallettransaction = async (req, res) => {
  try {
    console.log("iiiiide ethi mwone..........")
     const userId=req.session.userId
     const amount=req.body.amount 
     const user=await walletModel.findOne({userId:userId})
     console.log("user",user)
     console.log("amount",amount);
     const wallet=user.wallet
     console.log("wallet",wallet);

     if(user.wallet>=amount){
      user.wallet-=amount
      await user.save();

      const wallet=await walletModel.findOne({userId:userId})
      
      
          wallet.walletTransactions.push({type:"Debited",
          amount:amount,
          date:new Date()})
          await wallet.save();
      
      res.json({success:true})
     }
     else{
      res.json({success:false,message:"don't have enought money"})
     }
  } catch (err) {
      console.error(err);
      res.redirect('/error')
    }
}

const applyCoupon = async (req, res) => {
  try {
    const { couponCode, subtotal } = req.body;
    const coupon = await couponModel.findOne({ couponCode: couponCode });
    console.log(coupon);
    
    if (coupon) {
        // Coupon is not null
        if (coupon.expiry > new Date() && coupon.minimumPrice <= subtotal) {
            console.log("Coupon is valid");
            const dicprice = (subtotal * coupon.discount) / 100;
            const price = subtotal - dicprice;
            console.log(price);
            res.json({ success: true, dicprice, price });
        } else {
            res.json({ success: false, message: "Invalid Coupon" });
        }
    } else {
        // Coupon is null
        res.json({ success: false, message: "Coupon not found" });
    }
    
  } catch (err) {
      console.error(err);
      res.status(500).send('Error occurred');
    }
}



  module.exports={
    checkoutreload,
    placeOrder,
    upi,
    applyCoupon,
    wallettransaction
  }