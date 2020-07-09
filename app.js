console.clear();

/*
  Step 1: Create a new express app
*/
const express = require('express');
const app = express();

//getting env vars...
require('dotenv').config();



/*
  Step 2: Setup Mongoose (using environment variables)
*/
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI, {
    auth: {
        user: process.env.DB_USER,
        password: process.env.DB_PASS
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).catch(err => console.error(`Error: ${err}`));



/*
  Step 3: Setup and configure Passport
*/
const passport = require('passport');
const session = require('express-session');
app.use(session({
    secret: 'any salty secret here',
    resave: true,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
const User = require('./models/User');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/*
  Step 4: Setup the asset pipeline, path, the static paths,
  the views directory, and the view engine
*/
require('dotenv').config();
const path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/*
  Step 5: Setup the body parser
*/
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));


/*
  Step 6: Setup our flash helper, default locals, and local helpers (like formData and authorized)
*/
const flash = require('connect-flash');
app.use(flash());

app.use('/', (req, res, next) => {
    //setting the default local vars
    //this will effect every page...
    res.locals.pageTitle = "Untitled";

    //this will take all the flash msgs and store them in a local var
    res.locals.flash = req.flash();

    //if we have form data we will see it, if not nothing
    res.locals.formData = req.session.formData || {};
    //we need to clear the formdata after refresh of page
    req.session.formData = {};

    //authentication helper
    res.locals.authorized = req.isAuthenticated();
    if(res.locals.authorized){
        res.locals.email = req.session.passport.user;
    }


    //this will jump to the next middleware now
    next();
});


/*
  Step 7: Register our route composer
*/
const routes = require('./routes.js');
app.use('/', routes);
//use registers our middleware
app.use('/css', express.static('assets/css'));
app.use('/js', express.static('assets/js'));
app.use('/images', express.static('assets/images'));


/*
  Step 8: Start the server
*/
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port 3000`));