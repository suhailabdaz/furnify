const categoryModel=require('../model/category_model')
const cartModel=require('../model/cart_model')
const productModel=require('../model/product_model');
const usersModel = require('../model/user_model');
const favModel=require('../model/favourites_model')





const showcart = async (req, res) => {
  try {
      const userId = req.session.userId;
      const sessionId = req.session.id;
      const categories = await categoryModel.find();
      let cart;

      if (userId) {
          cart = await cartModel.findOne({ userId: userId }).populate({
              path: 'item.productId',
              select: 'images name price',
          });
      } else {
          // If userId does not exist, find the cart by sessionId
          cart = await cartModel.findOne({ sessionId: sessionId }).populate({
              path: 'item.productId',
              select: 'images name price',
          });
      }

      // Ensure cart is defined and has the expected structure
      if (!cart || !cart.item) {
          // Handle the case when cart is not found or does not have items
          
            cart = new cartModel({
              sessionId: req.session.id,
              item: [],
              total: 0,
            });
      }

      res.render('users/cart.ejs', { cart, categories });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error occurred');
  }
};

  
  const addToCart = async (req, res) => {
    try {
      const pid = req.params.id;
      const product = await productModel.findOne({ _id: pid });
  
      const userId = req.session.userId;
      const price = product.price;
      const stock= product.stock;
      const quantity = 1;
      console.log(req.session.id)
      let cart;
      if (userId) {
        cart = await cartModel.findOne({ userId: userId });
      }
      if (!cart) {
        cart = await cartModel.findOne({ sessionId: req.session.id });
      }
  
      if (!cart) {
        cart = new cartModel({
          sessionId: req.session.id,
          item: [],
          total: 0,
        });
      }
      
      const productExist = cart.item.findIndex((item) => item.productId == pid);
      
      if (productExist !== -1) {
        cart.item[productExist].quantity += 1;
        cart.item[productExist].total =
          cart.item[productExist].quantity * price;
      } else {
        const newItem = {
          productId: pid,
          quantity: 1,
          price: price,
          stock :stock,
          total: quantity * price,
        };
        cart.item.push(newItem);
      }
  
      if (userId && !cart.userId) {
        cart.userId = userId;
      }
  
      cart.total = cart.item.reduce((acc, item) => acc + item.total, 0);
  
      await cart.save();
      res.redirect('/cartpage');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error occurred');
    }
  }



