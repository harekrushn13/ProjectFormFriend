const { default: mongoose } = require("mongoose");

const batch = new mongoose.Schema({
	batch: String,
	details: [
		{
			enrollment: String,
			name: String,
			email: String,
		},
	],
});

module.exports = mongoose.model("batches", batch);
