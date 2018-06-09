const mysql = require('mysql');

const con = mysql.createConnection({
    host: process.env.SQLDB_HOST,
    database: process.env.SQLDB_NAME,
    user: process.env.SQLDB_USER,
    password: process.env.SQLDB_PASS,
});
class mySQLDB {
    constructor() {
        this.user = '';
    }
    getUser(username, callback) {
        this.user = '';
        const sql = `SELECT * FROM user_account WHERE username = ${mysql.escape(username)}`;
        con.query(sql, (err, result) => {
            if (err == null) {
                const user = (result.length >= 1 ? result[0] : null);
                callback(err, user);
            } else {
                console.log(err);
            }
        });
    }
    createUser(username, password, email, ip, callback) {
        const user = {
            username, password_hash: password, password_salt: process.env.SQLPW_SALT, accesslevel: 'standard',
        };
        con.query('INSERT INTO user_account SET ?', user, (err, result) => {
            if (err) throw err;
            this.getUser(username, callback);
        });
    }
}

module.exports = { mySQLDB };
