var pool = require("./pool");
const moment = require("moment");
var bcrypt = require("bcrypt");
const Polling = require("../core/polling");

function Slot() {}

Slot.dateFormat = "YYYY-MM-DD";
Slot.dateTimeFormat = Slot.dateFormat + " hh:mm A";

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
		// pool.query(
		// 	`select * from slot where meetingID='${meetingID}' and status='ACCEPTED'`
		// )
		// 	.then(dbSlots => {
		// 		let userSlotsWithPerfection = body.map(userSlot => {
		// 			userSlot.perfection = 0;
		// 			let userTimeStart = moment(
		// 				moment(userSlot.date).format(Slot.dateFormat) +
		// 					" " +
		// 					userSlot.timeStart,
		// 				Slot.dateTimeFormat
		// 			);
		// 			let userTimeEnd = moment(
		// 				moment(userSlot.date).format(Slot.dateFormat) +
		// 					" " +
		// 					userSlot.timeEnd,
		// 				Slot.dateTimeFormat
		// 			);

		// 			dbSlots.forEach(dbSlot => {
		// 				let dbTimeStart = moment(
		// 					moment(dbSlot.date).format(Slot.dateFormat) +
		// 						" " +
		// 						dbSlot.timeStart,
		// 					Slot.dateTimeFormat
		// 				);
		// 				let dbTimeEnd = moment(
		// 					moment(dbSlot.date).format(Slot.dateFormat) +
		// 						" " +
		// 						dbSlot.timeEnd,
		// 					Slot.dateTimeFormat
		// 				);
		// 				// adding perfection
		// 				if (
		// 					userTimeStart.isBetween(
		// 						dbTimeStart,
		// 						dbTimeEnd,
		// 						null,
		// 						"[]"
		// 					) &&
		// 					userTimeEnd.isBetween(
		// 						dbTimeStart,
		// 						dbTimeEnd,
		// 						null,
		// 						"[]"
		// 					)
		// 				) {
		// 					userSlot.perfection += 3;
		// 					return;
		// 				}
		// 				if (
		// 					userTimeStart.isBetween(
		// 						dbTimeStart,
		// 						dbTimeEnd,
		// 						null,
		// 						"[]"
		// 					)
		// 				) {
		// 					userSlot.perfection += 2;
		// 					return;
		// 				}
		// 				if (
		// 					userTimeEnd.isBetween(
		// 						dbTimeStart,
		// 						dbTimeEnd,
		// 						null,
		// 						"[]"
		// 					)
		// 				) {
		// 					userSlot.perfection += 1;
		// 					return;
		// 				}
		// 			});
					
		// 			return userSlot;
			// 	});
			// 	res(userSlotsWithPerfection);
			// })
			// .catch(console.log);
			var userList = Polling.populateUserList(meetingID);		
			var meetingLength = Polling.getMeetingLength(meetingID);
			var allChits = Polling.buildChitList(meetingID);
			var globalChitList = Polling.buildGlobalChitList(allChits,userList);
			var globalBlockList = Polling.buildGlobalBlockList(globalChitList, meetingLength);
			var firstListindex;
			var result = false;
			var matchSlot;
			for(firstListindex = 0; firstListindex <= globalBlockList[0].length; firstListindex++)
			{
				result = Polling.matchExists(globalBlockList, firstListindex, 0);
				if(result == true)
				{
					matchSlot = globalBlockList[0][firstListIndex];
					break;
				}
			}
			if(result == false)
			{
				return "No compatible block";
			}

			else
			{
				return matchSlot;
			}


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
