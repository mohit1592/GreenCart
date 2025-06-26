import Order from "../models/Order.js";
import Product from "../models/Product.js";

 

 // place order cod : /api/order/cod
 export const placeOrderCOD = async (req,res)=>{
  console.log("👉 req.user:", req.user);

    try{
        const { userId, items, address } = req.body;
        if(!address || items.length === 0 ){
            return res.json({success: false , message: "Invalid Data"})
        }
        //Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item)=>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        },0)

      // Add text Charge (2%)
      amount += Math.floor(amount * 0.02);
      
      await Order.create({
        userId,
        items,
        amount,
        address,
        paymentType: "COD"
      });
      return res.json({success: true, message: "Order Place Successfully"})

    } catch (error){
        return res.json({success: false, message: error.message});

    }
 }

 // get orders by user id  : /api/order/user 
 // get orders by user id  : /api/order/user 
export const getUserOrders = async (req, res) => {
  console.log("🧩 getUserOrders → req.user:", req.user);

  try {
    // ✅ Step 1: Check correct key
    if (!req.user || !req.user.id) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    const userId = req.user.id; // ✅ Step 2: Use id instead of _id
    console.log("✅ userId:", userId);

    // ✅ Step 3: Use userId in query
    const orders = await Order.find({
      userId: userId.toString(), // or just userId
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


 // Get All Order ( for seller / admin ) : /api/order/seller
 export const getAllOrders = async (req,res) =>{
  try {
    const orders = await Order.find({
      $or:[{paymentType: "COD"}, {isPaid: true}]
    }).populate("items.product address").sort({createdAt: -1});
    res.json({success: true, orders});
  } catch (error) {
    res.json({success: false, message: error.message});
    
  }
}