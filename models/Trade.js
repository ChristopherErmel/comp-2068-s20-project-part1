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
  title: {
    type: String,
    required: true
  },
  trade: {
    type: String,
    required: true
  },
  buyNow: {
    type: Number,
    required: false,
    default: 0
  },
  tradeStatus: {
    type: String,
    enum: ['Traded', 'Available'],
    default: 'Available'
  }, 
  tradeType: {
    type: String,
    enum: ['Trading For', 'Trading'],
    default: 'Trading'
  }
}, {
  timestamps: true
});

TradeSchema.query.tradingFor = function () {
  return this.where({
    tradeType: 'Trading For'
  });
};
TradeSchema.query.Trading = function () {
  return this.where({
    tradeType: 'Trading'
  });
};
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

//module.exports = mongoose.model('Trade', TradeSchema);

module.exports = mongoose.models.Trade || mongoose.model('Trades', TradeSchema);