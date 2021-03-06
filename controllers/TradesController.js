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
const mongoose = require('mongoose');

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
    //for usertype tracking
    let user = "undefined";
    let userOffersAmount = 0;
    if (typeof req.user != "undefined") {
      user = await User.findById(req.user);

      // numberOfTrades = user.myTrades.length;
      
    //amount of offers
    userOffersAmount = user.myOffers.length;
    }
    const trades = await Trade.find().populate('user').sort({ updatedAt: 'desc' });
    res.render(`${viewPath}/home`, {
      pageTitle: 'Active Trades',
      trades: trades,
      user: user,
      userOffersAmount
      //numberOfTrades
      // myTrades: false
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying the trades: ${error}`);
    res.redirect('/');
  }
};


exports.index = async (req, res) => {
  try {


    //for usertype tracking
    let user = "undefined"
    if (typeof req.user != "undefined") {
      user = await User.findById(req.user);
    }













    //page and limit 
    let perPage = 8;
    let page = req.params.page || 1;





    // execute query with page and limit values
    const trades = await Trade.find().populate('user').sort({ createdAt: 'desc' }).skip((perPage * page) - perPage).limit(perPage).exec();

    // get total documents in the Posts collection 
    const count = await Trade.countDocuments();



    // const trades = await Trade.find().populate('user').sort({ createdAt: 'desc' });
    let cards = [];
    for (let trade of trades) {
      let card = await PlayerInfo.find({ "_id": trade.cardId });
      cards.push(card);
    }
    res.render(`${viewPath}/index`, {
      pageTitle: 'Active Trades',
      trades: trades,
      cards: cards,
      user: user,
      current: page,
      pages: Math.ceil(count / perPage)
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying the trades: ${error}`);
    res.redirect('/');
  }
};

