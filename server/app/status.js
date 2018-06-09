class Status {
    constructor() {
        this.players = [];
        this.galaxies = [];
    }
    addPlayer(id, username, galaxy) {
        const namesArray = this.players.map(player => player.username);
        while ((namesArray.indexOf(username) > -1) && (this.galaxies.indexOf(galaxy) > -1)) {
            username.concat(' #', namesArray.indexOf(username) + 1);
        }
        const player = { id, username, galaxy };
        this.players.push(player);
        this.galaxies.push(galaxy);
        return player;
    }
    removePlayer(id) {
        const player = this.getPlayer(id);

        if (player) {
            this.players = this.players.filter(player => player.id !== id);
        }
        return player;
    }
    getPlayer(id) {
        return this.players.filter(player => player.id === id)[0];
    }
    getPlayerList(galaxy) {
        const players = this.players.filter(player => player.galaxy === galaxy);
        const namesArray = players.map(player => player.username);
        return namesArray;
    }
}

module.exports = { Status };
