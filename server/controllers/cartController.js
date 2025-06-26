import User from "../models/user.js";


export const updateCart = async (req, res) => {
  try {
    const userId = req.user.id;  // Auth middleware se id le raha hu
    const { cartItems } = req.body;

    await User.findByIdAndUpdate(userId, { cartItems });
    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
