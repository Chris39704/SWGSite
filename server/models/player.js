const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const { mySQLDB } = require('../../db/database');

const PlayerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        unique: true,
        validate: {
            validator: validator.isAlphanumeric,
            message: '{VALUE} is not a valid username',
        },
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email',
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    ip: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
    role: {
        type: String,
        default: 'user',
    },
    tokens: [{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        issued: {
            type: Date,
            required: true,
            default: Date.now,
        }
    }]
});

PlayerSchema.methods.toJSON = function () {
    const player = this;
    const playerObject = player.toObject();

    return _.pick(playerObject, ['_id', 'username', 'email', 'ip', 'created', 'role']);
};

PlayerSchema.methods.generateAuthToken = function () {
    const player = this;
    const access = 'auth';
    const ip = player.ip;
    const role = player.role;
    if (!player.tokens || player.tokens.length < 1) {
        const token = jwt.sign({ _id: player._id.toHexString(), access }, process.env.JWT_SECRET).toString();
        player.tokens.push({ access, token, ip, role });
        return player.save().then(() => { return token });
    }
};

PlayerSchema.methods.removeToken = function (token) {
    const player = this;

    return player.update({
        $pull: {
            tokens: { token },
        },
    });
};

PlayerSchema.statics.findByToken = function (token) {
    const Player = this;
    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject();
    }

    return Player.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

PlayerSchema.statics.findByCredentials = function (username, password) {
    const Player = this;
    return Player.findOne({ username }).then((player) => {
        if (!player) {
            console.log(`${username} Not Found`);
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and player.password
            bcrypt.compare(password, player.password, (err, res) => {
                if (res) {
                    resolve(player);
                } else {
                    reject();
                }
            });
        });
    });
};

PlayerSchema.pre('save', function (next) {
    const player = this;

    if (player.isModified('password')) {
        bcrypt.genSalt(15, (err, salt) => {
            bcrypt.hash(player.password, salt, (err, hash) => {
                player.password = hash;
                next();
            });
        });
        //  mySQLDB.createUser(player.username, player.password, player.email, player.ip);
    } else {
        next();
    }
});

const Player = mongoose.model('Player', PlayerSchema);

module.exports = { Player };
