require('./server/config/config');

// 3rd Party Modules
const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');
const socketIO = require('socket.io');
const moment = require('moment');
const Discord = require('discord.js');
const http = require('http');
// const https = require('https');
const client = new Discord.Client();
const app = express();
const port = process.env.PORT;
const host = process.env.ENV_HOST;

// My Modules
const CONFIG = require('./config.json');
const { mongoose } = require('./db/mongoose');
const { Todo } = require('./server/models/todo');
const { Player } = require('./server/models/player');
const { authenticate } = require('./server/middleware/authenticate');
const { LoginRequest } = require('./server/app/loginRequest');
const { isRealString } = require('./server/middleware/validation');
const { Status } = require('./server/app/status');
const { mySQLDB } = require('./db/database');

const timediff = require('timediff');

const server = http.createServer(app);
const io = socketIO(server);
const status = new Status();


const dateFromUTSC = (utscTime) => {
    const d = new Date(0);
    d.setUTCSeconds(utscTime);
    return d;
};
const readableTimeDiff = (timeDiff) => {
    this.result = '';
    if (timeDiff.days > 0) this.result += `${timeDiff.days} days, `;
    if (timeDiff.hours > 0) this.result += `${timeDiff.hours} hours, `;
    if (timeDiff.minutes > 0) this.result += `${timeDiff.minutes} minutes, `;
    return `${this.result} ${timeDiff.seconds} seconds`;
};

app.use(bodyParser.json());
app.use(express.json());

const myPath = path.join(__dirname, '../client');
app.use(express.static(myPath));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const clusters = [];

io.on('connection', (socket) => {
    socket.on('webLogin', (params, callback) => {
        const formattedTime = moment().format('h:mm a');
        status.removePlayer(socket.id);
        status.addPlayer(socket.id, params.name, params.Galaxy);
        io.to(params.Galaxy).emit('updateUserList', status.getPlayerList(params.Galaxy));
        const player = status.getPlayer(socket.id);

        // console.log(socket.handshake.address);
        console.log(`${params.name} ${socket.handshake.address} Connected: ${formattedTime}`);
        // do this from SWG in C++ socket.emit('newLogin', LoginRequest(socket.handshake.address, params.name));
        return callback();
    });
});

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
        const body = _.pick(req.body, ['username', 'email', 'password', 'ip']);
        const player = new Player(body);
        await player.save();
        const token = await player.generateAuthToken();
        res.header('x-auth', token).send(player);
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get('/auth/players/me', authenticate, async (req, res) => {
    await res.send(req.player);
});

app.post('/auth/players/login', async (req, res) => {
    try {
        const body = _.pick(req.body, ['username', 'password']);
        const player = await Player.findByCredentials(body.username, body.password);
        const token = await player.generateAuthToken();
        res.header('x-auth', token).send(player);
    } catch (e) {
        res.status(400).send();
    }
});

app.delete('/auth/players/me/token', authenticate, async (req, res) => {
    try {
        await req.player.removeToken(req.token);
        res.status(200).send();
    } catch (e) {
        res.status(400).send();
    }
});


app.post('/api/sendMetrics', (req, res) => {
    const metrics = req.body;
    const { clusterName } = metrics;

    let cluster = clusters[clusterName];
    if (cluster === undefined) {
        cluster = {};
        clusters[clusterName] = cluster;
        clusters[clusterName].clusterStartTime = Date.now();
        cluster.clusterUptime = {
            days: 0, hours: 0, minutes: 0, seconds: 0,
        };
    }
    cluster.clusterStatus = 'N/A';
    cluster.clusterLastLoad = {
        days: 0, hours: 0, minutes: 0, seconds: 0,
    };
    cluster.clusterPopulation = metrics.totalPlayerCount;
    cluster.clusterLastUpdate = Date.now();

    if (clusters[clusterName].clusterStartTime == null) {
        cluster.clusterStartTime = Date.now();
    }

    if (metrics.timeClusterWentIntoLoadingState > metrics.lastLoadingStateTime) {
        cluster.clusterStatus = 'Loading';
    } else if (metrics.lastLoadingStateTime > 0) {
        cluster.clusterStatus = 'Online';
        const lastLoadDate = dateFromUTSC(metrics.lastLoadingStateTime);
        cluster.clusterLastLoad = timediff(lastLoadDate, Date.now(), 'DHmS');
    } else {
        clusters[clusterName].clusterStatus = 'Offline';
        cluster.clusterStartTime = null;
        console.log('offline');
    }

    console.log(`${'New Metrics: \t' +
        'Cluster: '}${clusterName}, ` +
        `Status: ${cluster.clusterStatus}, ` +
        `Players: ${cluster.clusterPopulation}, ` +
        `Last Load: ${readableTimeDiff(cluster.clusterLastLoad)} ago, ` +
        `Uptime: ${readableTimeDiff(cluster.clusterUptime)}`);

    res.json('success');
});

// ---------------------------------------------------------------

if (CONFIG.discordBot) {
    // Status checker
    setInterval(() => {
        clusters.forEach((clusterName) => {
            const cluster = clusters[clusterName];
            // if we haven't received an update in twice as long as the interval, the server isn't responding
            if (Date.now() - cluster.clusterLastUpdate > (CONFIG.discordStatusInterval * 2 * 1000)) {
                cluster.clusterStatus = 'Offline';
                cluster.clusterLastLoad = {
                    days: 0, hours: 0, minutes: 0, seconds: 0,
                };
                cluster.clusterUptime = {
                    days: 0, hours: 0, minutes: 0, seconds: 0,
                };
                cluster.clusterPopulation = 0;
                cluster.clusterStartTime = null;
            } else {
                cluster.clusterUptime = timediff(cluster.clusterStartTime, Date.now(), 'DHmS');
            }
        });
    }, 5 * 1000);

    client.on('ready', () => {
        const channel = client.channels.find('name', CONFIG.discordBotChannelName);
        setInterval(() => {
            clusters.forEach((clusterName) => {
                const cluster = clusters[clusterName];
                channel.sendMessage(`**Cluster** ${clusterName} ` +
                    `**Status** ${cluster.clusterStatus} ` +
                    `**Players** ${cluster.clusterPopulation} ` +
                    `**Last Load** ${readableTimeDiff(cluster.clusterLastLoad)} ago` +
                    `**Uptime** ${readableTimeDiff(cluster.clusterUptime)} `);
            });
        }, CONFIG.discordStatusInterval * 1000);
    });


    client.login(CONFIG.discordBotToken);
}

// ---------------------------------------------------------------

if (CONFIG.restartServer) {
    const cp = require('child_process');

    setInterval(() => {
        const cluster = clusters[CONFIG.restartClusterName];
        if (cluster !== undefined) {
            if (cluster.clusterStatus === 'Offline') {
                console.log('[****] Restarting server!!!');
                cp.exec(CONFIG.restartCommand, { cwd: CONFIG.restartWorkingPath }, (error, stdout, stderr) => { });
                if (CONFIG.discordBot) {
                    const channel = client.channels.find('name', CONFIG.discordBotChannelName);
                    channel.sendMessage(`@here **Restarting cluster ${CONFIG.restartClusterName} due to detected offline status!**`);
                }
            }
        } else {
            console.log('[****] Starting server!!!');
            cp.exec(CONFIG.restartCommand, { cwd: CONFIG.restartWorkingPath }, (error, stdout, stderr) => { });
        }
    }, 60 * 1000);
}

// ---------------------------------------------------------------

server.listen(port, host, () => {
    console.log(`Web Server Listening on ${host}:${port}`);
});

module.exports = { app };
