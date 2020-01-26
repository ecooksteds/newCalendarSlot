var express = require("express");
const moment = require("moment");
var User = require("../core/user");
var router = express.Router();
var session = require("express-session");
var Join = require("../core/join");
var Slot = require("../core/slot");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
// create an object from the class User in the file core/user.js
var user = new User();
var join = new Join();
var slot = new Slot();
const Meeting = require("./../core/meeting");

// Passport module authentication
passport.use(
	new LocalStrategy(
		{
			usernameField: "username",
			passwordField: "password"
		},
		function(username, password, done) {
			user.login(username, password, function(user) {
				if (user) {
					return done(null, user, { message: "record found" });
				}
				if (!user) {
					return done(null, false, {
						message: "Invalid UserName or Password"
					});
				}
			});
		}
	)
);
// configuration of Passport
passport.serializeUser((user, done) => {
	done(null, user.id);
});
passport.deserializeUser((id, done) => {
	user.auth(id, (err, user) => {
		if (err) {
			done(err);
		}
		if (!user) {
			done(null, false);
		} else {
			done(null, user);
		}
	});
});

router.get("/login", function(req, res) {
	res.render("index", { title: "Calendar Slot" });
});
// Get the index page
router.get(
	"/",
	require("connect-ensure-login").ensureLoggedIn(),
	(req, res) => {
		// console.log("aut", req.user)
		// // If there is a session named user that means the use is logged in. so we redirect him to home page by using /home route below
		// if (req.isAuthenticated()) {
		res.redirect("/home");
		//     return;
		// }
		// // IF not we just send the index page.
		// res.render('index', { title: "Calendar Slot" });
	}
);

// Get home page
router.get(
	"/home",
	require("connect-ensure-login").ensureLoggedIn(),
	(req, res) => {
		let user = req.user;
		res.render("home", { opp: true, name: user.fullname });
	}
);

// When An Admin will create a meeting
// here data will be saved in database through query
router.post("/createjoin", (req, res) => {
	let user = req.user;
	if (user) {
		let userInput = {
			invitees: req.body.invitees,
			meetingLength: req.body.meetingLength,
			duration: req.body.duration,
			frequency: req.body.frequency,
			invitationfrom: user.fullname
		};
		join.create(userInput, function(lastId) {
			if (lastId) {
				res.send(
					`<script>alert("Your Meeting Data Has Been Saved"); window.location.pathname="/setmeeting/${lastId.toString()}"</script>`
				);
			} else {
				res.send("Something went wrong");
			}
		});
	} else {
		res.redirect("/");
	}
});

// Post login data
router.post(
	"/login",
	passport.authenticate("local", {
		successReturnToOrRedirect: "/home",
		failureRedirect: "/login"
	}),
	(req, res) => {
		// The data sent from the user are stored in the req.body object.
		// call our login function and it will return the result(the user data).
		// user.login(req.body.username, req.body.password, function (result) {
		// if (result) {
		// Store the user data in a session.
		// req.session.user = result;
		// req.session.opp = 1;
		// redirect the user to the home page.
		res.redirect("/home");
		// } else {
		// if the login function returns null send this error message back to the user.
		// res.send('Username/Password incorrect!');
		// }
		// })
	}
);

// Post register data
router.post("/register", (req, res) => {
	// prepare an object containing all user inputs.
	let userInput = {
		username: req.body.username,
		fullname: req.body.fullname,
		password: req.body.password
	};
	// call create function. to create a new user. if there is no error this function will return it's id.
	user.create(userInput, function(lastId) {
		// if the creation of the user goes well we should get an integer (id of the inserted user)
		if (lastId) {
			// Get the user data by it's id. and store it in a session.
			// user.find(lastId, function (result) {
			//     req.session.user = result;
			//     req.session.opp = 0;
			//     res.redirect('/home');
			// });
			res.send(
				`<script>alert("Your Account Has Been Created. Please Login Now!");window.location.pathname="/login"</script>`
			);
		} else {
			console.log("Error creating a new user ...");
		}
	});
});

