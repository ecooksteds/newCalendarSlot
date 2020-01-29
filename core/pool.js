var util = require("util");
var mysql = require("mysql");
/**
 * Connection to the database.
 *  */
var pool = mysql.createConnection(process.env.CLEARDB_DATABASE_URL);

pool.getConnection((err, connection) => {
	if (err)
		console.error("Something went wrong connecting to the database ...");

	if (connection) connection.release();
	return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;
