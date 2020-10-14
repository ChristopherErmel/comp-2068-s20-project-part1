const mongoose = require('mongoose');
const { db } = require('./User');

const PlayerInfoSchema = new mongoose.Schema({

    cardID: {
        type: Number,
        required: true
    },
    playerName: {
        type: String,
        required: true
    },
    card: {
        type: String,
        required: true
    },
    postition: {
        type: String,
        required: true
    },
    playerType: {
        type: String,
        required: true
    },
    handedness: {
        type: String,
        required: true
    },
    synergies: {
        type: String,
        required: true
    },
    overall: {
        type: String,
        required: true
    },
    averageOverAll: {
        type: String,
        required: true
    },
    deking: {
        type: String,
        required: true
    },
    handEye: {
        type: String,
        required: true
    },
    passing: {
        type: String,
        required: true
    },
    puckControl: {
        type: String,
        required: true
    },
    slapShotAccuracy: {
        type: String,
        required: true
    },
    slapShotPower: {
        type: String,
        required: true
    },
    wristShotAccuracy: {
        type: String,
        required: true
    },
    wristShotPower: {
        type: String,
        required: true
    },
    acceleration: {
        type: String,
        required: true
    },
    agility: {
        type: String,
        required: true
    },
    balance: {
        type: String,
        required: true
    },
    endurance: {
        type: String,
        required: true
    },
    speed: {
        type: String,
        required: true
    },
    discipline: {
        type: String,
        required: true
    },
    offensiveAwareness: {
        type: String,
        required: true
    },
    defensiveAwareness: {
        type: String,
        required: true
    },
    faceOffs: {
        type: String,
        required: true
    },
    shotBlocking: {
        type: String,
        required: true
    },
    stickChecking: {
        type: String,
        required: true
    },
    aggression: {
        type: String,
        required: true
    },
    bodyChecking: {
        type: String,
        required: true
    },
    durability: {
        type: String,
        required: true
    },
    fightingSkill: {
        type: String,
        required: true
    },
    strength: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});


PlayerInfoSchema.virtual.findCard = function (id) {
    return("hit")    
    // db.collection.find({_id : id})
  };


module.exports = mongoose.model('PlayerInfo', PlayerInfoSchema);