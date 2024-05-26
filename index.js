require("dotenv").config();
const express = require("express");
const connectDb = require("./utils/db.utils");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const session = require("express-session");
const { asyncRouteHandler } = require("./utils/route.utils");
const { home, authMiddleware, googleRedirect } = require("./controllers/auth.controller");
const { authorizationUrl } = require("./utils/google.utils");
const { viewForms } = require("./controllers/form.controller");

const app = express();

["log", "warn", "error"].forEach((methodName) => {
	const originalMethod = console[methodName];
	console[methodName] = (...args) => {
		let initiator = "unknown place";
		try {
			throw new Error();
		} catch (e) {
			if (typeof e.stack === "string") {
				let isFirst = true;
				for (const line of e.stack.split("\n")) {
					const matches = line.match(/^\s+at\s+(.*)/);
					if (matches) {
						if (!isFirst) {
							// first line - current function
							// second line - caller (what we are looking for)
							initiator = matches[1];
							break;
						}
						isFirst = false;
					}
				}
			}
		}
		originalMethod.apply(console, [...args, "\n", `  at ${initiator}`]);
	};
});

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));

app.get("/", asyncRouteHandler(home));

app.get("/login", (req, res) => {
	res.redirect(authorizationUrl);
});

app.get("/redirect", asyncRouteHandler(googleRedirect));

app.get("/forms", authMiddleware, asyncRouteHandler(viewForms));

// app.use(authMiddleware);

app.all("*", (req, res) => {
	res.render("error", { userError: "Page not found" });
});

connectDb().then(() => {
	app.listen(process.env.PORT || 3000, () => {
		console.log(`http://localhost:${process.env.PORT || 3000}`);
	});
});
