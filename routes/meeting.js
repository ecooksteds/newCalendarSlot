const router = require("express").Router();

const Meeting = require("./../core/meeting");
const User = require("./../core/user");

const logged = require("./../middleware/logged");
router.use(logged);

router.get("/create", (req, res) => {
	let user = req.user;
	res.render("createjoin", { opp: 1, name: user.fullname });
	return;
});

router.post("/create", (req, res) => {
	let user = req.user;
	let userInput = {
		invitees: req.body.invitees,
		meetingLength: req.body.meetingLength,
		duration: req.body.duration,
		frequency: req.body.frequency,
		invitationfrom: user.fullname
	};
	Meeting.create(userInput, user)
		.then(({ adminSlotId }) => {
			res.redirect("/slot/update/" + adminSlotId);
		})
		.catch(err => {
			console.log(err);
			res.send("somthing went wrong");
		});
});

router.post("/delete", (req, res) => {
	let user = req.user;
	let meetingId = req.body.meetingID;
	Meeting.delete(meetingId, user)
		.then(result => {
			res.send({
				message: `meeting and its slot(s) has been deleted. deleted ${result.affectedRows} items.`
			});
		})
		.catch(err => {
			res.status(400).send({
				message: "SQL error. meeting could not be deleted."
			});
		});
});

router.get("/show", (req, res, next) => {
	// Here Meeting Page with two Option As-Admin
	// and As-Invitee Links is shown
	res.render("meetingpage");
});

router.get("/show/to-join", (req, res, next) => {
	// When user visit this path List Meeting request will be shown
	let user = req.user;
	User.pendingSlots(user).then(slots => {
		res.render("joinmeeting", {
			total: slots.length,
			slots
		});
	});
});

router.get("/show/as-invitee", (req, res) => {
	// Here List of Meeting As invitee will shown with Meeting List record
	let user = req.user;
	User.respondedSlots(user).then(slots => {
		res.render("asInvitee", {
			total: slots.length,
			slots: slots
		});
	});
});

router.get("/show/as-admin", (req, res) => {
	// If a user is a admin of meeting, then list meeting invitee of who has
	// accepted meeting request will be shown here
	let user = req.user;
	User.meetings(user).then(allMeetings => {
		meetingsWithSlotsStatus = allMeetings.map(meeting =>
			User.getSlotsStatus(meeting, user)
		);
		Promise.all(meetingsWithSlotsStatus).then(meetings => {
			res.render("asAdmin", {
				fullname: user.fullname,
				meetings: meetings
			});
		});
	});
});

module.exports = router;
