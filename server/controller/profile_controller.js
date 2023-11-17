const categoryModel=require('../model/category_model')
const userModel=require('../model/user_model')




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
                    mobilenumber: mob
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








module.exports={userdetails,profileEdit,profileUpdate}