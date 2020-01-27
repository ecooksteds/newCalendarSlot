var express = require("express");
var router = express.Router();
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

// create an object from the class User in the file core/user.js
const User = require("./../core/user");
var user = new User();

const logged = require("./../middleware/logged");

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

// Get the index page
router.get("/", (req, res) => {
	// console.log("aut", req.user)
	// // If there is a session named user that means the use is logged in. so we redirect him to home page by using /home route below
	// if (req.isAuthenticated()) {
	res.redirect("/home");
	//     return;
	// }
	// // IF not we just send the index page.
	// res.render('index', { title: "Calendar Slot" });
});

// Get home page
router.get("/home", logged, (req, res) => {
	let user = req.user;
	res.render("home", { opp: true, name: user.fullname });
});

router.use("/slot", require("./slot"));
router.use("/meeting", require("./meeting"));
router.use("/user", require("./user"));
module.exports = router;