exports.indexXbox = async (req, res) => {
  try {
    //for user type tracking
    let user = "undefined"
    if (typeof req.user != "undefined") {
      user = await User.findById(req.user);
    }


    //page and limit 
    let perPage = 8;
    let page = req.params.page || 1;

    const trades = await Trade.find({ console: 'Xbox' }).populate('user').sort({ createdAt: 'desc' }).skip((perPage * page) - perPage).limit(perPage);


    // get total documents in the Posts collection 
    const count = await Trade.find({ console: 'Xbox' }).countDocuments();


    let cards = [];
    for (let trade of trades) {
      let card = await PlayerInfo.find({ "_id": trade.cardId });
      cards.push(card);
    }
    res.render(`${viewPath}/indexXbox`, {
      pageTitle: 'Active Trades',
      trades: trades,
      cards: cards,
      user: user,
      current: page,
      pages: Math.ceil(count / perPage)
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying the trades: ${error}`);
    res.redirect('/');
  }
};

exports.indexPS = async (req, res) => {
  try {
    //for usertype tracking    
    let user = "undefined"
    if (typeof req.user != "undefined") {
      user = await User.findById(req.user);
    }

    //page and limit 
    let perPage = 8;
    let page = req.params.page || 1;


    const trades = await Trade.find({ console: 'PS' }).populate('user').sort({ createdAt: 'desc' }).skip((perPage * page) - perPage).limit(perPage);

    // get total documents in the Posts collection 
    const count = await Trade.find({ console: 'PS' }).countDocuments();


    let cards = [];
    for (let trade of trades) {
      let card = await PlayerInfo.find({ "_id": trade.cardId });
      cards.push(card);
    }
    res.render(`${viewPath}/indexPS`, {
      pageTitle: 'Active Trades',
      trades: trades,
      cards: cards,
      user: user,
      current: page,
      pages: Math.ceil(count / perPage)
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying the trades: ${error}`);
    res.redirect('/');
  }
};

exports.myblock = async (req, res) => {
  try {

    //for usertype tracking    
    let user = "undefined"
    if (typeof req.user != "undefined") {
      user = await User.findById(req.user);
    }

    //const trades = await Trade.find().populate('user').sort({ createdAt: 'desc' });
    //finds the card id depending on the id from the trade.
    //  const card = await PlayerInfo.find({ "_id": trade.cardId });

    let trades = [];

    //console.log(trades);

    for (let trade of req.user.myTrades) {
      let myTrade = await Trade.find({ _id: trade.tradeId });
      trades.push(myTrade);
      // console.log(trade.cardId);
    }


    //finds the card id depending on the id from the trade.
    let cards = [];
    //if(myOffers.length > 1) {
    //console.log(myOffers.length)
    for (let trade of trades) {
      //console.log(typeof offer[0].cardId !== 'undefined')
      //console.log(offer[0].cardId);
      //check to see if there are any active trades...
      if (typeof trade[0] !== 'undefined') {
        let card = await PlayerInfo.find({ "_id": trade[0].cardId });
        cards.push(card);
        // console.log(trade.cardId);
      }
    }


    // console.log(cards);
    res.render(`${viewPath}/myblock`, {
      trades: trades,
      cards: cards,
      user: user
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying your block: ${error}`);
    res.redirect('/');
  }
};

exports.myoffers = async (req, res) => {
  try {

    //for usertype tracking
    let user = "undefined"
    if (typeof req.user != "undefined") {
      user = await User.findById(req.user);
    }

    // const trades = await Trade.find().populate('user').sort({ createdAt: 'desc' });


    let myOffers = [];

    //this will find each offer of the specific user and send it to the view. This will inclued dups...
    for (let offer of req.user.myOffers) {
      let myOffer = await Trade.find({ _id: offer.tradeId });
      myOffers.push(myOffer);

      //console.log("offer")
      //console.log(offer)
    }


    //this will return an array of tradeIds with no duplicites
    //this will only show the uniq offers from myOffers...
    //.reverse() to switch the order of the offers. The most recent will appear first now...
    myOffers = myOffers.filter((v, i, a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i).reverse();

    // if(cards[i][0].playerName  !== 'undefined') { 
    //console.log(typeof  offer[0].cardId !== 'undefined')




    //finds the card id depending on the id from the trade.
    let cards = [];
    //if(myOffers.length > 1) {
    //console.log(myOffers.length)
    for (let offer of myOffers) {
      //console.log(typeof offer[0].cardId !== 'undefined')
      //console.log(offer[0].cardId);
      //check to see if there are any active trades...
      if (typeof offer[0] !== 'undefined') {
        let card = await PlayerInfo.find({ "_id": offer[0].cardId });
        cards.push(card);
        // console.log(trade.cardId);
      }
    }
    // }
    //console.log(myOffers);
    res.render(`${viewPath}/myoffers`, {
      cards: cards,
      myOffers: myOffers,
      user: user
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
    if (trade.tradeOffers != "") {
      //take each offer
      let i = 0;
      for (let offer of trade.tradeOffers) {
        //search and push the card to the cardOffers array
        //cardOffers["Cards" + i] = "";
        //console.log(offer.offers.cardListO1);
        // console.log(offer);
        //this will send a list of cards1-* with the card information attached.
        if (offer.cardListO1 != "") {
          cardOffers["CardsO1" + i] = await PlayerInfo.find({ "_id": offer.cardListO1 });
        }
        if (offer.cardListO2 != "") {
          cardOffers["CardsO2" + i] = await PlayerInfo.find({ "_id": offer.cardListO2 });
        }
        if (offer.cardListO3 != "") {
          cardOffers["CardsO3" + i] = await PlayerInfo.find({ "_id": offer.cardListO3 });
        }
        if (offer.cardListO4 != "") {
          cardOffers["CardsO4" + i] = await PlayerInfo.find({ "_id": offer.cardListO4 });
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
  //for usertype tracking
  let user = "undefined"
  if (typeof req.user != "undefined") {
    user = await User.findById(req.user);
  }
  res.render(`${viewPath}/new`, {
    pageTitle: 'New Trade Block',
    user: user
  });
};


exports.create = async (req, res) => {
  try {
    //  console.log(`${JSON.stringify(req.user._id)}`);  
    const { user: email } = req.session.passport;
    
    const user = await User.findOne({ email: email });


    if (typeof req.user.cardsOnBlock != "undefined") {
      //checks to make sure they are under the card amount.
      if (req.user.userType === "pro" || req.user.userType === "super") {

        if (req.user.cardsOnBlock >= 18) {
          req.flash('danger', 'You have reached your limit!(12) Card not posted.');
          res.redirect(`/trades/home`);
        } else {

         
          
    const trade = await Trade.create({ user: user._id, ...req.body });
          //this will find the user and add to their trade amount.
          // console.log(req.user.cardsOnBlock);
          let userID = req.user._id;
          let numCards = req.user.cardsOnBlock + 1;
          User.findByIdAndUpdate({ _id: userID }, { cardsOnBlock: numCards }, function (err, result) { });
          // console.log(req.user.cardsOnBlock);
          req.flash('success', 'Trade Posted Successfully!');
          res.redirect(`/trades/${trade.id}`);

          //this will add the trade link to the users array for their trades/offers
          //if the offering user is the one making the trade offer, add the id to the link.
          await User.findByIdAndUpdate({ _id: userID }, {
            $push: {
              "myTrades": {
                tradeId: trade.id,
                //adding the trade time.date in here so when views on myOffers page we can view by date...
                tradeDate: Date.now()
              }
            }
          });

          // console.log(trade.id);
          // console.log(req.body.trade._id);

        }
      }
      if (req.user.userType === "normal") {
        if (req.user.cardsOnBlock >= 5) {
          req.flash('danger', 'You have reached your limit!(5) Card not posted.');
          res.redirect(`/trades/home`);
        } else {
          
    const trade = await Trade.create({ user: user._id, ...req.body });
          //this will find the user and add to their trade amount.
          // console.log(req.user.cardsOnBlock);
          let userID = req.user._id;
          let numCards = req.user.cardsOnBlock + 1;
          User.findByIdAndUpdate({ _id: userID }, { cardsOnBlock: numCards }, function (err, result) { });
          // console.log(req.user.cardsOnBlock);

//this will add the trade link to the users array for their trades/offers
          //if the offering user is the one making the trade offer, add the id to the link.
          await User.findByIdAndUpdate({ _id: userID }, {
            $push: {
              "myTrades": {
                tradeId: trade.id,
                //adding the trade time.date in here so when views on myOffers page we can view by date...
                tradeDate: Date.now()
              }
            }
          });



          req.flash('success', 'Trade Posted Successfully!');
          res.redirect(`/trades/${trade.id}`);


        }
      }

      req.flash('success', 'Trade Posted Successfully!');
      res.redirect(`/trades/${trade.id}`);


    }



  } catch (error) {
    req.flash('danger', `There was an error creating this trade: ${error}`);
    res.redirect('/trades/home');
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

    //this will find the user and add to their trade amount.    
    if (typeof req.user.cardsOnBlock != "undefined") {
      // console.log(req.user.cardsOnBlock);
      let userID = req.user._id;
      let numCards = req.user.cardsOnBlock - 1;
      //no '-' numbers 
      if (numCards < 0) { numCards = 0; }
      User.findByIdAndUpdate({ _id: userID }, { cardsOnBlock: numCards }, function (err, result) { });
      // console.log(req.user.cardsOnBlock);
    }





    // logic for removing from users myOffers, and current users myTrades...
    // myTrades Logic for removal.
    // This will search the specific user in their "myTrades" and remove 
    // their offer if they match the deleted trade id.
    await User.updateOne({_id: req.user._id}, {
          "$pull": {
            "myTrades": {
              "tradeId": req.body.id
            }
          }
        });
      
        // myOffers Logic for removal.
        // This will search all users in their "myOffers" and remove 
        // their offer if they match the deleted trade id.
        await User.updateMany({}, {
          "$pull": {
            "myOffers": {
              "tradeId": req.body.id
            }
          }
        });


    //checks to see if the user who made the trade is the one trying to edit it
    //if(trade.user == user.id){
    await Trade.deleteOne({ _id: req.body.id });
    req.flash('success', 'This Trade was deleted!');
    res.redirect('/trades/home');
    // }else{
    // throw new Error('You do not have permission to Delete that trade.');
    // }    
  } catch (error) {
    req.flash('danger', `There was an error deleting this trade: ${error}`);
    res.redirect('/trades/home');
  }
}

//this will add an offer to the trade id...
exports.comment = async (req, res) => {
  try {


    if (req.user.userType === "pro" || req.user.userType === "super") {
      //this will check to make sure the user is not over the limit of trade offers able to be made.
      if (req.user.myOffers.length >= 8) {
        throw "You have reached the trade offer limit of 8!";
      }
    }
    if (req.user.userType === "normal") {
      //this will check to make sure the user is not over the limit of trade offers able to be made.
      if (req.user.myOffers.length >= 3) {
        throw "You have reached the trade offer limit of 3!";
      }
    }



    //If the coins offer is nothing, or if any card option is not a card... throw
    //I choose 10 as the min length because no card option will be below 10, 
    // and most people wont type 10 random letters into the search box and then send an offer...
    if (req.body.coinsOffer === "" && req.body.cardListO1.length < 10 && req.body.cardListO2.length < 10 && req.body.cardListO3.length < 10 && req.body.cardListO4.length < 10) {
      throw "Invalid Card or Coin Offer";
    } else {
      //this will add the trade to the db under tradeOffers for the specific trade...
      await Trade.findByIdAndUpdate({ _id: req.body.id }, {
        $push: {
          "tradeOffers": {

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
        }
      });

      //console.log(req.body.offerUserID);
      //this will add the trade link to the users array for their trades/offers
      //if the offering user is the one making the trade offer, add the id to the link.
      await User.findByIdAndUpdate({ _id: req.body.offerUserID.toString().trim() }, {
        $push: {
          "myOffers": {
            tradeId: req.body.id,
            tradeOfferId: req.body.tradeId,
            //adding the trade time.date in here so when views on myOffers page we can view by date...
            tradeDate: Date.now()
          }
        }
      });

          

    }

    req.flash('success', 'Trade offer has been posted!');
    res.redirect(`/trades/${req.body.id}`);
  } catch (error) {
    req.flash('error', `Trade offer error: ${error}`);
    res.redirect(`/trades/${req.body.id}`);
  }
}




























exports.deleteMyOffer = async (req, res) => {
  try {

    // console.log("tradeOfferId:");
    // console.log(req.body.tradeOfferId);
    // console.log("trade:");
    // console.log(req.body.trade);
    // console.log("tradeId:");
    // console.log(req.body.tradeId);
    // console.log("User:");
    // ObjectId = require('mongodb').ObjectID;
    // console.log(req.body.userId.toString().trim());

    // const { user: email } = req.session.passport;
    const trade = await Trade.findById(req.body.tradeId);
    const user = await User.findById(req.body.userId.toString().trim());
  //  console.log(typeof user.offersMade);
    //this will find the user and remove the offer count   
    // if (typeof user.offersMade != "undefined") {
    //   // console.log(req.user.cardsOnBlock);
    //  // let userID = req.body.userId.toString().trim();
    //   let numCards = user.offersMade - 1;
    //   //no '-' numbers 
    //   if (numCards < 0) { numCards = 0; }
    //   User.findByIdAndUpdate({ _id: req.body.userId.toString().trim() }, { offersMade: numCards }, function (err, result) { });
    //   // console.log(req.user.cardsOnBlock);
    // }
    //  console.log("hit");


// console.log(req.body.userId);
// console.log(req.body.tradeOfferId);
// console.log(req.body.tradeId);

  //this will find the user and removed the offer based on the offerid
    await User.updateOne({_id: req.body.userId.toString().trim()}, {
          "$pull": {
            "myOffers": {
              "tradeOfferId": req.body.tradeOfferId
            }
          }
        });

        await Trade.updateOne({_id: req.body.tradeId}, {
          "$pull": {
            "tradeOffers": {
              "tradeId": req.body.tradeOfferId
            }
          }
        });
         console.log("hit");



    
    req.flash('success', 'Your offer was deleted!');
     res.redirect(`/trades/${req.body.tradeId}`);
    // }else{
    // throw new Error('You do not have permission to Delete that trade.');
    // }    
  } catch (error) {
    req.flash('danger', `There was an error deleting this offer: ${error}`);
    res.redirect(`/trades/${req.body.tradeId}`);
  }
}













































//this will add comments to the trade id...
exports.tradeComment = async (req, res) => {
  try {
    //fix the form of msg and add the user to it before inputing it in the db...
    const message = String(`${req.body.user}: ${req.body.comment}`);

    //this will find the correct db, and the right trade based on trade id.
    //it will add the comment to the array of comments based on the trade id.
    await Trade.update(
      { "_id": req.body.id, "tradeOffers.tradeId": req.body.tradeId },
      {
        "$push":
        {
          "tradeOffers.$.tradeComments": message
        }
      }
    );



    //console.log(te);
    req.flash('success', 'Trade comment has been posted!');
    res.redirect(`/trades/${req.body.id}`);
  } catch (error) {
    console.log(error);
  }
}





//this will show the results of the trades with the specific name and card name and ovr
exports.xboxSearchResults = async (req, res) => {
  try {
    //for usertype tracking
    if (typeof req.user != "undefined") {
      user = await User.findById(req.user);
    }

    // console.log(req.body.pageNum);

    // //req.locals.page_number = req.body.pageNum;
    // page_number = req.body.pageNum;
    // //adding pagnation
    // // Calculate number of documents to skip
    // let page_size = 2;
    // let page_num = page_number;
    // let skips = page_size * (page_num - 1);


    //.skip(skips).limit(page_size)
    const trades = await Trade.find({ console: 'Xbox', playerName: req.body.playerName, playerCard: req.body.playerCard, playerOVR: req.body.playerOVR }).populate('user').sort({ createdAt: 'desc' });

    //console.log(trades);

    let cards = [];
    for (let trade of trades) {
      let card = await PlayerInfo.find({ "_id": trade.cardId });
      cards.push(card);
    }
    res.render(`${viewPath}/xboxSearchResults`, {
      pageTitle: 'Active Trades',
      trades: trades,
      cards: cards,
      user: user,
      page_number: page_number
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying the trades: ${error}`);
    res.redirect('/');
  }
}

//this will show the results of the trades with the specific name and card name and ovr
exports.psSearchResults = async (req, res) => {
  try {

    //for usertype tracking
    if (typeof req.user != "undefined") {
      user = await User.findById(req.user);
    }

    const trades = await Trade.find({ console: 'PS', playerName: req.body.playerName, playerCard: req.body.playerCard, playerOVR: req.body.playerOVR }).populate('user').sort({ createdAt: 'desc' });

    //console.log(trades);

    let cards = [];
    for (let trade of trades) {
      let card = await PlayerInfo.find({ "_id": trade.cardId });
      cards.push(card);
    }
    res.render(`${viewPath}/psSearchResults`, {
      pageTitle: 'Active Trades',
      trades: trades,
      cards: cards,
      user: user
    });
  } catch (error) {
    req.flash('danger', `There was an error displaying the trades: ${error}`);
    res.redirect('/');
  }
}


//this will show the results of the trades with the specific name and card name and ovr
exports.modeChange = async (req, res) => {
  try {
    //grab all info
    ObjectId = require('mongodb').ObjectID;
    let mode = req.body.modeChange.toString();
    let id = ObjectId(req.user._id.toString().trim());

    //set the users view mode.
    await User.update(
      { _id: id }, { "viewMode": mode }
    );

    //redirect to the page again for a new load of styles...
    res.redirect(`${viewPath}/home`);

  } catch (error) {
    req.flash('danger', `There was an error updateing your view mode: ${error}`);
    res.redirect('/');
  }
}







// Might come back to this later...
exports.deleteOffer = async (req, res) => {


  try {
    //   await Trade.update(
    //     { _id: req.body.id },
    //     { $pull: { $elemMatch: { product: "xyz", score: { $gte: 8 } } } }
    //       { 'tradeOffers':  {'offers' : {'tradeId' : req.body.offerTradeId}} },
    //     (error, success) => {
    //       if (error) console.log(error);
    //       console.log(success);
    //     }
    //  );

    //   var previous2days = ["2016-09-21","2016-09-20"]
    //   var query = { "$or" : [] }
    //   for(var key in previous2days) {
    //     var q = {}
    //     q["impressions."+previous2days[key]] = { "$exists" : true }
    //     query.$or.push(q)
    // }


    // await Trade.find(function() {
    //   var tradeOffers = this.tradeOffers;
    //   return Object.keys(tradeOffers).some(function(rel) {
    //   return tradeOffers[rel].tradeId == req.body.offerTradeId;
    // });
    // });


    // await Trade.find({$where: function() {
    //   for(var key in this.tradeOffers) {
    //     if (this.tradeOffers[key].offers.tradeId == req.body.offerTradeId) return true;
    //   }
    //   return false;
    // }})


    // console.log(req.body);
    //console.log(await Trade.find({ _id: req.body.id}));


    req.flash('success', 'Trade offer has been removed!');
    res.redirect(`/trades/${req.body.id}`);
  } catch (e) {
    console.log(e)
  }
}





// Functions/Scripts

//this will remove copys from an array in the fastest way possible...
function uniq_fast(a) {
  var seen = {};
  var out = [];
  var len = a.length;
  var j = 0;
  for (var i = 0; i < len; i++) {
    var item = a[i];
    if (seen[item] !== 1) {
      seen[item] = 1;
      out[j++] = item;
    }
  }
  return out;
}