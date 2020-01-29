const pool = require("./pool");
const Slot = require("./slot");
const User = require("./user");

class Meeting {
	static create(body, user) {
		return new Promise((res, rej) => {
			pool.query("insert into meeting SET ?", body)
				.then(({ insertId: meetingInsertId }) => {
					// add slots at the time of meeting creation
					let invitees = body.invitees.split(",");
					Promise.all(
						invitees.map(invitee => User.getByUsername(invitee))
					)
						.then(result => {
							let inviteesUsers = result;
							// adding admin slot
							let inviteesSlots = [];
							inviteesUsers.forEach(user => {
								if (user) {
									inviteesSlots.push(
										Slot.create({
											meetingID: meetingInsertId,
											userID: user.id,
											status: "PENDING"
										})
									);
								}
							});

							Promise.all(inviteesSlots)
								.then(result => {
									res(meetingInsertId);
								})
								.catch(err => {
									rej(err);
								});
						})
						.catch(console.log);
				})
				.catch(console.log);
		});
	}
	static delete(id, user) {
		let sql = `delete meeting,slot from meeting left join slot on slot.meetingID=meeting.meetingID WHERE meeting.meetingID='${id}' AND meeting.invitationfrom='${user.fullname}'`;
		return new Promise((res, rej) => {
			pool.query(sql)
				.then(result => {
					res(result);
				})
				.catch(err => {
					rej(err);
				});
		});
	}
}
module.exports = Meeting;
