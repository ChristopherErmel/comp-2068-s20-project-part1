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
app.use(bodyParser.urlencoded({ extended: true }));


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


  if (res.locals.authorized) {
    res.locals.email = req.session.passport.user;
    //if logged in
    //grabs the users type and adds it to the userAccountLevel global
    res.locals.userAccountLevel = req.user.userType;
  } else {
    //else just use n/a
    res.locals.userAccountLevel = "n/a";
  }


  //local db
  res.locals.db = mongoose.connection;

  //port
  res.locals.port = process.env.PORT || 3000;

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
app.use('/players', express.static('assets/players'));
app.use('/playersImages', express.static('assets/players/images'));
app.use('/playerCardImages', express.static('assets/playerCardImages'));



/* Setting up atlas search */
const { MongoClient, ObjectID } = require("mongodb");
const Cors = require("cors");

// cors origin URL - Allow inbound traffic from origin
// corsOptions = {
//   origin: "https://nhlhuttrader.herokuapp.com/",
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// };


app.use(Cors);
var client = new MongoClient(process.env.DB_SEARCH);
const server = express();
var collection;




/*
  Step 8: Start the server
*/
const port = process.env.PORT || 3000;
app.listen(port, async () => {
  try {
    console.log(`Listening on port 3000`)
    await client.connect();
    collection = client.db("project").collection("playerinfos");
  } catch (e) {
    console.log(e);
  }
});

//search index of player database...
app.get("/search", async (req, res) => {
  try {
    let result = await collection.aggregate([
      {
        "$search": {
          "index": "playerNames",
          "autocomplete": {
            "query": `${req.query.term}`,
            "path": "playerName",
            "fuzzy": {
              "maxEdits": 1
            }
          }
        }
      }
    ]).toArray();
    res.send(result)
  } catch (e) {
    console.log(e);
  }
});
