const otpgenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const usersModel = require("../model/user_model");
const userotp = require("../model/user_otp_model");
const categoryModel = require("../model/category_model");
const productModel = require("../model/product_model");
const mongoose = require("mongoose");
const flash = require("express-flash");
const ObjectId = mongoose.Types.ObjectId;

const {
  nameValid,
  lnameValid,
  emailValid,
  phoneValid,
  passwordValid,
  confirmpasswordValid,
} = require("../../utils/validators/signup_Validators");
const Email = process.env.Email;
const pass = process.env.pass;
const otpModel = require("../model/user_otp_model");
const { category } = require("./admin_controller");
const bannerModel = require("../model/banner_model");
const walletModel = require("../model/wallet_model");

const home = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    const banners = await bannerModel.find();
    req.session.newpasspressed = false;

    res.render("users/index", { categories, banners });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};
const shop = async (req, res) => {
  const category = req.query.category;
  const products = await productModel
    .find({ $and: [{ category }, { status: true }] })
    .exec();
  const categories = await categoryModel.find();
  const ctCategory = categories.find((cat) => cat._id.toString() === category);
  const categoryName = ctCategory ? ctCategory.name : null;
  const theCategory = await categoryModel.find({ _id: category });
  res.render("users/shop", {
    theCategory,
    categoryName,
    categories,
    products,
    selectedCategory: category,
  });
  console.log("ipooooo", theCategory);
};

