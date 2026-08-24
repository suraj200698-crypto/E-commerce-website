import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RZP_TEST_KEY,
  key_secret: process.env.RZP_TEST_SECRET,
});

export default razorpay;