const User = require('../models/User');
const passport = require('passport');
const viewPath = 'sessions';

exports.new = async (req, res) => {
   //for usertype tracking
  let user = "undefined";
   if(typeof req.user != "undefined"){
    user = await User.findById(req.user);
  }
  res.render(`${viewPath}/login`, {
    pageTitle: 'Login',  
    user: user
  });
};

// Step 1: Create an action that will authenticate the user using Passport
exports.create = async (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/trades/home',
    successFlash: 'You were successfully logged in!',
    failureRedirect: '/login',
    failureFlash: 'Invalid Login!'
  })(req, res);
};

// Step 2: Log the user out
exports.delete = async (req, res) => {
  req.logout();
  req.flash('success', 'You were logged out successfully');
  res.redirect('/');
};