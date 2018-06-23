require('./server/config/config');

// 3rd Party Modules
require('dotenv').config();
const express = require('express');
// const socketIO = require('socket.io');
const http = require('http');
// const https = require('https');
const path = require('path');
var fs = require('fs');
const bodyParser = require('body-parser');

const port = process.env.PORT;
const host = process.env.ENV_HOST;

const app = express();
const server = http.createServer(app);
// const { Status } = require('./server/app/status');
// const io = socketIO(server);
// const status = new Status();

app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', express.static(__dirname + '/client'));

app.use(function (req, res, next) {
    // res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url.substr(req.url.length - 5) == '.html') {
        return null;
    }
    res.setHeader('Content-Type', 'application/json');
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});



require('./server/routes/routes')(app);

// TODO:
/* io.on('connection', (socket) => {
    socket.on('webLogin', (params, callback) => {
        const formattedTime = moment().format('h:mm a');
        status.removePlayer(socket.id);
        status.addPlayer(socket.id, params.username, params.Galaxy);
        io.to(params.Galaxy).emit('updateUserList', status.getPlayerList(params.Galaxy));

        // console.log(socket.handshake.address);
        console.log(`${params.username} ${socket.handshake.address} Connected: ${formattedTime}`);
        console.log(status.getPlayerList(params.Galaxy));
        // do this from SWG in C++ socket.emit('newLogin', LoginRequest(socket.handshake.address, params.name));
        return callback();
    });

    socket.on('disconnect', () => {
        const player = status.getPlayer(socket.id);
        const formattedTime = moment().format('h:mm a');
        status.removePlayer(socket.id);
        console.log(`${player.username} ${socket.handshake.address} Disconnected: ${formattedTime}`);
        console.log(status.getPlayerList(player.Galaxy));
    });
});
TODO:
*/


// ---------------------------------------------------------------

// last render functionality to allow refreshing...

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/client/index.html'));

});

server.listen(port, host, () => {
    console.log(`Web Server Listening on ${host}:${port}`);
});

module.exports = { app };
