const router = require("express").Router();
const moment = require("moment");

const Slot = require("../core/slot");
const User = require("./../core/user");

const logged = require("./../middleware/logged");
router.use(logged);

router.get("/create/:meetingID", (req, res) => {
	let user = req.user;
	let meetingID = req.params.meetingID;
	res.render("slot-create", {
		meetingID
	});
});
router.post("/create/:meetingID", (req, res) => {
	let user = req.user;

	// fix date if any
	req.body.date = req.body.date
		? moment(req.body.date).format("YYYY-MM-DD")
		: req.body.date;

	// adding userID
	req.body.userID = req.user.id;

	Slot.create(req.body, user)
		.then(() => {
			res.send({
				message: "the Slot has been saved"
			});
		})
		.catch(err => {
			res.status(400).send(`something went wrong; code:${err.code}`);
		});
});

router.post("/best/:meetingID", (req, res) => {
	let user = req.user;
	let meetingID = req.params.meetingID;
	Slot.best(meetingID, req.body)
		.then(slots => {
			// sorting it
			slots = slots.filter(s => s.perfection != 0);
			slots.sort((a, b) => b.perfection - a.perfection);
			res.send(slots);
		})
		.catch(console.log);
});

router.get("/decline/:slotId", (req, res) => {
	let user = req.user;
	let slotId = req.params.slotId;
	Slot.decline(slotId, user).then(result => {
		res.redirect("/");
	});
});

router.post("/update/:slotId", (req, res) => {
	let user = req.user;
	let slotId = req.params.slotId;

	// fix date if any
	req.body.date = req.body.date
		? moment(req.body.date).format("YYYY-MM-DD")
		: req.body.date;

	let data = {
		slotId,
		slot: req.body
	};

	// Here is Database Query to Save Meeting Data
	Slot.update(data, user)
		.then(result => {
			res.send({
				save: true,
				message: "your Slot has been saved"
			});
		})
		.catch(err => {
			res.status(400).send(`something went wrong; code:${err.code}`);
		});
});

router.get("/update/:slotId", (req, res) => {
	let user = req.user;
	let slotId = req.params.slotId;
	Slot.getThisUserSlot(slotId, user).then(slot => {
		if (slot.status == "ACCEPTED") {
			res.redirect("/");
			return;
		}
		res.render("slot-update", {
			slot
		});
	});
});

module.exports = router;
