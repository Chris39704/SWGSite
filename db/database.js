(function () {
    const mysql = require('mysql');

    const con = mysql.createConnection({
        host: process.env.SQLDB_HOST,
        database: process.env.SQLDB_NAME,
        user: process.env.SQLDB_USER,
        password: process.env.SQLDB_PASS,
    });

    // callback = function(err, user)
    module.exports.getUser = function (username, callback) {
        const sql = `SELECT * FROM user_account WHERE username = ${mysql.escape(username)}`;
        con.query(sql, (err, result) => {
            if (err == null) {
                const user = (result.length >= 1 ? result[0] : null);
                callback(err, user);
            } else {
                console.log(err);
            }
        });
    };

    // callback = function(err, user)
    module.exports.createUser = function (username, password, email, callback) {
        const user = {
            username, password_hash: password, password_salt: 'aaaa', accesslevel: 'standard',
        };
        con.query('INSERT INTO user_account SET ?', user, (err, result) => {
            if (err) throw err;
            module.exports.getUser(username, callback);
        });
    };
}());
