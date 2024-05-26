const { google } = require("googleapis");
const { oauth2Client } = require("../utils/google.utils");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

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
	const userError = req.session.error;
	req.session.error = undefined;

	let token = req.cookies.token;
	let refreshToken = req.session.refreshToken;
	if (!refreshToken) {
		try {
			const data = jwt.verify(token, process.env.SESSION_SECRET);
			refreshToken = data.refreshToken;
			req.session.refreshToken = refreshToken;
		} catch (error) {}
	}

	if (!refreshToken) {
		res.render("home", { userError });
		return;
	}
	oauth2Client.setCredentials({
		refresh_token: refreshToken,
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
		res.clearCookie("token");
		res.render("home", { userError });
		return;
	}
	userData.email = profileData.data.email;
	userData.userName = profileData.data.name;
	userData.profilePicture = profileData.data.picture;

	await userModel.updateOne(
		{
			email: userData.email,
		},
		{
			$set: {
				username: userData.userName,
				refresh_token: refreshToken,
				updatedAt: new Date(),
			},
		},
		{ upsert: true }
	);

	req.session.userData = userData;
	res.cookie("token", jwt.sign({ refreshToken }, process.env.SESSION_SECRET), { httpOnly: true });

	res.render("home", { userData, userError });
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
