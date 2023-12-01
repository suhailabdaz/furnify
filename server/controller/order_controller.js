const orderModel=require("../model/order_model")

const orderPage=async (req,res)=>{
    try{
        const orders=await orderModel.find({}).sort({ createdAt: -1 })
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
        
        const updatedOrder = await orderModel.findOneAndUpdate(
            { _id: orderId },
            { $set: { status: status ,updatedAt:Date.now()}},
            { new: true }
        );
      

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

    
        res.redirect('/admin/orderPage'); 

    }
    catch(err){
        console.log(err);
    }
}


module.exports={
    orderPage,
    updateOrderStatus
}