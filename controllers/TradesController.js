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
const PlayerInfo = require('../models/playerInfo');

//this is our player data
const fs = require('fs');
const csv = require('csv-parse');

const playerData = fs.createReadStream('./assets/players/players.csv')
  .pipe(csv())
  .on('data', function (data) {
    try {
      //console.log(data);
      //console.log(data[10]);
    }
    catch (error) {
      console.log(error);
    }
  })
  .on('end', function () {
  });




exports.home = async (req, res) => {
  try {
    const trades = await Trade.find().populate('user').sort({ updatedAt: 'desc' });
    res.render(`${viewPath}/home`, {
      pageTitle: 'Active Trades',
      trades: trades
      // myTrades: false
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying the trades: ${error}`);
    res.redirect('/');
  }
};


exports.index = async (req, res) => {
  try {
    const trades = await Trade.find().populate('user').sort({ createdAt: 'desc' });
    let cards = [];
    for (let trade of trades) {
      let card = await PlayerInfo.find({ "_id": trade.cardId });
      cards.push(card);
    }
    res.render(`${viewPath}/index`, {
      pageTitle: 'Active Trades',
      trades: trades,
      cards: cards
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying the trades: ${error}`);
    res.redirect('/');
  }
};

exports.myblock = async (req, res) => {
  try {
    const trades = await Trade.find().populate('user').sort({ createdAt: 'desc' });
    //finds the card id depending on the id from the trade.
    //  const card = await PlayerInfo.find({ "_id": trade.cardId });

    let cards = [];

    for (let trade of trades) {
      let card = await PlayerInfo.find({ "_id": trade.cardId });
      cards.push(card);
      // console.log(trade.cardId);
    }


    // console.log(cards);
    res.render(`${viewPath}/myblock`, {
      trades: trades,
      cards: cards
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying your block: ${error}`);
    res.redirect('/');
  }
};




exports.show = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id).populate('user');
    const user = await User.findById(req.user);
    //finds the card id depending on the id from the trade.
    const card = await PlayerInfo.find({ "_id": trade.cardId });
    //sets our lets
    let cardList1 = "";
    let cardList2 = "";
    let cardList3 = "";
    let cardList4 = "";
    //checks to see if card list is empty or not.
    if (trade.cardList1 != "") {
      cardList1 = await PlayerInfo.find({ "_id": trade.cardList1 });
    }
    if (trade.cardList2 != "") {
      cardList2 = await PlayerInfo.find({ "_id": trade.cardList2 });
    }
    if (trade.cardList3 != "") { cardList3 = await PlayerInfo.find({ "_id": trade.cardList3 }); }
    if (trade.cardList4 != "") { cardList4 = await PlayerInfo.find({ "_id": trade.cardList4 }); }



    //array of all cards needed for offers
    let cardOffers = new Object();
    //get all offers for this trade
    if(trade.tradeOffers.offers != ""){
      //take each offer
      let i = 0;
      for (let offer of trade.tradeOffers){
        //search and push the card to the cardOffers array
        //cardOffers["Cards" + i] = "";
        //this will send a list of cards1-* with the card information attached.
        if(offer.offers.cardListO1 != ""){
          cardOffers["CardsO1" + i] = await PlayerInfo.find({ "_id": offer.offers.cardListO1 });
        }        
        if(offer.offers.cardListO2 != ""){
          cardOffers["CardsO2" + i] = await PlayerInfo.find({ "_id": offer.offers.cardListO2 });
        }
        if(offer.offers.cardListO3 != ""){
          cardOffers["CardsO3" + i] = await PlayerInfo.find({ "_id": offer.offers.cardListO3 });
        }
        if(offer.offers.cardListO4 != ""){
          cardOffers["CardsO4" + i] = await PlayerInfo.find({ "_id": offer.offers.cardListO4 });
        }
        i++;
      }
    }
   // console.log(cardOffers);
    res.render(`${viewPath}/show`, {
      pageTitle: trade.title,
      trade: trade,
      user: user,
      card: card,
      cardOffers: cardOffers,
      cardList1: cardList1,
      cardList2: cardList2,
      cardList3: cardList3,
      cardList4: cardList4,
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying this trade: ${error}`);
    res.redirect('/');
  }
};


exports.new = async (req, res) => {
  res.render(`${viewPath}/new`, {
    pageTitle: 'New Trade Block'
  });
};


exports.create = async (req, res) => {
  try {
    console.log(`${JSON.stringify(req.body)}`);


    const { user: email } = req.session.passport;
    const user = await User.findOne({ email: email });
    const trade = await Trade.create({ user: user._id, ...req.body });
    req.flash('success', 'Trade Posted Successfully!');
    res.redirect(`/trades/${trade.id}`);
  } catch (error) {
    req.flash('danger', `There was an error creating this trade: ${error}`);
    res.redirect('/trades/new');
  };
};

exports.edit = async (req, res) => {
  try {
    const { user: email } = req.session.passport;
    const trade = await Trade.findById(req.params.id);
    const user = await User.findOne({ email: email });
    //checks to see if the user who made the trade is the one trying to edit it
    if (trade.user == user.id) {
      // await Trade.updateOne({ _id: trade.id}, {tradeStatus: "Traded"});
      await Trade.findByIdAndUpdate({ _id: trade.id }, { tradeStatus: "Traded" })
      req.flash('success', 'This Trade has been Completed!');
      res.redirect(`/trades/${trade.id}`);
    } else {
      throw new Error('You do not have permission to Complete that trade.');
    }


  } catch (error) {
    req.flash('danger', `There was an error accessing this trade: ${error}`);
    res.redirect('/');
  }
}

exports.update = async (req, res) => {
  try {
    const { user: email } = req.session.passport;
    const user = await User.findOne({ email: email });
    let trade = await Trade.findById(req.body.id);

    if (!trade) throw new Error('Trade could not be found');
    //checks to see if the user who made the trade is the one trying to edit it
    if (trade.user == user.id) {
      const attributes = { user: user._id, ...req.body };
      await Trade.validate(attributes);
      await Trade.findByIdAndUpdate(req.body.id, req.body);
    } else {
      throw new Error('You do not have permission to Edit this trade.');
    }

    req.flash('success', 'Trade was successfully updated!');
    res.redirect(`/trades/${req.body.id}`);

  } catch (error) {
    req.flash('danger', `There was an error updating this trade: ${error}`);
    res.redirect(`/trades/${req.body.id}/edit`);
  }
}

exports.delete = async (req, res) => {
  try {

    const { user: email } = req.session.passport;
    const trade = await Trade.findById(req.params.id);
    const user = await User.findOne({ email: email });
    //checks to see if the user who made the trade is the one trying to edit it
    //if(trade.user == user.id){
    await Trade.deleteOne({ _id: req.body.id });
    req.flash('success', 'This Trade was deleted!');
    res.redirect('/trades');
    // }else{
    // throw new Error('You do not have permission to Delete that trade.');
    // }    
  } catch (error) {
    req.flash('danger', `There was an error deleting this trade: ${error}`);
    res.redirect('/trades');
  }
}

//this will add comments to the trade id...
exports.comment = async (req, res) => {
  try {
     //console.log(req.body);
    //fix the form of msg and add the user to it before inputing it in the db...
    
    
    /*  const message = String(`${req.body.user}: ${req.body.comment}`);
    console.log(message);
   await Trade.findByIdAndUpdate({ _id: req.body.id }, { $push: { "tradeOffers": {
      offers: {
        "tradeComments": message } 
      }}});
*/
    await Trade.findByIdAndUpdate({ _id: req.body.id }, { $push: { "tradeOffers": {
      offers: {
        id: req.body.id,
        user: req.body.user,
        coinsOffer: req.body.coinsOffer,
        cardListO1: req.body.cardListO1,
        cardListO2: req.body.cardListO2,
        cardListO3: req.body.cardListO3,
        cardListO4: req.body.cardListO4,
        offerUserID: req.body.offerUserID,
        offerUserName: req.body.offerUserName,
        tradeId: req.body.tradeId,
        tradeOffers: ""
      }
    } } });



    req.flash('success', 'Trade comment has been posted!');
    res.redirect(`/trades/${req.body.id}`);
  } catch (error) {
    console.log(error);
  }
}

//this will add comments to the trade id...
exports.tradeComment = async (req, res) => {
  try {
    // console.log(req.body);
     //fix the form of msg and add the user to it before inputing it in the db...
     const message = String(`${req.body.user}: ${req.body.comment}`);
     //console.log(message);
 
 // await Trade.findByIdAndUpdate({_id: req.body.id}, {$push: { "tradeOffers": message } });
    let tradeNum = "tradeOffers." + `${req.body.tradeNumber}` + ".offers.tradeComments";
   // console.log(tradeNum);
  await Trade.findByIdAndUpdate({_id: req.body.id}, {$push: { [tradeNum] : message}})


  
//console.log(te);
    req.flash('success', 'Trade comment has been posted!');
    res.redirect(`/trades/${req.body.id}`);
   } catch (error) {
     console.log(error);
   }
}