const updateCartItem = async (req, res) => {
    const { userId, sessionId, productId } = req.params;
    const { quantity } = req.body;

    try {
        const cart = await cartModel.findOne({
            $or: [
                { userId: userId },
                { sessionId: sessionId },
            ],
        });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cartItem = cart.item.find(item => item.productId.toString() === productId);

        if (!cartItem) {
            return res.status(404).json({ message: 'Product not found in the cart' });
        }

        // Update the quantity and total for the specific item
        cartItem.quantity = quantity;
        cartItem.total = quantity * cartItem.price;

        // Recalculate the total for the entire cart
        cart.total = cart.item.reduce((acc, item) => acc + item.total, 0);

        await cart.save();

        return res.json(cart);
    } catch (error) {
        console.error('Error updating cart item:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const updatecart = async (req, res) => {
  try {
    console.log("hi");
    console.log('Received Request:', req.body);
    const { productId } = req.params; // Adjusted this line
    const { action, cartId } = req.body;
    const cart = await cartModel.findOne({ _id: cartId });
    console.log("cartId", cartId);
    console.log("cart", cart);
    console.log(productId);
    const itemIndex = cart.item.findIndex(item => item._id == productId);
    console.log(itemIndex)

    console.log("itemIndex", itemIndex);
    console.log("Cart Items:", cart.item);

    console.log(cart.item[itemIndex].quantity);
    console.log(cart.item[itemIndex].stock);
    console.log(cart.item[itemIndex].price);
    const currentQuantity = cart.item[itemIndex].quantity;
    const stockLimit = cart.item[itemIndex].stock;
    const price = cart.item[itemIndex].price;

    let updatedQuantity;

    if (action == '1') {
      console.log("1");
      updatedQuantity = currentQuantity + 1;
    } else if (action == '-1') {
      console.log("-1");
      updatedQuantity = currentQuantity - 1;
    } else {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    if (updatedQuantity < 1 || updatedQuantity > stockLimit) {
      return res.status(400).json({ success: false, error: 'Quantity exceeds stock limits' });
    }

    cart.item[itemIndex].quantity = updatedQuantity;

    // Calculate the new total for the specific product
    const newProductTotal = price * updatedQuantity;
    cart.item[itemIndex].total = newProductTotal;
    const total = cart.item.reduce((acc, item) => acc + item.total, 0);
    console.log("total", total);
    cart.total = total;
    await cart.save();

    res.json({
      success: true,
      newQuantity: updatedQuantity,
      newProductTotal,
      total: total,
    });

  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


const deletecart=async(req,res)=>{
  try {
      const userId=req.session.userId
      const pid=req.params.id
      const size=req.params.size
      console.log('Deleting item:', { userId, pid });
      const result=await cartModel.updateOne({userId:userId},{$pull:{item:{_id:pid}}})
      console.log('Update result:', result);
      const updatedCart = await cartModel.findOne({ userId: userId });
      const newTotal = updatedCart.item.reduce((acc, item) => acc + item.total, 0);
      updatedCart.total = newTotal;
      await updatedCart.save();
     res.redirect('/cartpage')
  }
  catch(err) {
      console.log(err);
      res.status(500).send('error occured')

  }
}

const checkoutpage = async (req, res) => {
  try {
    
    const categories = await categoryModel.find();
    const cartId = req.query.cartId;
    const userId = req.session.userId;

    const addresslist = await usersModel.findOne({ _id: userId });

    if (!addresslist) {
      console.log('User not found');
      return res.status(404).send('User not found');
    }

    const addresses = addresslist.address;

    const cart = await cartModel.findById(cartId).populate('item.productId')

    const cartItems = (cart.item || []).map((cartItem) => ({
      productId:cartItem.productId._id,
      productName: cartItem.productId.name,
      quantity: cartItem.quantity,
      itemTotal: cartItem.total,
    }));

    

    console.log('Cart Total:', cart.total);

    res.render('users/checkout', { addresses, cartItems, categories, cart,cartId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error occurred');
  }
};

const addToFvourites= async (req, res) => {
  try {
    const pid = req.params.id;
    const product = await productModel.findOne({ _id: pid });

    const userId = req.session.userId;
    const price = product.price;
    const quantity = 1;
  
    let fav;
    if (userId) {
      fav = await favModel.findOne({ userId: userId });
    }
    if (!fav) {
      fav = await favModel.findOne({ sessionId: req.session.id });
    }

    if (!fav) {
      fav = new favModel({
        sessionId: req.session.id,
        item: [],
        total: 0,
      });
    }
    
    const productExist = fav.item.findIndex((item) => item.productId == pid);
    
    if (productExist !== -1) {
      fav.item[productExist].quantity += 1;
      fav.item[productExist].total =
        fav.item[productExist].quantity * price;
    } else {
      const newItem = {
        productId: pid,
        price: price,
      };
      fav.item.push(newItem);
    }

    if (userId && !fav.userId) {
      fav.userId = userId;
    }

    await fav.save();
    res.redirect('/favouritespage');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error occurred');
  }
}
const favouritespage=async(req,res)=>{
  try {
    const userId = req.session.userId;
    const sessionId = req.session.id;
    const categories = await categoryModel.find();
    let fav;

    if (userId) {
        fav = await favModel.findOne({ userId: userId }).populate({
            path: 'item.productId',
            select: 'images name price',
        });
    } else {
        fav = await favModel.findOne({ sessionId: sessionId }).populate({
            path: 'item.productId',
            select: 'images name price',
        });
    }

    
    if (!fav || !fav.item) {
          cart = new favModel({
            sessionId: req.session.id,
            item: [],
            total: 0,
          });
    }

    res.render('users/favourites.ejs', { fav, categories });
} catch (err) {
    console.error(err);
    res.status(500).send('Error occurred');
}
  
}

const deletefav=async(req,res)=>{
  try {
      const userId=req.session.userId
      const pid=req.params.id
      console.log('Deleting item:', { userId, pid });
      const result=await favModel.updateOne({userId:userId},{$pull:{item:{_id:pid}}})
      console.log('Update result:', result);
      const updatedFav = await favModel.findOne({ userId: userId });
      const newTotal = updatedFav.item.reduce((acc, item) => acc + item.total, 0);
      updatedFav.total = newTotal;
      await updatedFav.save();
     res.redirect('/favouritespage')
  }
  catch(err) {
      console.log(err);
      res.status(500).send('error occured')

  }
}



  
  module.exports= {
    showcart,
    addToCart,
    updateCartItem,
    updatecart,
    deletecart,
    checkoutpage,
    addToFvourites,
    favouritespage,
    deletefav
  };
  