const productModel=require('../model/product_model')
const userModel=require('../model/user_model')


const ratePage=async(req,res)=>{
    try{
        const{id,rating,review}=req.query
        const userId=req.session.userId

       
            
            
            const productId = id;
            
            
            const product = await productModel.findById(productId);
          
            if (!product) {
              return res.status(404).send('Product not found');
            }
          
            
            const existingUserRating = product.userRatings.find((userRating) => userRating.userId.toString() === userId);

            if (existingUserRating) {
                existingUserRating.rating = rating;
                existingUserRating.review = review;
            } else {
                product.userRatings.push({ userId, rating, review });
            }
            
            await product.save();
          
            res.redirect("/orderHistory");
          
          

        

        }
    catch(err){
        console.log(err);
        res.send("cant get ratepage")
    }
}


module.exports={
    ratePage
}