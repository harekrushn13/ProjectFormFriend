const { google } = require("googleapis");
const { oauth2Client } = require("../utils/google.utils");

async function authMiddleware(req, res, next) {
	if (!req.session.refreshToken || !req.session.userData) {
		res.redirect("/");
		return;
	}
	next();
}
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function home(req, res, next) {
	if (!req.session.refreshToken) {
		res.render("home");
		return;
	}
	oauth2Client.setCredentials({
		refresh_token: req.session.refreshToken,
	});
	let userData = {
		email: null,
		userName: null,
		profilePicture: null,
	};

	let Oauth2 = google.oauth2({
		auth: oauth2Client,
		version: "v2",
	});

	let profileData = null;
	try {
		profileData = await Oauth2.userinfo.get();
	} catch (error) {
		console.log(error);
		req.session.refreshToken = null;
		res.render("home");
		return;
	}
	userData.email = profileData.data.email;
	userData.userName = profileData.data.name;
	userData.profilePicture = profileData.data.picture;

	req.session.userData = userData;

	res.render("home", { userData });
}

async function googleRedirect(req, res, next) {
	try {
		let code = req.query.code;
		let { tokens } = await oauth2Client.getToken(code);
		req.session.refreshToken = tokens.refresh_token;
	} catch (error) {
		console.log(error);
	}
	res.redirect("/");
}
module.exports = { home, authMiddleware, googleRedirect };
