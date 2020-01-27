const router = require("express").Router();
const passport = require("passport");

const User = require("./../core/user");
var user = new User();

router.get("/login", function(req, res) {
	res.render("index", { title: "Calendar Slot" });
});

router.post(
	"/login",
	passport.authenticate("local", {
		successReturnToOrRedirect: "/",
		failureRedirect: "/user/login"
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
		res.redirect("/");
		// } else {
		// if the login function returns null send this error message back to the user.
		// res.send('Username/Password incorrect!');
		// }
		// })
	}
);
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
				`<script>alert("Your Account Has Been Created. Please Login Now!");window.location.pathname="/user/login"</script>`
			);
		} else {
			console.log("Error creating a new user ...");
		}
	});
});

router.get("/logout", (req, res, next) => {
	// Check if the session is exist
	// destroy the session and redirect the user to the index page.
	req.logout();
	res.redirect("/");
});

module.exports = router;
