var pool = require("./pool");
var bcrypt = require("bcrypt");

function User() {}

User.prototype = {
	// Find the user data by id or username.
	find: function(user = null, callback) {
		// if the user variable is defind
		if (user) {
			// if user = number return field = id, if user = string return field = username.
			var field = Number.isInteger(user) ? "id" : "username";
		}

		let sql = `SELECT * FROM users WHERE ${field} = ?`;

		pool.query(sql, user, function(err, result) {
			if (err) throw err;

			if (result.length) {
				callback(result[0]);
			} else {
				callback(null);
			}
		});
	},

	// This function will insert data into the database. (create a new user)
	// body is an object
	create: function(body, callback) {
		var pwd = body.password;
		// Hash the password before insert it into the database.
		body.password = bcrypt.hashSync(pwd, 10);

		// this array will contain the values of the fields.
		var bind = [];
		// loop in the attributes of the object and push the values into the bind array.
		for (prop in body) {
			bind.push(body[prop]);
		}
		// prepare the sql query
		let sql = `INSERT INTO users SET ?`;
		// call the query give it the sql string and the values (bind array)
		pool.query(sql, body, function(err, result) {
			if (err) throw err;
			// return the last inserted id. if there is no error

			callback(result.insertId);
		});
	},

	login: function(username, password, callback) {
		// find the user data by his username.
		this.find(username, function(user) {
			// if there is a user by this username.
			if (user) {
				// now we check his password.
				if (bcrypt.compareSync(password, user.password)) {
					// return his data.
					callback(user);
					return;
				}
			}
			// if the username/password is wrong then return null.
			callback(null);
		});
	},
	auth: function(id, callback) {
		pool.query(`SELECT * FROM users WHERE id=${id}`, function(err, user) {
			// if there is a user by this username.
			if (err) {
				callback(true, null);
				return;
			} else if (user) {
				callback(false, user[0]);
				return;
			} else if (!user) {
				callback(false, null);
			}
		});
	}
};

// static functions
User.meetings = user => {
	return new Promise((resolve, reject) => {
		pool.query(
			`select * from meeting where invitationfrom='${user.fullname}'`
		).then(meetings => {
			resolve(meetings);
		});
	});
};
User.pendingSlots = user => {
	return new Promise((resolve, reject) => {
		pool.query(
			`select slot.*,meeting.invitationfrom from slot join meeting on meeting.meetingID=slot.meetingID where slot.userID='${user.id}' and slot.status='PENDING'`
		)
			.then(userSlots => {
				userSlots = userSlots.map(s => {
					s.date = new Date(s.date).toLocaleDateString();
					return s;
				});
				resolve(userSlots);
			})
			.catch(err => {
				reject(err);
			});
	});
};
User.respondedSlots = user => {
	return new Promise((resolve, reject) => {
		pool.query(
			`select slot.*,meeting.invitationfrom from slot join meeting on meeting.meetingID=slot.meetingID where slot.userID='${user.id}' and slot.status!='PENDING'`
		)
			.then(userSlots => {
				userSlots = userSlots.map(s => {
					if (s.invitationfrom == user.fullname) {
						s.isAdmin = true;
					}
					s.date = new Date(s.date).toLocaleDateString();
					return s;
				});
				resolve(userSlots);
			})
			.catch(err => {
				reject(err);
			});
	});
};
User.getSlotsStatus = (meeting, user) => {
	return new Promise((resolve, reject) => {
		pool.query(
			`select status from slot where meetingID='${meeting.meetingID}'`
		)
			.then(result => {
				let status = "Completed";
				result.forEach(slot => {
					if (slot.status != "ACCEPTED" && slot.status != "DECLINED")
						status = "Pending";
				});
				meeting.slotsStatus = status;
				resolve(meeting);
			})
			.catch(err => {
				reject(err);
			});
	});
};
User.getByUsername = username => {
	return new Promise((resolve, reject) => {
		pool.query(`select * from users where username='${username}'`)
			.then(result => {
				if (result.length) {
					resolve(result[0]);
					return;
				}
				resolve(null);
			})
			.catch(err => {
				reject(err);
			});
	});
};

module.exports = User;
