const categoryModel=require('../model/category_model')
const cartModel=require('../model/cart_model')
const productModel=require('../model/product_model');
const usersModel = require('../model/user_model');
const favModel=require('../model/favourites_model')
const couponModel=require('../model/coupon_model')





const showcart = async (req, res) => {
  try {
      const userId = req.session.userId;
      const sessionId = req.session.id;
      const categories = await categoryModel.find();
      let cart;

      if (userId) {
          cart = await cartModel.findOne({ userId: userId }).populate({
              path: 'item.productId',
              select: 'images name price stock',
          });
      } else {
        
          cart = await cartModel.findOne({ sessionId: sessionId }).populate({
              path: 'item.productId',
              select: 'images name price',
          });
      }

      
      if (!cart || !cart.item) {

          
            cart = new cartModel({
              sessionId: req.session.id,
              item: [],
              total: 0,
            });
      }
      
      req.session.checkout=true

      res.render('users/cart.ejs', { cart, categories });
    
  } catch (err) {
    console.log(err);
    res.render("users/serverError")
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

      if (stock==0){
        res.redirect('/cartpage')
      }
      else{
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
    }
    }  catch (err) {
      console.log(err);
      res.render("users/serverError")
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

        cartItem.quantity = quantity;
        cartItem.total = quantity * cartItem.price;


        cart.total = cart.item.reduce((acc, item) => acc + item.total, 0);

        await cart.save();

        return res.json(cart);
    }  catch (err) {
      console.log(err);
      res.render("users/serverError")
  }
};

const updatecart = async (req, res) => {
  try {
    console.log("hi");
    console.log('Received Request:', req.body);
    const { productId } = req.params;
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
    
    
    const selectedProductId= cart.item[itemIndex].productId
    const selectedProduct=await productModel.findOne({_id:selectedProductId})
    console.log("selctedproduct",selectedProduct)
    const stockLimit = selectedProduct.stock;
    console.log("limit",stockLimit)
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

    if (updatedQuantity < 1 || (updatedQuantity > stockLimit && action=="1")) {
      return res.status(400).json({ success: false, error: 'Quantity exceeds stock limits' });
    }
    
    cart.item[itemIndex].quantity = updatedQuantity;
    
    
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

  }  catch (err) {
    console.log(err);
    res.render("users/serverError")
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
  catch (err) {
    console.log(err);
    res.render("users/serverError")
}
}

const checkoutpage = async (req, res) => {
  try {
    
    const categories = await categoryModel.find();
    const cartId = req.query.cartId;
    const userId = req.session.userId;
    const user = await usersModel.findById(userId);
    const availableCoupons = await couponModel.find({
      couponCode: { $nin: user.usedCoupons },
      status:true
    });
    console.log("coupons",availableCoupons);


    const addresslist = await usersModel.findOne({ _id: userId });

    if (!addresslist) {
      console.log('User not found');
      return res.status(404).send('User not found');
    }

    const addresses = addresslist.address;

    const cart = await cartModel.findById(cartId).populate('item.productId')

    for (const cartItem of cart.item || []) {
      const product = await productModel.findById(cartItem.productId);
      
      
      if (cartItem.quantity > product.stock) {
        
        console.log('Selected quantity exceeds available stock for productId:', cartItem.productId);
        const nonitemid= cartItem.productId
        const theitem=await productModel.findOne({_id:nonitemid})
        const nameitem = theitem.name
        return res.render('users/cart',{cart,categories,message:` The product ${nameitem}'s quantity Exceeds StockLimit..!!`})
      
      }
      
    }
    

    const cartItems = (cart.item || []).map((cartItem) => ({
      productId:cartItem.productId._id,
      productName: cartItem.productId.name,
      price:cartItem.productId.price,
      quantity: cartItem.quantity,
      itemTotal: cartItem.total,
    }));

    

    console.log('Cart Total:', cart.total);

    res.render('users/checkout', {availableCoupons, addresses, cartItems, categories, cart,cartId });
  
  
} catch (err) {
  console.log(err);
  res.render("users/serverError")
}
};





const addToFvourites= async (req, res) => {
  try {
    const pid = req.params.id;
    const product = await productModel.findOne({ _id: pid });

    const userId = req.session.userId;
    const price = product.price;
  
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
  }  catch (err) {
    console.log(err);
    res.render("users/serverError")
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
  console.log(err);
  res.render("users/serverError")
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
      await updatedFav.save();
      res.redirect('/favouritespage')
  }
  catch (err) {
    console.log(err);
    res.render("users/serverError")
}
}

const addtocartviafav=async(req,res)=>{
  try{
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


  }
  catch (err) {
    console.log(err);
    res.render("users/serverError")
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
    deletefav,
    addtocartviafav
  };
  