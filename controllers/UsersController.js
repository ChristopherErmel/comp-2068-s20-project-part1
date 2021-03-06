const User = require('../models/User');
const request = require('request');
// Setting up paypal...
let paypal = require('paypal-rest-sdk');
const viewPath = 'users';

exports.new = async (req, res) => {
  //for usertype tracking
    let user = "undefined"
  if(typeof req.user != "undefined"){
    user = await User.findById(req.user);
  }
  res.render(`${viewPath}/new`, {
    pageTitle: 'New User',  
    user: user
  });
};

exports.create = async (req, res) => {
  // const userDetails = req.body;
  // req.session.flash = {};
  
  try {

 //this is server side auth for the captcha
 const captcha = req.body['g-recaptcha-response'];
 if(!captcha){
   req.flash("error", "Please select captcha");
   return res.redirect(`${viewPath}/new`);
 }

 // Verify URL
 var verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${res.locals.reCaptchaKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;


 //api call to google for auth
 request(verifyURL, (err, response, body) => {

   
   // if not successful
   if(body.success !== undefined && !body.success || body.success === false){
     req.flash("error", "Captcha Failed!");
     return res.redirect(`${viewPath}/new`);
   }

  });


    // Step 1: Create the new user and register them with Passport
    const user = new User(req.body);
    await User.register(user, req.body.password);

    req.flash('success', 'The user was successfully created');
    res.redirect(`/login`);

  } catch (error) {
    console.log(error);
    req.flash('danger', error.message);

    req.session.formData = req.body;
    res.redirect(`${viewPath}/new`);
  }
};





// configure paypal with the credentials you got when you created your paypal app
paypal.configure({
  'mode': 'sandbox', //sandbox or live 
  'client_id': 'AUuA5JtVF7yncRUIoKZqBOZ-CLO0nb0Gc1AIvevciO56z0K60QDrM1wpfxu-UQ285ESPyvlik2skboBJ', // please provide your client id here 
  'client_secret': 'EIGvJyMPMVnEpOF12w27qCxNUHB9TaQEBJ7sSWegVfAeKIGO13IX1Y2zi2vldIwjOpG8USwIgUsnUqfb' // provide your client secret here 
});

// set public directory to serve static html files 
//app.use('/', express.static(path.join(__dirname, 'public'))); 

// setting up pages, these will be moved later
// start payment process 
exports.upgradeProcess = async (req, res) => {
//app.get('/buy' , ( req , res ) => {

try {
  // create payment object 
  var payment = {
    "intent": "authorize",
"payer": {
"payment_method": "paypal"
},
"redirect_urls": {
"return_url": "http://localhost:3000/upgradeSuccess",
"cancel_url": "http://localhost:3000/upgradeError"
},
"transactions": [{
"amount": {
"total": 1.99,
"currency": "CAD"
},
"description": "Upgrade for NHLHUTTrader"
}]
};


// call the create Pay method 
createPay( payment ) 
.then( ( transaction ) => {
    var id = transaction.id; 
    var links = transaction.links;
    var counter = links.length; 
    while( counter -- ) {
        if ( links[counter].method == 'REDIRECT') {
  // redirect to paypal where user approves the transaction 
            return res.redirect( links[counter].href )
        }
    }
})
.catch( ( err ) => { 
    console.log( err ); 
    res.render(`${viewPath}/upgradeError`);
});
} catch (error) {
  console.log(error);
}	
}; 


//normal upgrade page.
exports.upgrade = async (req, res) => {
//app.get('/success' , (req ,res ) => {
  try {
    //for usertype tracking
    let user = "undefined"
  if(typeof req.user != "undefined"){
    user = await User.findById(req.user);
  }
    //console.log(req.query); 
    res.render(`${viewPath}/upgrade`, { 
      user: user
    }); 
  } catch (error) {
    console.log(error);
  }
    
};

// success page 
exports.upgradeSuccess = async (req, res) => {
//app.get('/success' , (req ,res ) => {
  try {
    //for usertype tracking
    let user = "undefined"
  if(typeof req.user != "undefined"){
    user = await User.findById(req.user);
  }

    //grabbing all payment information after successful payment and user who upgraded 
    let userID = req.user._id;
    let userPaymentID = req.query.paymentId;
    let userTokenPaymentID = req.query.token;
    let userPayerID = req.query.PayerID;
    let userPaymentTime = Date.now();
    //console.log(userID);
    //this will find the user who paid and then upgrade their status to pro and add the payment details to their model/account.
    User.findByIdAndUpdate({_id : userID}, {userType : "pro", userPaymentID : userPaymentID, userTokenPaymentID: userTokenPaymentID, userPayerID: userPayerID, userPaymentTime: userPaymentTime}, function(err, result){

      if(err){
        console.log(err)
      }
      else{
      //  console.log(result)
      }

  });

    //console.log(req.query);
    //console.log(req.user._id);

    //console.log(req.query);     
    res.render(`${viewPath}/upgradeSuccess`, {
      paymentDetails: req.query,
      user: user
    }); 
  } catch (error) {
    req.flash('danger', `There was an error upgrading your account: ${error}`);
    console.log(error);
  }
    
};


// error page 
exports.upgradeError = async (req, res) => {
  let user = "undefined"
  if(typeof req.user != "undefined"){
    user = await User.findById(req.user);
  }

//app.get('/err' , (req , res) => {
    //console.log(req.query); 
    res.render(`${viewPath}/upgradeError`, {
      user: user
    }); 
};




// helper functions for paypall payments...
var createPay = ( payment ) => {
  return new Promise( ( resolve , reject ) => {
      paypal.payment.create( payment , function( err , payment ) {
       if ( err ) {
           reject(err); 
       }
      else {
          resolve(payment); 
      }
      }); 
  });
}	