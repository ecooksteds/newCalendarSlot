var util = require('util');
var mysql = require('mysql');
/**
 * Connection to the database.
 *  */
var pool = mysql.createPool({
    host: 'us-cdbr-iron-east-05.cleardb.net',
    user: 'b15bfd522a38aa', // use your mysql username.
    password: 'd436c805', // user your mysql password.
    database: 'heroku_66bd76f57e3f221'
});

pool.getConnection((err, connection) => {
    if(err) 
        console.error("Something went wrong connecting to the database ...");
    
    if(connection)
        connection.release();
    return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;