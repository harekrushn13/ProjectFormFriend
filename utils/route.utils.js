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
module.exports = { asyncRouteHandler, errorHandler };
