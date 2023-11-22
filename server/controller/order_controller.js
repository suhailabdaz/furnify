const orderModel=require("../model/order_model")

const orderPage=async (req,res)=>{
    try{
        const orders=await orderModel.find({}) 
    res.render("admin/orderPage",{orderdata:orders})
}
catch(err){
    console.log(err)
}
}

const updateOrderStatus=async(req,res)=>{
    try{
        console.log("cheringina")
        const { orderId, status } = req.body;

        // Update the order status in the database
        const updatedOrder = await orderModel.findOneAndUpdate(
            { _id: orderId },
            { $set: { status: status } },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Redirect to the order page or send a response as needed
        res.redirect('/admin/orderPage'); // Adjust the path based on your routes

    }
    catch(err){
        console.log(err);
    }
}


module.exports={
    orderPage,
    updateOrderStatus
}