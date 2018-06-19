const { Player } = require('../models/player');

const authenticate = (req, res, next) => {
    const token = req.header('x-auth');

    Player.findByToken(token).then((player) => {
        if (!player) {
            return Promise.reject();
        }

        req.player = player;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send();
    });
};

module.exports = { authenticate };
