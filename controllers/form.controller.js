const { google } = require("googleapis");
const userModel = require("../models/user.model");
const cache = require("../utils/cache.utils");
const { oauth2Client } = require("../utils/google.utils");

async function viewForms(req, res, next) {
	let userData = req.session.userData;
	let userForms = null;
	const forms = google.forms({
		version: "v1",
		auth: oauth2Client,
	});
	let docs = await userModel
		.find({ email: { $eq: userData.email } })
		.sort({ createdAt: -1 })
		.populate("forms.batches");
	if (docs.length == 0) {
		res.redirect("/");
		return;
	}

	userForms = docs[0].forms;
	console.log(userForms);

	//this is new
	for (let countv = 0; countv < userForms.length; countv++) {
		const element = userForms[countv];
		if (cache.has(element.id)) {
			element.allenrolls = cache.get(element.id);
			continue;
		}
		let allenrolls = [];
		let metadata = null;
		let formdata = null;
		let enrollquestionid = null;

		element.batches.forEach((batch) => {
			allenrolls.push(...batch.details);
		});

		try {
			metadata = await forms.forms.get({
				formId: element.id,
			});
			formdata = await forms.forms.responses.list({
				formId: element.id,
			});
			metadata.data.items.forEach((item) => {
				if (item.title == "EnrollmentNo") {
					enrollquestionid = item.questionItem.question.questionId;
				}
			});
			if (!enrollquestionid) throw new Error("Invalid Form");
		} catch (error) {
			console.log(error);
			req.session.error = error.message;
			res.redirect("/");
			return;
		}

		formdata.data.responses.forEach((response) => {
			let currentEnrollment = allenrolls.find(
				(student) => student.enrollment == response.answers[enrollquestionid].textAnswers.answers[0].value
			);
			if (currentEnrollment) currentEnrollment.status = 1;
		});
		cache.set("responses" + element.id, formdata.data, 300);
		cache.set("metadata" + element.id, metadata.data, 300);
		cache.set(element.id, allenrolls, 300);
		element.allenrolls = allenrolls;
	}

	res.render("forms", { userForms, userData });
}

module.exports = { viewForms };
