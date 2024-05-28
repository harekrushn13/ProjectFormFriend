function asyncRouteHandler(handler) {
	return async (req, res, next) => {
		try {
			await handler(req, res, next);
		} catch (e) {
			next(e);
		}
	};
}

function errorHandler(err, req, res, next) {
	res.render("error", { userError: err.message });
}

function errorShower(req, res, next) {
	res.locals.userError = req.session.error;
	req.session.error = undefined;
	res.locals.userSuccess = req.session.success;
	req.session.success = undefined;
	next();
}
module.exports = { asyncRouteHandler, errorHandler, errorShower };
