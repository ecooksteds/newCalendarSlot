var util = require("util");
var mysql = require("mysql");
/**
 * Connection to the database.
 *  */
var pool = mysql.createPool({
	host:
		"mysql://b985dc3b3b241d:0d98a743@us-cdbr-iron-east-04.cleardb.net/heroku_fd85a10cd896b1c?reconnect=true",
	user: "b985dc3b3b241d", // use your mysql username.
	password: "0d98a743", // user your mysql password.
	database: "heroku_fd85a10cd896b1c"
});

pool.getConnection((err, connection) => {
	if (err)
		console.error("Something went wrong connecting to the database ...");

	if (connection) connection.release();
	return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;
