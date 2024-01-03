const categoryModel = require("../model/category_model");
const userModel = require("../model/user_model");
const orderModel = require("../model/order_model");
const productModel = require("../model/product_model");
const couponModel = require("../model/coupon_model");
const walletModel = require("../model/wallet_model");
const cartModel = require("../model/cart_model");
const Razorpay = require("razorpay");
const bcrypt = require("bcrypt");
const easyinvoice = require("easyinvoice");

const key_id = process.env.key_id;
const key_secret = process.env.key_secret;

const instance = new Razorpay({ key_id: key_id, key_secret: key_secret });

const {
  nameValid,
  lnameValid,
  emailValid,
  passwordValid,
  confirmpasswordValid,
  phoneValid,
} = require("../../utils/validators/signup_Validators");

const {
  bnameValid,
  adphoneValid,
  pincodeValid,
} = require("../../utils/validators/address_Validators");
const { default: mongoose } = require("mongoose");

const userdetails = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log("id", userId);
    const data = await userModel.findOne({ _id: userId });
    const categories = await categoryModel.find();
    res.render("users/userdetails", { categories, userData: data });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const profileEdit = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log("id", userId);
    const categories = await categoryModel.find();
    const data = await userModel.findOne({ _id: userId });
    console.log("data", data);
    res.render("users/editprofile", { userData: data, categories });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const profileUpdate = async (req, res) => {
  try {
    const { email, firstName, lastName, mob } = req.body;
    const userId = req.session.userId;
    console.log("id", userId);
    console.log("values", firstName, lastName, mob);
    const data = await userModel.updateOne(
      { _id: userId },
      {
        $set: {
          firstname: firstName,
          lastname: lastName,
          mobileNumber: mob,
        },
      }
    );
    console.log("data", data);
    res.redirect("/userdetails");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const newAddress = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.render("users/newAddress", {
      categories,
      addressInfo:req.session.addressInfo,
      expressFlash: {
        fullnameerror: req.flash("fullnameerror"),
        saveaserror: req.flash("saveaserror"),
        adnameerror: req.flash("adnameerror"),
        streeterror: req.flash("streeterror"),
        pincodeerror: req.flash("pincodeerror"),
        cityerror: req.flash("cityerror"),
        stateerror: req.flash("stateerror"),
        countryerror: req.flash("countryerror"),
        phoneerror: req.flash("phoneerror"),
      },
    });
    req.session.addressInfo=null;
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const addressUpdate = async (req, res) => {
  try {
    const {
      saveas,
      fullname,
      adname,
      street,
      pincode,
      city,
      state,
      country,
      phone,
    } = req.body;
    req.session.addressInfo=req.body
    const userId = req.session.userId;
    const categories = await categoryModel.find();

    const existingUser = await userModel.findOne({ _id: userId });
    const fullnamevalid = bnameValid(fullname);
    const saveasvalid = bnameValid(saveas);
    const adnameValid = bnameValid(adname);
    const streetValid = bnameValid(street);
    const pincodevalid = pincodeValid(pincode);
    const cityValid = bnameValid(city);
    const stateValid = bnameValid(state);
    const countryValid = bnameValid(country);
    const phoneValid = adphoneValid(phone);
    if (!fullnamevalid) {
      req.flash("fullnameerror", "Enter a valid name");
      return res.redirect("/addAddress");
    }
    if (!saveasvalid) {
      req.flash("saveaserror", "Enter a valid addresstype");
      return res.redirect("/addAddress");
    }
    if (!adnameValid) {
      req.flash("adnameerror", "Enter a valid address");
      return res.redirect("/addAddress");
    }
    if (!streetValid) {
      req.flash("streeterror", "enter a valid street");
      return res.redirect("/addAddress");
    }
    if (!pincodevalid) {
      req.flash("pincodeerror", "Enter a valid Pincode");
      return res.redirect("/addAddress");
    }

    if (!cityValid) {
      req.flash("cityerror", "Enter Valid City");
      return res.redirect("/addAddress");
    }
    if (!stateValid) {
      req.flash("stateerror", "Enter valid state");
      return res.redirect("/addAddress");
    }
    if (!countryValid) {
      req.flash("countryerror", "Enter valid country");
      return res.redirect("/addAddress");
    }
    if (!phoneValid) {
      req.flash("phoneerror", "Enter valid country ");
      return res.redirect("/addAddress");
    }
    if (existingUser) {
      const existingAddress = await userModel.findOne({
        _id: userId,
        address: {
          $elemMatch: {
            fullname: fullname,
            adname: adname,
            street: street,
            pincode: pincode,
            city: city,
            state: state,
            country: country,
            phonenumber: phone,
          },
        },
      });

      if (existingAddress) {
        return res.redirect("/addAddress");
      }

      req.session.addressInfo=null

      existingUser.address.push({
        saveas: saveas,
        fullname: fullname,
        adname: adname,
        street: street,
        pincode: pincode,
        city: city,
        state: state,
        country: country,
        phonenumber: phone,
      });

      await existingUser.save();

      // req.flash('address', 'Address added successfully');
    }

    res.redirect("/userdetails");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const changepassword = async (req, res) => {
  console.log("mele");
  try {
    console.log("vannu");
    const password = req.body.newPassword;
    const cpassword = req.body.confirmPassword;

    const ispasswordValid = passwordValid(password);
    const iscpasswordValid = confirmpasswordValid(cpassword, password);

    if (!ispasswordValid) {
      res.render("users/userdetails", {
        perror:
          "Password should contain one uppercase,one lowercase,one number,one special charecter",
      });
    } else if (!iscpasswordValid) {
      res.render("users/userdetails", {
        cperror: "Password and Confirm password should be match",
      });
    } else {
      const hashedpassword = await bcrypt.hash(password, 10);
      const userId = req.session.userId;
      console.log("ippo", userId);
      await userModel.updateOne({ _id: userId }, { password: hashedpassword });
      res.redirect("/userdetails");
    }
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const editaddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;

    const userId = req.session.userId;

    const user = await userModel.findById(userId);
    const addressToEdit = user.address.id(addressId);
    const categories = await categoryModel.find();

    res.render("users/editaddress", {
      categories,
      addressToEdit,
      expressFlash: {
        fullnameerror: req.flash("fullnameerror"),
        saveaserror: req.flash("saveaserror"),
        adnameerror: req.flash("adnameerror"),
        streeterror: req.flash("streeterror"),
        pincodeerror: req.flash("pincodeerror"),
        cityerror: req.flash("cityerror"),
        stateerror: req.flash("stateerror"),
        countryerror: req.flash("countryerror"),
        phoneerror: req.flash("phoneerror"),
      },
    });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};
const updateAddress = async (req, res) => {
  try {
    const {
      saveas,
      fullname,
      adname,
      street,
      pincode,
      city,
      state,
      country,
      phone,
    } = req.body;
    const addressId = req.params.addressId;
    const userId = req.session.userId;
    console.log("id", userId);

    const isAddressExists = await userModel.findOne({
      _id: userId,
      address: {
        $elemMatch: {
          _id: { $ne: addressId },
          saveas: saveas,
          fullname: fullname,
          adname: adname,
          street: street,
          pincode: pincode,
          city: city,
          state: state,
          country: country,
          phonenumber: phone,
        },
      },
    });

    const fullnamevalid = bnameValid(fullname);
    const saveasvalid = bnameValid(saveas);
    const adnameValid = bnameValid(adname);
    const streetValid = bnameValid(street);
    const pincodevalid = pincodeValid(pincode);
    const cityValid = bnameValid(city);
    const stateValid = bnameValid(state);
    const countryValid = bnameValid(country);
    const phoneValid = adphoneValid(phone);

    if (!fullnamevalid) {
      req.flash("fullnameerror", "Enter a valid name");
      return res.redirect(`/editaddress/${addressId}`);
    }
    if (!saveasvalid) {
      req.flash("saveaserror", "Enter a valid addresstype");
      return res.redirect(`/editaddress/${addressId}`);
    }
    if (!adnameValid) {
      req.flash("adnameerror", "Enter a valid address");
      return res.redirect(`/editaddress/${addressId}`);
    }
    if (!streetValid) {
      req.flash("streeterror", "enter a valid street");
      return res.redirect(`/editaddress/${addressId}`);
    }
    if (!pincodevalid) {
      req.flash("pincodeerror", "Enter a valid Pincode");
      return res.redirect(`/editaddress/${addressId}`);
    }

    if (!cityValid) {
      req.flash("cityerror", "Enter Valid City");
      return res.redirect(`/editaddress/${addressId}`);
    }
    if (!stateValid) {
      req.flash("stateerror", "Enter valid state");
      return res.redirect(`/editaddress/${addressId}`);
    }
    if (!countryValid) {
      req.flash("countryerror", "Enter valid country");
      return res.redirect(`/editaddress/${addressId}`);
    }
    if (!phoneValid) {
      req.flash("phoneerror", "Enter valid country ");
      return res.redirect(`/editaddress/${addressId}`);
    }

    if (isAddressExists) {
      req.flash("addrssexists", "Address Already Exist");
      return res.redirect(`/editaddress/${addressId}`);
    }

    const result = await userModel.updateOne(
      { _id: userId, "address._id": addressId },
      {
        $set: {
          "address.$.saveas": saveas,
          "address.$.fullname": fullname,
          "address.$.adname": adname,
          "address.$.street": street,
          "address.$.pincode": pincode,
          "address.$.city": city,
          "address.$.state": state,
          "address.$.country": country,
          "address.$.phonenumber": phone,
        },
      }
    );

    res.redirect("/userdetails");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const userId = req.session.userId;
    const result = await userModel.updateOne(
      { _id: userId, "address._id": addressId },
      { $pull: { address: { _id: addressId } } }
    );
    console.log("userId:", userId);
    console.log("addressId:", addressId);
    console.log("Update result:", result);
    res.redirect("/userdetails");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const orderHistory = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log(userId);
    const categories = await categoryModel.find({});
    const od = await orderModel.find({ userId: userId });
    const allOrderItems = [];
    od.forEach((order) => {
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
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
    ]);
    const updatedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        productDetails: order.productDetails.find(
          (product) => product._id.toString() === item.productId.toString()
        ),
      })),
    }));

    res.render("users/order_history", {
      od,
      orders: updatedOrders,
      categories,
      allOrderItems,
    });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const ordercancelling = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.userId;
    const update = await orderModel.updateOne(
      { _id: id },
      { status: "Cancelled" }
    );
    const result = await orderModel.findOne({ _id: id });
    if (
      result.paymentMethod == "Razorpay" ||
      result.paymentMethod == "Wallet"
    ) {
      const user = await walletModel.findOne({ userId: userId });

      const refund = result.totalPrice;

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
              type: "Credited", // or 'debit' depending on your use case
              amount: refund, // Replace with the actual amount you want to add
            },
          },
        }
      );
    }
    console.log("result", result);
    const items = result.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    for (const item of items) {
      const product = await productModel.findOne({ _id: item.productId });
      product.stock += item.quantity;
      await product.save();
    }

    res.redirect("/orderhistory");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const orderreturning = async (req, res) => {
  try {
    const userId = req.session.userId;

    const id = req.params.id;
    const update = await orderModel.updateOne(
      { _id: id },
      { status: "Returned" }
    );
    const order = await orderModel.findOne({ _id: id });
    const user = await walletModel.findOne({ userId: userId });

    console.log("paranja order", order);
    const refund = order.totalPrice;
    console.log("refundAmount", refund);

    const currentWallet = user.wallet;
    const newWallet = currentWallet + refund;
    const amountUpdate = await walletModel.updateOne(
      { userId: userId },
      {
        $set: { wallet: newWallet },
        $push: {
          walletTransactions: {
            date: new Date(),
            type: "Credited",
            amount: refund,
          },
        },
      }
    );

    const result = await orderModel.findOne({ _id: id });

    const items = result.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    for (const item of items) {
      const product = await productModel.findOne({ _id: item.productId });
      product.stock += item.quantity;
      await product.save();
    }

    res.redirect("/orderhistory");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const itemcancelling = async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const orderId = req.params.orderId;

    const order = await orderModel.findOne({ _id: orderId });

    const itemIndex = order.items.findIndex((item) => item.productId == id);

    if (itemIndex === -1) {
      return res.status(404).send("Item not found in the order");
    }

    if (!order) {
      return res.status(404).send("Order not found");
    }

    if (order.paymentMethod == "Razorpay" || order.paymentMethod == "Wallet") {
      const user = await walletModel.findOne({ userId: userId });

      const refund = order.items[itemIndex].price;

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
              type: "Credited", // or 'debit' depending on your use case
              amount: refund, // Replace with the actual amount you want to add
            },
          },
        }
      );
    }

    const nonCancelledItems = order.items.filter(
      (item) => item.status !== "cancelled"
    );

    if (nonCancelledItems.length < 2) {
      order.status = "Cancelled";

      await orderModel.updateOne(
        { _id: orderId, "items.productId": order.items[itemIndex].productId },
        {
          $set: {
            "items.$.status": "cancelled", // Update the status of the specific item in the array
            updatedAt: new Date(),
          },
        }
      );

      await order.save();
      return res.redirect(`/singleOrder/${orderId}`);
    }

    const result = await orderModel.updateOne(
      { _id: orderId, "items.productId": order.items[itemIndex].productId },
      {
        $set: {
          "items.$.status": "cancelled", // Update the status of the specific item in the array
          totalPrice: order.totalPrice - order.items[itemIndex].price,
          updatedAt: new Date(),
        },
      }
    );

    res.redirect(`/singleOrder/${orderId}`);
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const itemreturning = async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const orderId = req.params.orderId;

    const order = await orderModel.findOne({ _id: orderId });

    const user = await walletModel.findOne({ userId: userId });

    const itemIndex = order.items.findIndex((item) => item.productId == id);

    if (itemIndex === -1) {
      return res.status(404).send("Item not found in the order");
    }

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const refund = order.items[itemIndex].price;
    console.log("refundAmount", refund);

    const currentWallet = user.wallet;
    const newWallet = currentWallet + refund;
    const amountUpdate = await walletModel.updateOne(
      { userId: userId },
      {
        $set: { wallet: newWallet },
        $push: {
          walletTransactions: {
            date: new Date(),
            type: "Credited",
            amount: refund,
          },
        },
      }
    );

    const nonReturnedItems = order.items.filter(
      (item) => item.status !== "returned"
    );

    if (nonReturnedItems.length < 2) {
      order.status = "Returned";

      await orderModel.updateOne(
        { _id: orderId, "items.productId": order.items[itemIndex].productId },
        {
          $set: {
            "items.$.status": "returned",
            updatedAt: new Date(),
          },
        }
      );

      await order.save();
      return res.redirect(`/singleOrder/${orderId}`);
    }

    const result = await orderModel.updateOne(
      { _id: orderId, "items.productId": order.items[itemIndex].productId },
      {
        $set: {
          "items.$.status": "returned",
          totalPrice: order.totalPrice - order.items[itemIndex].price,
          updatedAt: new Date(),
        },
      }
    );

    res.redirect(`/singleOrder/${orderId}`);
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const singleOrderPage = async (req, res) => {
  try {
    const id = req.params.id;

    const order = await orderModel.findOne({ _id: id });
    const categories = await categoryModel.find({});
    res.render("users/orderDetails", { categories, order });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log("id", orderId);
    const order = await orderModel.findOne({ orderId: orderId }).populate({
      path: "items.productId",
      select: "name",
    });

    console.log("odrer", order);

    const pdfBuffer = await generateInvoice(order);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      ` attachment; filename=invoice-${order.orderId}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.render("users/serverError");
  }
};
const generateInvoice = async (order) => {
  try {
    let totalAmount = order.totalPrice;
    const data = {
      documentTitle: "Invoice",
      currency: "INR",
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      sender: {
        company: "Furnify",
        address: "123 Main Street, Banglore, India",
        zip: "651323",
        city: "Banglore",
        country: "INDIA",
        phone: "9876543210",
        email: "thefurnify@gmail.com",
        website: "www.thefurnify.shop",
      },
      invoiceNumber: "INV-${order.orderId}",
      invoiceDate: new Date().toJSON(),
      products: order.items.map((item) => ({
        quantity: item.quantity,
        description: item.productName,
        price: item.price,
      })),
      total: `₹${totalAmount.toFixed(2)}`,
      tax: 0,
      bottomNotice: "Thank you for shopping at UrbanSole!",
    };

    const result = await easyinvoice.createInvoice(data);
    const pdfBuffer = Buffer.from(result.pdf, "base64");

    return pdfBuffer;
  } catch (error) {
    console.error(error);
    res.render("users/serverError");
  }
};

const wallet = async (req, res) => {
  try {
    const userId = req.session.userId;
    const categories = await categoryModel.find({});
    let user = await walletModel
      .findOne({ userId: userId })
      .sort({ "walletTransactions.date": -1 });

    if (!user) {
      user = await walletModel.create({ userId: userId });
    }

    const userWallet = user.wallet;
    const usertransactions = user.walletTransactions.reverse();

    res.render("users/wallet", { categories, userWallet, usertransactions });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const couponsAndRewards = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log(userId);
    const user = await userModel.findById(userId);
    const coupons = await couponModel.find({
      couponCode: { $nin: user.usedCoupons },
      status: true,
    });
    const categories = await categoryModel.find();
    res.render("users/rewardsPage", {
      categories,
      coupons,
      referralCode: userId,
    });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const walletupi = async (req, res) => {
  console.log("body:", req.body);
  var options = {
    amount: 500,
    currency: "INR",
    receipt: "order_rcpt",
  };
  instance.orders.create(options, function (err, order) {
    console.log("order1 :", order);
    res.send({ orderId: order.id });
  });
};

const walletTopup = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { razorpay_payment_id, razorpay_order_id } = req.body;
    const Amount = parseFloat(req.body.Amount);
    console.log(Amount);
    const wallet = await walletModel.findOne({ userId: userId });

    wallet.wallet += Amount;
    wallet.walletTransactions.push({
      type: "Credited",
      amount: Amount,
      date: new Date(),
    });

    await wallet.save();
    res.redirect("/wallet");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

module.exports = {
  userdetails,
  profileEdit,
  profileUpdate,
  newAddress,
  addressUpdate,
  changepassword,
  editaddress,
  updateAddress,
  deleteAddress,
  orderHistory,
  ordercancelling,
  singleOrderPage,
  orderreturning,
  downloadInvoice,
  wallet,
  walletupi,
  walletTopup,
  itemcancelling,
  itemreturning,
  couponsAndRewards,
};
