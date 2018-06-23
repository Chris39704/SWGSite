const { Player } = require('../models/player');
const { mongoose } = require('../../db/mongoose');

class validation {
    isRealString(str) { return typeof str === 'string' && str.trim().length > 0; }
    nameExists(username) {
        console.log(username);
        this.findOne({ username }).then(function (player) {
            if (!player) { console.log('Good News! No Player!'); return Promise.resolve(); } else { console.log('Aww! Player Exists!'); return Promise.reject(); }
        })
    }
}

module.exports = { validation };
