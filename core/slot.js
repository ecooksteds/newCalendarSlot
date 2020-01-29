var pool = require("./pool");
const moment = require("moment");
var bcrypt = require("bcrypt");

function Slot() {}

Slot.prototype = {
	// to save slot data in database
	create: function(body, callback) {
		let sql = `INSERT INTO slot SET ?`;
		pool.query(sql, body, (err, result) => {
			if (err) {
				callback(err, null);
				return;
			}
			callback(null, result);
		});
	}
};
Slot.best = (meetingID, body) => {
	return new Promise((res, rej) => {
		pool.query(
			`select * from slot where meetingID='${meetingID}' and status='ACCEPTED'`
		)
			.then(dbSlots => {
				let userSlotsWithPerfection = body.map(userSlot => {
					userSlot.perfection = 0;
					let userTimeStart = moment(
						moment(userSlot.date).format("YYYY-MM-DD") +
							" " +
							userSlot.timeStart,
						"YYYY-MM-DD hh:mm A"
					);
					let userTimeEnd = moment(
						moment(userSlot.date).format("YYYY-MM-DD") +
							" " +
							userSlot.timeEnd,
						"YYYY-MM-DD hh:mm A"
					);

					dbSlots.forEach(dbSlot => {
						let dbTimeStart = moment(
							moment(dbSlot.date).format("YYYY-MM-DD") +
								" " +
								dbSlot.timeStart,
							"YYYY-MM-DD hh:mm A"
						);
						let dbTimeEnd = moment(
							moment(dbSlot.date).format("YYYY-MM-DD") +
								" " +
								dbSlot.timeEnd,
							"YYYY-MM-DD hh:mm A"
						);
						// adding perfection
						if (
							userTimeStart.isBetween(dbTimeStart, dbTimeEnd) &&
							userTimeEnd.isBetween(dbTimeStart, dbTimeEnd)
						) {
							userSlot.perfection += 3;
							return;
						}
						if (userTimeStart.isBetween(dbTimeStart, dbTimeEnd)) {
							userSlot.perfection += 2;
							return;
						}
						if (userTimeEnd.isBetween(dbTimeStart, dbTimeEnd)) {
							userSlot.perfection += 1;
							return;
						}
					});
					return userSlot;
				});
				res(userSlotsWithPerfection);
			})
			.catch(console.log);
	});
};
Slot.getThisUserSlot = (slotId, user) => {
	return new Promise((res, rej) => {
		pool.query(
			`select * from slot where slotId=${slotId} and userID=${user.id}`
		)
			.then(result => {
				if (result[0]) {
					res(result[0]);
				} else {
					rej(null);
				}
			})
			.catch(console.log);
	});
};
Slot.create = body => {
	return new Promise((res, rej) => {
		let sql = `INSERT INTO slot SET ?`;
		pool.query(sql, body)
			.then(result => {
				res(result);
			})
			.catch(err => {
				rej(err);
			});
	});
};
Slot.update = (data, user) => {
	return new Promise((res, rej) => {
		let sql = `UPDATE slot SET ? WHERE slotId='${data.slotId}' AND userID='${user.id}'`;
		pool.query(sql, data.slot)
			.then(result => {
				res(result);
			})
			.catch(err => {
				rej(err);
			});
	});
};
Slot.decline = (slotId, user) => {
	return Slot.update(
		{
			slotId,
			slot: {
				status: "DECLINED"
			}
		},
		user
	);
};

module.exports = Slot;
