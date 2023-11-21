const categoryModel=require('../model/category_model')
const userModel=require('../model/user_model')
const cartModel=require('../model/cart_model')
const orderModel=require('../model/order_model')
const bcrypt=require("bcrypt")
const shortid=require("shortid")

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

    const addressId = req.body.selectedAddressId;
    const user = await userModel.findOne({ address: { $elemMatch: { _id: addressId } } });

    if (!user) {
      // Handle the case when the user with the specified addressId is not found
      return res.status(404).send('User not found');
    }

    const selectedAddress = user.address.find(address => address._id.equals(addressId));
    const userId = req.session.userId;
    const username = selectedAddress.fullname;
    const paymentMethod=req.body.selectedPaymentOption

    // Create an array of items (adjust based on your data model)
    const items = req.body.selectedProductNames.map((productName, index) => ({
      name: productName,
      quantity: parseInt(req.body.selectedQuantities[index]),
      price: parseInt(req.body.selectedCartTotals[index]),
    }));

    // Create a new instance of the orderModel (adjust based on your data model)
    const order = new orderModel({
      orderId: shortid.generate(),
      userId: userId,
      userName: username,
      items: items,
      totalPrice: parseInt(req.body.selectedItemTotals),
      shippingAddress: selectedAddress,
      paymentMethod: paymentMethod, // You might get this information from req.body or elsewhere
      createdAt: new Date(),
      status: 'Pending', // Set the initial status
      updatedAt: null, // Set as needed
    });

    // Save the order to the database
    await order.save();

    // Redirect or send a response as needed
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};




  module.exports={
    checkoutreload,
    placeOrder,
  }
  



