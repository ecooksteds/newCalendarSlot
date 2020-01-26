var pool = require("./pool");
var bcrypt = require("bcrypt");

function Slot() {}

Slot.prototype = {
	// to save slot data in database
	create: function(res, body, callback) {
		let sql = `INSERT INTO slot SET ?`;
		pool.query(sql, body, function(err, result) {
			if (err) {
				res.send(err);
			}

			callback(result);
		});
	},
	// to check The best slot for meeting
	check: function(res, body, callback) {
		pool.query(
			`select * from slot where meetingID='${body[0].meetingID}'`,
			function(err, result) {
				if (err) {
					callback({ err: true, message: err }, null);
				} else {
					var bestSlot = [];
					for (let i = 0; i < body.length; i++) {
						var userSlot = body[i];
						for (let index = 0; index < result.length; index++) {
							var record = result[index];
							var date = new Date(userSlot.date);
							if (
								record.date.toDateString() ==
									date.toDateString() &&
								record.day == userSlot.day &&
								record.timeStart == userSlot.timeStart &&
								record.timeEnd == userSlot.timeEnd
							) {
								bestSlot.push(userSlot);
							}
						}
					}
					callback({ err: false, message: null }, bestSlot);
				}
			}
		);
	}
};

module.exports = Slot;