const filterProducts = async (req, res) => {
  try {
    const category = req.query.category;
    const selectedType = req.query.filterType;
    const sortOption = req.query.sortoption; 

    let products;

    const filterConditions = {
      category: category,
      status: true,
    };

    if (selectedType && selectedType !== "All") {
      filterConditions.type = selectedType;
    }

    // Sort the products based on the sorting option
    if (sortOption === "-1") {
      products = await productModel
        .find(filterConditions)
        .sort({ price: -1 })
        .exec();
    } else if (sortOption === "1") {
      products = await productModel
        .find(filterConditions)
        .sort({ price: 1 })
        .exec();
    } else {
      products = await productModel.find(filterConditions).exec();
    }

    const categories = await categoryModel.find();
    const ctCategory = categories.find(
      (cat) => cat._id.toString() === category
    );
    const categoryName = ctCategory ? ctCategory.name : null;
    const theCategory = await categoryModel.find({ _id: category });

    res.render("users/shop", {
      selectedType,
      theCategory,
      categoryName,
      categories,
      products,
      selectedCategory: category,
      sorting: getSortingLabel(sortOption), // Pass the sorting label to the view
    });

    console.log("ipooooo", theCategory);
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

function getSortingLabel(sortOption) {
  if (sortOption === "-1") {
    return "Price: High To Low";
  } else if (sortOption === "1") {
    return "Price: Low To High";
  } else {
    return "Default Sorting"; // Add more labels based on your sorting options
  }
}
const sortProducts = async (req, res) => {
  try {
    const sortOption = req.query.sortPro;

    const selectedType = req.query.type;
    const category = req.query.category;

    let productse;

    if (selectedType == "All") {
      productse = await productModel
        .find({ $and: [{ category: category }, { status: true }] })
        .sort({ price: sortOption })
        .exec();
    } else {
      productse = await productModel
        .find({
          $and: [
            { category: category },
            { type: selectedType },
            { status: true },
          ],
        })
        .sort({ price: sortOption })
        .exec();
    }
    let sorting;
    if (sortOption == "-1") {
      sorting = "Price: High To Low";
    } else if (sortOption == "1") {
      sorting = "Price: Low To High";
    }
    console.log("ererererer", productse);
    const categories = await categoryModel.find();
    const ctCategory = categories.find(
      (cat) => cat._id.toString() === category
    );
    const categoryName = ctCategory ? ctCategory.name : null;
    const theCategory = await categoryModel.find({ _id: category });
    res.render("users/shop", {
      selectedType,
      theCategory,
      categoryName,
      categories,
      products: productse,
      sortoption: sortOption,
      selectedCategory: category,
      sorting,
    });
    console.log("ipooooo", theCategory);
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const singleproduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findOne({ _id: id }).populate({
      path: "userRatings.userId",
      select: "firstname",
    });
    const type = product.type;

    const convertedId = new ObjectId(id);

    const result = await productModel.aggregate([
      {
        $match: { _id: convertedId },
      },
      {
        $unwind: { path: "$userRatings", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$userRatings.rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    const totalRatings = result.length > 0 ? result[0].totalRatings : 0;

    console.log("hey there", result);

    console.log(averageRating, totalRatings);

    const similar = await productModel
      .find({ type: type, _id: { $ne: id } })
      .limit(4);
    console.log("similar", similar);
    const categories = await categoryModel.find();
    product.images = product.images.map((image) => image.replace(/\\/g, "/"));
    console.log("Image Path:", product.images[0]);
    res.render("users/singleproduct", {
      categories,
      product: product,
      similar,
      averageRating,
      totalRatings,
    });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const profile = async (req, res) => {
  try {
    const user = await usersModel.findOne({ _id: req.session.userId });
    if (req.session.isAuth&&user && user.status == false) {
      const userId = req.session.userId;
      const categories = await categoryModel.find();
      const user = await usersModel.findOne({ _id: userId });
      const name = user.firstname;
      res.render("users/profile", { categories, name });
    } else {
      req.session.forgetpressed = true;
      req.session.signupPressed = true;

      res.render("users/login", {
        logInfo:req.session.logInfo,expressFlash: {
          emailpasserror: req.flash("emailpasserror"),
          blockerror: req.flash("blockerror"),
        },
      });
    }
    req.session.logInfo=null
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const logout = async (req, res) => {
  try {
    req.session.userId = null;
    req.session.isAuth = false;
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const signup = async (req, res) => {
  res.render("users/signup", {
   userInfo:req.session.userInfo, expressFlash: {
      emailerror: req.flash("emailerror"),
      emailerrorinvalid: req.flash("emailerrorinvalid"),
      nameerror: req.flash("nameerror"),
      lnameerror: req.flash("lnameerror"),
      phoneExist: req.flash("phoneexists"),
      phoneerror: req.flash("phoneerror"),
      passworderror: req.flash("passworderror"),
      cpassworderror: req.flash("cpasswowrderror"),
    },
  });
    req.session.userInfo=null
};

const sendmail = async (email, otp) => {
  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: Email,
        pass: pass,
      },
    });

    var mailOptions = {
      from: "Furnify <thefurnify@gmail.com>",
      to: email,
      subject: "E-Mail Verification",
      text: "Your OTP is:" + otp,
    };

    transporter.sendMail(mailOptions);
    console.log("E-mail sent sucessfully");
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const generateotp = () => {
  const otp = otpgenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
    digits: true,
  });
  console.log("Generated OTP:", otp);
  return otp;
};

const signupotp = async (req, res) => {
  try {
    console.log("its comming");
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const cpassword = req.body.confirm_password;
    let referralCode;
    if (req.body.referralCode) {
      referralCode = req.body.referralCode;
    }
    req.session.userInfo=req.body
    req.session.email = req.body.email;

    const isfnameValid = nameValid(firstname);
    const islnameValid = lnameValid(lastname);
    const isEmailValid = emailValid(email);
    const isPhoneValid = phoneValid(phone);
    const ispasswordValid = passwordValid(password);
    const iscpasswordValid = confirmpasswordValid(cpassword, password);

    const emailExist = await usersModel.findOne({ email: email });
    const phoneExist = await usersModel.findOne({ mobileNumber: phone });
    if (emailExist) {
      console.log("1");

      req.flash("emailerror", "Email Already Exists");

      res.redirect("/signup");
    } else if (!isEmailValid) {
      console.log("2");
      req.flash("emailerrorinvalid", "Enter a valid Email");
      res.redirect("/signup");
    } else if (!isfnameValid) {
      console.log("3");

      req.flash("nameerror", "Enter a valid Name");

      res.redirect("/signup");
    } else if (!islnameValid) {
      console.log("4");
      req.flash("lnameerror", "Enter a valid Name");
      res.redirect("/signup");
    } else if (phoneExist) {
      console.log("5");
      req.flash("phoneexists", "phone number Already Exists");
      res.redirect("/signup");
    } else if (!isPhoneValid) {
      console.log("6");
      req.flash("phoneerror", "Enter a valid Phone number");
      res.redirect("/signup");
    } else if (!ispasswordValid) {
      console.log("7");
      req.flash(
        "passworderror",
        "Password should contain one uppercase,one lowercase,one number,one special charecter"
      );
      res.redirect("/signup");
    } else if (!iscpasswordValid) {
      console.log("8");
      req.flash(
        "cpassworderror",
        "Password and Confirm password should be match"
      );
      res.redirect("/signup");
    } else {
      req.session.userInfo=null
      const hashedpassword = await bcrypt.hash(password, 10);
      const user = new usersModel({
        firstname: firstname,
        lastname: lastname,
        email: email,
        mobileNumber: phone,
        password: hashedpassword,
      });
      if (referralCode) {
        req.session.referralCode = referralCode;
      }
      req.session.user = user;
      req.session.signup = true;
      req.session.forgot = false;

      const otp = generateotp();
      console.log(otp);
      const currentTimestamp = Date.now();
      const expiryTimestamp = currentTimestamp + 30 * 1000;
      const filter = { email: email };
      const update = {
        $set: {
          email: email,
          otp: otp,
          expiry: new Date(expiryTimestamp),
        },
      };

      const options = { upsert: true };

      await otpModel.updateOne(filter, update, options);

      await sendmail(email, otp);
      req.session.otppressed = true;
      res.redirect("/otp");
    }
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const otp = async (req, res) => {
  try {
    const otp = await userotp.findOne({ email: req.session.email });
    res.render("users/otp", {
      expressFlash: {
        otperror: req.flash("otperror"),
      },
      otp: otp,
    });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const verifyotp = async (req, res) => {
  try {
    const enteredotp = req.body.otp;

    const user = req.session.user;

    console.log(enteredotp);

    console.log(req.session.user);
    const email = req.session.user.email;
    const userdb = await otpModel.findOne({ email: email });
    const otp = userdb.otp;
    const expiry = userdb.expiry;
    console.log(otp);
    if (enteredotp == otp && expiry.getTime() >= Date.now()) {
      user.isVerified = true;
      try {
        if (req.session.signup) {
          await usersModel.create(user);

          const userdata = await usersModel.findOne({ email: email });
          req.session.userId = userdata._id;
          req.session.isAuth = true;
          req.session.admin=false;
          req.session.otppressed = false;
          const referral = req.session.referralCode;
          console.log("referal", referral);
          const winner = await walletModel.findOne({ userId: referral });
          console.log("winner", winner);
          if (winner) {
            const updatedWallet = winner.wallet + 50;

            await walletModel.findOneAndUpdate(
              { userId: referral },
              { $set: { wallet: updatedWallet } },
              { new: true }
            );

            const transaction = {
              date: new Date(),
              type: "Credited",
              amount: 50,
            };

            await walletModel.findOneAndUpdate(
              { userId: referral },
              { $push: { walletTransactions: transaction } },
              { new: true }
            );

            console.log("Added 50 to the user's wallet.");
          } else {
            console.log("User not found with the provided referral code.");
          }

          req.session.otppressed = false;
          req.session.forgetpressed = false;
          res.redirect("/");
        } else if (req.session.forgot) {
          req.session.newpasspressed = true;
          req.session.otppressed = false;
          req.session.forgetpressed = false;
          res.redirect("/newpassword");
        }
      } catch (err) {
        console.log(err);
        res.render("users/serverError");
      }
    } else {
      req.flash("otperror", "Wrong OTP or Timer Expired");
      res.redirect("/otp");
    }
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const resendotp = async (req, res) => {
  try {
    const email = req.session.user.email;
    const otp = generateotp();
    console.log(otp);

    const currentTimestamp = Date.now();
    const expiryTimestamp = currentTimestamp + 60 * 1000;
    await otpModel.updateOne(
      { email: email },
      { otp: otp, expiry: new Date(expiryTimestamp) }
    );

    await sendmail(email, otp);
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const loginaction = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await usersModel.findOne({ email: email });

    req.session.logInfo=req.body

    if (!user) {
      req.flash("emailpasserror", "Invalid Email or Password");
      return res.redirect("/profile");
    }

    passwordmatch = await bcrypt.compare(req.body.password, user.password);

    if (passwordmatch && !user.status) {
      req.session.userId = user._id;
      req.session.firstname = user.firstname;
      req.session.isAuth = true;
      req.session.admin=false;
      req.session.logInfo=null;
      res.redirect("/");
    } else if (user.status) {
      req.flash("blockerror", "SORRY! Your Account has been suspended !!!");
      res.redirect("/profile");
    } else {
      req.flash("emailpasserror", "Invalid Email or Password");
      res.redirect("/profile");
    }
    
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const forgotpassword = async (req, res) => {
  try {
    res.render("users/forgotpass.ejs", {
      expressFlash: {
        emaile: req.flash("emaile"),
      },
    });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const forgotpasspost = async (req, res) => {
  try {
    const email = req.body.email;
    const emailexist = await usersModel.findOne({ email: email });
    console.log(emailexist);
    if (emailexist) {
      req.session.forgot = true;
      req.session.signup = false;
      req.session.user = { email: email };
      const otp = generateotp();
      console.log(otp);
      const currentTimestamp = Date.now();
      const expiryTimestamp = currentTimestamp + 60 * 1000;
      const filter = { email: email };
      const update = {
        $set: {
          email: email,
          otp: otp,
          expiry: new Date(expiryTimestamp),
        },
      };

      const options = { upsert: true };

      await otpModel.updateOne(filter, update, options);

      await sendmail(email, otp);

      req.session.otppressed = true;
      res.redirect("/otp");
    } else {
      req.flash("emaile", "Invalid Exist !!");
      res.redirect("/forgotpassword");
    }
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const new_password = async (req, res) => {
  try {
    res.render("users/newpassword.ejs", {
      expressFlash: {
        perror: req.flash("perror"),
        cperror: req.flash("cperror"),
      },
    });
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const reset_password = async (req, res) => {
  try {
    const password = req.body.newPassword;
    const cpassword = req.body.confirmPassword;

    const ispasswordValid = passwordValid(password);
    const iscpasswordValid = confirmpasswordValid(cpassword, password);

    if (!ispasswordValid) {
      req.flash(
        "perror",
        "Password should contain one uppercase,one lowercase,one number,one special charecter"
      );
      res.redirect("/newpassword");
    } else if (!iscpasswordValid) {
      req.flash("cperror", "Password and Confirm password should match");
      res.redirect("/newpassword");
    } else {
      const hashedpassword = await bcrypt.hash(password, 10);
      const email = req.session.user.email;
      await usersModel.updateOne(
        { email: email },
        { password: hashedpassword }
      );
      req.session.newpasspressed = false;
      res.redirect("/profile");
    }
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

const searchProducts = async (req, res) => {
  try {
    const searchProduct = req.body.searchProducts;

    const data = await categoryModel.findOne({
      name: { $regex: new RegExp(`^${searchProduct}`, "i") },
    });

    const productdata = await productModel.findOne({
      name: { $regex: new RegExp(`^${searchProduct}`, "i") },
    });

    const result = await categoryModel.aggregate([
      {
        $match: {
          types: {
            $elemMatch: {
              $regex: new RegExp(`^${searchProduct}`, "i"),
            },
          },
        },
      },
      {
        $unwind: "$types",
      },
      {
        $match: {
          types: {
            $regex: new RegExp(`^${searchProduct}`, "i"),
          },
        },
      },
      {
        $project: {
          _id: 0,
          categoryName: "$name", // Add other fields as needed
          matchingType: "$types",
        },
      },
    ]);
    console.log("nskbvbnsc ", result);

    if (data) {
      const categoryId = data._id;
      return res.redirect(`/shop?category=${categoryId}`);
    } else if (result.length !== 0) {
      const categoryData = result[0].matchingType;
      const foundCategory = await categoryModel.findOne({
        types: {
          $in: [categoryData],
        },
      });

      res.redirect(
        `/filterProducts?category=${foundCategory._id}&filterType=${categoryData}`
      );
    } else if (productdata) {
      const productId = productdata._id;
      return res.redirect(`/singleproduct/${productId}`);
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    res.render("users/serverError");
  }
};

module.exports = {
  home,
  shop,
  profile,
  signup,
  generateotp,
  signupotp,
  otp,
  verifyotp,
  loginaction,
  resendotp,
  forgotpassword,
  forgotpasspost,
  new_password,
  reset_password,
  singleproduct,
  logout,
  searchProducts,
  filterProducts,
  sortProducts,
};
