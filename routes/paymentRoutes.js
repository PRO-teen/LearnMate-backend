// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const User = require('../models/User');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Create Razorpay order
router.post('/orders', async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: "receipt#1",
    });

    res.status(200).json(order);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Order creation failed" });
  }
});

// Verify payment and update user
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // Ensure user is logged in
    if (!req.user) return res.status(401).json({ success: false, message: "User not logged in" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Save course
    if (!user.purchasedCourses.includes(courseId)) {
      user.purchasedCourses.push(courseId);
      await user.save();
    }

    res.json({ success: true, message: "Payment verified and course added" });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