// Post meeting dashboard data
router.get("/meetingdashboard", (req, res, next) => {
	let user = req.user;
	if (user) {
		res.render("createjoin", { opp: 1, name: user.fullname });
		return;
	} else {
		res.redirect("/");
	}
});
router.get("/joinmeeting", (req, res, next) => {
	// When user visit this path List Meeting request will be shown
	let user = req.user;
	if (user) {
		join.find(res, user, function(result) {
			res.render("joinmeeting", {
				total: result.length,
				meetingList: result
			});
		});
	} else {
		res.redirect("/");
	}
});
router.get("/as-invitee", (req, res, next) => {
	// Here List of Meeting As invitee will shown with Meeting List record
	let user = req.user;
	if (user) {
		join.accptMeetingList(res, user, function(result) {
			res.render("asInvitee", {
				total: result.length,
				meetingList: result
			});
		});
	} else {
		res.redirect("/");
	}
});
router.get("/as-admin", (req, res, next) => {
	// If a user is a admin of meeting, then list meeting invitee of who has
	// accepted meeting request will be shown here
	let user = req.user;
	if (user) {
		User.meetings(user).then(allMeetings => {
			let meetings = allMeetings.map(meeting =>
				User.addMeetingSlot(meeting)
			);
			Promise.all(meetings).then(meetingsWithSlots => {
				res.render("asAdmin", {
					fullname: user.fullname,
					meetingList: meetingsWithSlots
				});
			});
		});
	} else {
		res.redirect("/");
	}
});
router.get("/meetingpage", (req, res, next) => {
	let user = req.user;
	// Here Meeting Page with two Option As-Admin
	// and As-Invitee Links is shown
	if (user) {
		res.render("meetingpage");
		// })
	} else {
		res.redirect("/");
	}
});
router.get("/setmeeting/:id", (req, res, next) => {
	//After Set Meeting with Invitee, Meeting ID with SetMeeting Slot Form Will be shown
	var id = req.params.id;
	let user = req.user;
	if (user) {
		res.render("setmeeting", { id });
	} else {
		res.redirect("/");
	}
});
router.get("/acceptmeeting/:id", (req, res, next) => {
	// When User is click on accept button, a form with Meeting ID will be shown to set Meeting Slot
	var id = req.params.id;
	let user = req.user;
	if (user) {
		res.render("acceptmeeting", { id });
	} else {
		res.redirect("/");
	}
});
router.post("/api/setMeeting", (req, res) => {
	// Here An Admin will set Slot for Meeting
	let user = req.user;
	if (user) {
		let userInput = {
			meetingID: req.body.meetingID,
			day: req.body.day,
			date: moment(req.body.date).format("YYYY-MM-DD"),
			timeStart: req.body.timeStart,
			timeEnd: req.body.timeEnd,
			userID: user.id
		};
		// Here is Database Query to Save Meeting Data
		slot.create(userInput, (err, lastId) => {
			if (lastId) {
				res.send({
					save: true,
					message: "Your Slot Data Has Been Saved"
				});
			} else if (err) {
				res.status(400).send(`something went wrong; code:${err.code}`);
			} else {
				res.status(400).send("something went wrong");
			}
			return;
		});
	}
});
// Here Best Slot for Meeting is Checking for Meeting
router.post("/checkslot", (req, res, next) => {
	let user = req.user;
	if (user) {
		// Here is Query that will return Best Meeting Slot for Meeting
		slot.check(res, req.body, function(err, bestSlot) {
			if (err.err) {
				res.send(err.message);
			} else {
				var filter = [];
				// remove duplicate record
				bestSlot
					.map(function(obj) {
						return obj.timeStart;
					})
					.forEach(function(element, index, arr) {
						if (arr.indexOf(element) == index) {
							filter.push(bestSlot[index]);
						}
					});
				res.send(filter);
			}
		});
	} else {
		res.redirect("/");
	}
});
// When User Has Accepted Meeting Request then his data will saved in database Here.
router.post("/acceptmeeting", (req, res, next) => {
	let user = req.user;
	if (user) {
		let userInput = {
			meetingID: req.body.meetingID,
			day: req.body.day,
			date: req.body.date,
			timeStart: req.body.timeStart,
			timeEnd: req.body.timeEnd,
			userID: user.id
		};
		// Here is Query to save data
		slot.create(res, userInput, function(lastId) {
			if (lastId) {
				res.send({
					save: true,
					message: "Your Slot For Meeting Has Been Saved"
				});
			} else {
				console.log("Error creating a new user ...");
				res.send("Something went Wrong");
			}
		});
	} else {
		res.redirect("/");
	}
});

// Get loggout page
router.get("/loggout", (req, res, next) => {
	// Check if the session is exist

	// destroy the session and redirect the user to the index page.
	req.logout();
	res.redirect("/");
});

router.post("/api/meeting/delete", (req, res) => {
	let user = req.user;
	let meetingId = req.body.meetingID;
	if (user && meetingId) {
		Meeting.delete(meetingId, user)
			.then(result => {
				res.send({
					message: `meeting and its slot(s) has been deleted. deleted ${result.affectedRows} items`
				});
			})
			.catch(err => {
				res.status(400).send({
					message: "SQL error. meeting could not be deleted."
				});
			});
	}
});

module.exports = router;
