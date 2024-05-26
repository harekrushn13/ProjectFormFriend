const { default: mongoose } = require("mongoose");

const user = new mongoose.Schema(
	{
		email: String,
		username: String,
		refresh_token: String,
		forms: [
			{
				form_id: String,
				form_link: String,
				title: String,
				deadline: Date,
				last_remainder: Date,
				batches: [{ type: mongoose.SchemaTypes.ObjectId, ref: "batches" }],
			},
		],
	},
	{ timestamps: true }
);
module.exports = mongoose.model("users", user);
