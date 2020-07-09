// INSTRUCTIONS:
/*
  Create a new resource controller that uses the
  User as an associative collection (examples):
  - User -> Books
  - User -> Reservation

  The resource controller must contain the 7 resource actions:
  - index
  - show
  - new
  - create
  - edit
  - update
  - delete
*/

const viewPath = ('trades');

const Trade = require('../models/Trade');
const User = require('../models/User');

//this is our player data
const fs = require('fs'); 
const csv = require('csv-parse');

const playerData = fs.createReadStream('./assets/players/players.csv')
.pipe(csv())
.on('data', function(data){
    try {
        //console.log(data);
        //console.log(data[10]);
    }
    catch(error) {
        console.log(error);
    }
})
.on('end',function(){
}); 





exports.index = async (req, res) => {
  try {
    const trades = await Trade.find().populate('user').sort({updatedAt: 'desc'});
    res.render(`${viewPath}/index`, {
      pageTitle: 'Active Trades',
      trades: trades
      // myTrades: false
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying the trades: ${error}`);
    res.redirect('/');
  }
};

exports.show = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id).populate('user');

    const user = await User.findById(req.user);

    res.render(`${viewPath}/show`, {
      pageTitle: trade.title,
      trade: trade,
      user: user
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying this trade: ${error}`);
    res.redirect('/');
  }
};


exports.new = (req, res) => {
  res.render(`${viewPath}/new`, {
    pageTitle: 'New Trade',
    cardTypes:  ['Awards', 'Drafts', 'TOTS', 'TOTW', 'SCP', 'MSP', 'Base']
  });
};


exports.create = async (req, res) => {
  try {
    const {user : email} = req.session.passport;
    const user = await User.findOne({email : email});
    const trade = await Trade.create({user: user._id, ...req.body});
    req.flash('success', 'Trade Posted Successfully!');
    res.redirect(`/trades/${trade.id}`);
  } catch (error) {
    req.flash('danger', `There was an error creating this trade: ${error}`);
    res.redirect('/trades/new');
  };
};

exports.edit = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    res.render(`${viewPath}/edit`, {
      pageTitle: trade.title,
      formData: trade
    });
  } catch (error) {
    req.flash('danger', `There was an error accessing this trade: ${error}`);
    res.redirect('/');
  }
}

exports.update = async (req, res) => {
  try {
    const {user : email} = req.session.passport;
    const user = await User.findOne({email : email});
    let trade = await Trade.findById(req.body.id);
    
    if(!trade) throw new Error('Trade could not be found');

    const attributes = {user : user._id, ...req.body};
    await Trade.validate(attributes);    
    await Trade.findByIdAndUpdate(req.body.id, req.body);
    //await Trade.updateOne({_id: req.body.id}, req.body);

    req.flash('success', 'Trade was successfully updated!');
    res.redirect(`/trades/${req.body.id}`);

  } catch (error) {
    req.flash('danger', `There was an error updating this trade: ${error}`);
    res.redirect(`/trades/${req.body.id}/edit`);
  }
}

exports.delete = async (req, res) => {
  try {
    await Trade.deleteOne({_id: req.body.id});
    req.flash('success', 'This Trade was deleted!');
    res.redirect('/trades');
  } catch (error) {
    req.flash('danger', `There was an error deleting this trade: ${error}`);
    res.redirect('/trades');
  }
}

//this will add comments to the trade id...
exports.comment = async (req, res) => {
  try {
   // console.log(req.body);
    //fix the form of msg and add the user to it before inputing it in the db...
    const message = String(`${req.body.user}: ${req.body.comment}`);
    //console.log(message);

  await Trade.findByIdAndUpdate({_id: req.body.id}, {$push: { "tradeComments": message } });

   req.flash('success', 'Trade comment has been posted!');
   res.redirect(`/trades/${req.body.id}`);
  } catch (error) {
    console.log(error);
  }
}
