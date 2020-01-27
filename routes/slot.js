const router = require("express").Router();
const moment = require("moment");

const Slot = require("../core/slot");
const User = require("./../core/user");

const logged = require("./../middleware/logged");
router.use(logged);

router.get("/decline/:slotId", (req, res) => {
	let user = req.user;
	let slotId = req.params.slotId;
	Slot.decline(slotId, user).then(result => {
		res.redirect("/joinmeeting");
	});
});

router.get("/update/:slotId", (req, res) => {
	let slotId = req.params.slotId;
	res.render("setmeeting", {
		slotId: slotId
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

module.exports = router;
