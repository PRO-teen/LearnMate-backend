const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');



dotenv.config();
require('./config/passport')(passport);

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(session({
  secret: process.env.SESSION_SECRET, // Replace with a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'none',  // Required for cross-site cookies
    secure: true       // true if using HTTPS (which Render does)
  }
}));

app.use(passport.initialize());
app.use(passport.session());
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);




mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: process.env.CLIENT_URL,
  })
);

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect(process.env.CLIENT_URL);
  });
});
app.get('/api/current_user', (req, res) => {
  if (req.user) {  // Assuming req.user is set after successful Google OAuth login
    res.send(req.user);  // Send user data (including profile, name, email, etc.)
  } else {
    res.send(null);  // No user logged in
  }
});






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
