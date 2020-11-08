const mongoose = require('mongoose');

// Step 1: Add the Passport plugin
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    maxlength: 10,
    required: true
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return this.emailConfirmation === v
      },
      message: props => `${props.value} doesn't match the email confirmation`
    }
  }, 
  userType: {
    type: String,
    enum: ['normal', 'pro', 'proPlus', 'super'],
    required: true,
    default: 'normal'
  },
  userPaymentID: {
    type: String,
    required: false
  },
  userTokenPaymentID: {
    type: String,
    required: false
  },
  userPaymentTime: {
    type: Date,
    required: false
  },
  userPayerID: {
    type: String,
    required: false
  },
  successfulTrades: {
    type: Number,
    required: true,
    default: 0
  },
  unSuccessfulTrades: {
    type: Number,
    required: true,
    default: 0
  },
  myTrades: {
    type: Array,
    required: false,
  }
},{
    timestamps: true,
    getters: true
});

// Virtuals
UserSchema.virtual('emailConfirmation')
.get(function () {
  return this._emailConfirmation;
})
.set(function (value) {
  this._emailConfirmation = value;
});

UserSchema.virtual('password')
.get(function () {
  return this._password;
})
.set(function (value) {
  this._password = value;
});

UserSchema.virtual('passwordConfirmation')
.get(function () {
  return this._passwordConfirmation;
})
.set(function (value) {
  if (this.password !== value) this.invalidate('password', 'Password and password confirmation must match');
  this._passwordConfirmation = value;
});


//Virtuals for account permission levels:
UserSchema.virtual('userAccountType')
.get(function () {  
  return this.userType;
})
.set(function (value) {
  this.userType = value;
});

UserSchema.virtual('totalTrades')
.get(function () {  
  return this.successfulTrades + this.unSuccessfulTrades;
})


// Step 2: Create a virtual attribute that returns the fullname of the user
UserSchema.virtual('fullName')
.get(function (){
  return `${this.firstName} ${this.lastName}`
});

UserSchema.virtual('shortName').get(function (){
  const fullname = this.firstName + this.lastName;

  return fullname.replace(/(<([^>]+)>)/ig, "").substring(0, 20);
});

UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'email'
});



module.exports = mongoose.model('User', UserSchema);