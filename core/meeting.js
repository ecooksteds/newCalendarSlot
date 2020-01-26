const pool = require("./pool");

class Meeting {
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
