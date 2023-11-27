const bcrypt=require("bcrypt")
const usersModel=require("../model/user_model")
const categoryModel=require("../model/category_model")





const login = async (req,res) => {
    try {
        res.render('admin/admin_login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
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
    catch{
      
        console.log("gettt");
        res.render("admin/admin_login",{emailerror:"Invalid-email"})

    }
}

const adminpanel=async(req,res)=>{
    try{
        res.render("admin/admin_panel")
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const userslist=async(req,res)=>{
    try{
        const user=await usersModel.find({})
        console.log(user);
        res.render("admin/users_list",{users:user})
        
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
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
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const searchUser=async(req,res)=>{
    try{
        const searchName= req.body.search
        const data = await usersModel.find({
            username: { $regex: new RegExp(`^${searchName}`, 'i') }
          });
          
        req.session.searchUser=data
        res.redirect('/admin/searchview')
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}

const searchview=async(req,res)=>{
    try {
        const user = req.session.searchUser
        res.render('admin/users_list',{users:user})
      }
    catch(err){
      console.log(err);
      res.send("Error Occured")
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
    catch(err){
      console.log(err);
      res.send("Error Occured")
    }

}

const category=async(req,res)=>{
    try{
        const category=await categoryModel.find({})
        res.render("admin/categories",{cat:category})
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }
}
const newcat=async(req,res)=>{
    try{
        
        res.render("admin/addcategories")
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
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
    catch(err){
        console.log(err);
        res.send("Error Occured")
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
            res.send("Error Occured")
        }
    }


const updatecat=async(req,res)=>{
    try{
        const id=req.params.id
        const cat=await categoryModel.findOne({_id:id})
        res.render('admin/updatecat',{itemcat:cat})
    }
    catch(err){
        console.log(err);
        res.send("Error Occured")
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
    catch(err){
        console.log(err);
        res.send("Error Occured")
    }

}


module.exports={login,adminloginpost,adminpanel,userslist,userupdate,searchUser,searchview,filter,category,
newcat,addcategory,updatecat,updatecategory,unlistcat}