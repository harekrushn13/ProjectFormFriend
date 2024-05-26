const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URL);

const scopes = [
	"https://www.googleapis.com/auth/userinfo.email",
	"https://www.googleapis.com/auth/userinfo.profile",
	"https://www.googleapis.com/auth/drive.file",
	"https://www.googleapis.com/auth/drive",
	"https://www.googleapis.com/auth/forms.body",
	"https://www.googleapis.com/auth/drive.readonly",
	"https://www.googleapis.com/auth/forms.body.readonly",
	"https://www.googleapis.com/auth/forms.responses.readonly",
	"https://mail.google.com/",
];

const authorizationUrl = oauth2Client.generateAuthUrl({
	access_type: "offline",
	scope: scopes,
	include_granted_scopes: true,
});

module.exports = { oauth2Client, authorizationUrl };
