const User = require('../models/User');
const passport = require('passport');
const viewPath = 'sessions';
const request = require('request');

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

  //this is server side auth for the captcha
  const captcha = req.body['g-recaptcha-response'];
  if(!captcha){
    req.flash("error", "Please select captcha");
    return res.redirect("/login");
  }
 
  // Verify URL
  var verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${res.locals.reCaptchaKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;


  //api call to google for auth
  request(verifyURL, (err, response, body) => {

    
    // if not successful
    if(body.success !== undefined && !body.success || body.success === false){
      req.flash("error", "Captcha Failed!");
      return res.redirect("/login");
    }

  

  passport.authenticate('local', {
    successRedirect: '/trades/home',
    successFlash: 'You were successfully logged in!',
    failureRedirect: '/login',
    failureFlash: 'Invalid Login!'
  })(req, res);

});
};

// Step 2: Log the user out
exports.delete = async (req, res) => {
  req.logout();
  req.flash('success', 'You were logged out successfully');
  res.redirect('/');
};