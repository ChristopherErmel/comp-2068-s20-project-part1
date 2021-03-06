// INSTRUCTIONS
/*
  Create a new resource model that uses the User
  as an associative collection (examples):
  - User -> Books
  - User -> Reservation

  Your model must contain at least three attributes
  other than the associated user and the timestamps.

  Your model must have at least one helpful virtual
  or query function. For example, you could have a
  book's details output in an easy format: book.format()
*/

const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tradeStatus: {
    type: String,
    enum: ['Traded', 'Available', 'Canceled'],
    default: 'Available',
    required: true
  },
  tradeType: {
    type: String,
    enum: ['Looking For', 'On the Block'],
    default: 'On the Block',
    required: true
  },  
  tradeOffers: {
    type: Array,
    offers: [
      {
        id: { 
          type    : mongoose.Schema.Types.ObjectId,
          default : mongoose.Types.ObjectId,
          index   : { unique: true },
          required: true
        },
        tradeId: {
          type: String
        },
         offerUserName: { 
          type: String,
          required: true
        },
        offerUserID: {
          type: String,
          required: true
        },
        cardListO1: {
          type: String
        },
        cardListO2: {
          type: String
        },
        cardListO3: {
          type: String
        },
        cardListO4: {
          type: String
        },
        coinsOffer: {
          type: Number
        },
        tradeComments: {
          type: Array,
          default: 'Comments:',
          required: true
        }
        // ,
        // tradeStatus: {
        //   type: String,
        //   enum: ['Accepted', 'Declined', 'Neutral'],
        //   default: 'Neutral',
        //   required: true
        // }
      }
 ],
    required: true
  },


  
  buyNow: {
    type: Number,
    default: 0
  },
  cardId: {
    type: String,
    required: true
  },
  playerName: {
    type: String,
    required: true
  },
  playerCard: {
    type: String,
    required: true
  },
  playerOVR: {
    type: String,
    required: true
  },
  cardList1: {
    type: String
  },
  cardList2: {
    type: String
  },
  cardList3: {
    type: String
  },
  cardList4: {
    type: String
  },
  trades: {
    type: Array,
    default: 'Trades:',
    required: true
  },
  console: {
    type: String,
    enum: ['Xbox', 'PS'],
    required: true
  }
}, {
  timestamps: true
});

TradeSchema.virtual('addCardOnTheBlock').set(function (cardID) {
  try {
    this.cardIds.set('cardIds.onTheBlock', cardID);
    return "Card Added"
  } catch (e) {
    console.log(e);
  }
});

TradeSchema.query.onTheBlock = function () {
  return this.where({
    tradeType: 'On the Block'
  });
};
// TradeSchema.query.Trading = function () {
//   return this.where({
//     tradeType: 'Trading'
//   });
// };
TradeSchema.query.traded = function () {
  return this.where({
    tradeStatus: 'Traded'
  });
};
TradeSchema.query.available = function () {
  return this.where({
    tradeStatus: 'Available'
  });
};

TradeSchema.query.addTradeComments = function (comment) {
  if (typeof comment === 'string') {
    this.tradeComments.push(comment);
    return true;
  } else {
    return false;
  }

};

// TradeSchema.query.addCardId1 = function (id) {
//   if(typeof id === 'string'){
//     this.cardList.push(id);
//     return true;
//   }else{
//     return false;
//   }

// };

//module.exports = mongoose.model('Trade', TradeSchema);

module.exports = mongoose.models.Trade || mongoose.model('Trades', TradeSchema);