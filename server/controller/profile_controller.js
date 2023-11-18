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
        res.render('users/newAddress',{categories})
    }
    catch(err){
        res.status(500).send('error occured')
        console.log(err);
    }
}

const addressUpdate = async (req, res) => {
    try {
        const { fullname,adname,street,pincode,city,state,country,phone } = req.body;
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
                // req.flash('address', 'This Address already existed');
                return res.redirect('/addAddress');
            }

            existingUser.address.push({
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
            return res.redirect('/userdetails');
        }
        const newAddress = await userModel.create({
            userId: userId,
            address: {
                fullname: fullname,
                adname:adname,
                street: street,
                pincode: pincode,
                city: city,
                state:state,
                country:country,
                phonenumber:phone
               
            },
        });
        res.redirect('/userdetails');
    } catch (err) {
        res.status(500).send('Error occurred');
        console.log(err);
    }
};











module.exports={userdetails,profileEdit,profileUpdate,newAddress,addressUpdate}