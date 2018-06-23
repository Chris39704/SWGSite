require('../../server');
const { mongoose } = require('../../db/mongoose');
const { Todo } = require('../../server/models/todo');
const { Player } = require('../../server/models/player');
const { authenticate } = require('../../server/middleware/authenticate');
// const { isRealString } = require('../../server/middleware/validation');
const { mySQLDB } = require('../../db/database');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
// const moment = require('moment');



//Comment Start Code
module.exports = function (app) {

    // TODO:
    app.post('/todos', authenticate, async (req, res) => {
        try {
            const todo = await new Todo({
                text: req.body.text,
                _creator: req.player._id,
            });

            todo.save().then((doc) => {
                res.send(doc);
            }, (e) => {
                res.status(400).send(e);
            });
        } catch (e) {
            throw new Error('Invalid Todo.');
        }
    });

    app.get('/todos', authenticate, async (req, res) => {
        try {
            const todos = await Todo.find({
                _creator: req.player._id,
            });
            return res.send({ todos });
        } catch (e) {
            return res.status(400).send(e);
        }
    });

    app.get('/todos/:id', authenticate, async (req, res) => {
        const { id } = req.params;

        if (!ObjectID.isValid(id)) {
            return res.status(404).send();
        }

        try {
            const todo = await Todo.findOne({
                _id: id,
                _creator: req.player._id,
            });
            if (!todo) {
                return res.status(404).send();
            }

            return res.send({ todo });
        } catch (e) {
            return res.status(400).send();
        }
    });


    app.delete('/todos/:id', authenticate, async (req, res) => {
        const { id } = req.params;

        if (!ObjectID.isValid(id)) {
            return res.status(404).send();
        }

        try {
            const todo = await Todo.findOneAndRemove({
                _id: id,
                _creator: req.player._id,
            });
            if (!todo) {
                return res.status(404).send();
            }

            return res.send({ todo });
        } catch (e) {
            return res.status(400).send();
        }
    });

    app.patch('/todos/:id', authenticate, async (req, res) => {
        const { id } = req.params;
        const body = _.pick(req.body, ['text', 'completed']);

        if (!ObjectID.isValid(id)) {
            return res.status(404).send();
        }

        if (_.isBoolean(body.completed) && body.completed) {
            body.completedAt = new Date().getTime();
        } else {
            body.completed = false;
            body.completedAt = null;
        }

        try {
            const todo = await Todo.findOneAndUpdate({ _id: id, _creator: req.player._id }, { $set: body }, { new: true });
            if (!todo) {
                return res.status(404).send();
            }
            return res.send({ todo });
        } catch (e) {
            return res.status(400).send();
        }
    });

    // POST /auth/players
    app.post('/auth/players', async (req, res) => {
        try {
            req.body.ip = (req.headers["X-Forwarded-For"] ||
                req.headers["x-forwarded-for"] ||
                '').split(',')[0] ||
                req.client.remoteAddress;
            req.body.username = req.body.username.toLowerCase();
            req.body.email = req.body.email.toLowerCase();
            const body = _.pick(req.body, ['username', 'email', 'password', 'ip']);
            const player = new Player(body);
            await player.save();
            res.status(200).send();
        } catch (e) {
            res.status(400).send(e);
        }
    }, function (error) {
        res.status(400).send(error);
    });

    app.get('/auth/players/me', authenticate, async (req, res) => {
        await res.send(req.player);
    });

    app.post('/auth/players/login', async (req, res) => {
        try {
            const body = _.pick(req.body, ['username', 'password']);
            const player = await Player.findByCredentials(body.username.toLowerCase(), body.password);
            if (player.tokens.length > 0) {
                player.tokens.pop();
            }
            const token = await player.generateAuthToken();
            res.header('x-auth', token).status(200).send(player);
        } catch (e) {
            res.status(400).send();
        }
    });

    app.delete('/auth/players/me/token', authenticate, async (req, res) => {
        try {
            await req.player.removeToken();
            res.status(200).send();
        } catch (e) {
            res.status(400).send();
        }
    });

}