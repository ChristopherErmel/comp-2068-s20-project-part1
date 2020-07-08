const User = require('../models/User');
const viewPath = 'users';

exports.new = (req, res) => {
  res.render(`${viewPath}/new`, {
    pageTitle: 'New User'
  });
};

exports.create = async (req, res) => {
  const userDetails = req.body;
  req.session.flash = {};
  
  try {
    // Step 1: Create the new user and register them with Passport

    req.flash('success', 'The user was successfully created');
    res.redirect(`/login`);
  } catch (error) {
    console.log('Errors');
    req.flash('danger', error.message);

    req.session.formData = req.body;
    res.redirect(`${viewPath}/new`);
  }
};