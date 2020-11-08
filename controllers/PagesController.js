const viewPath = 'pages';
const User = require('../models/User');

exports.home = async (req, res) => {
  //for usertype tracking  
  let user = "undefined";
  // console.log(typeof req.user);
  if(req.user !== 'undefined'){
    user = await User.findById(req.user);
  }
  res.render(`${viewPath}/home`, {
    pageTitle: 'Home',  
    user: user
  });
};