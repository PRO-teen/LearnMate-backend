const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  name: String,
  role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
  photo: String,
  purchasedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course', // Assuming you're using the 'Course' model for course details
  }],

});

module.exports = mongoose.model('User', userSchema);
