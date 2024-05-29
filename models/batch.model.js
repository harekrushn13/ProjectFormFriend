const {default: mongoose} = require("mongoose");

const batch = new mongoose.Schema({
    batch: String,
    is_active: {type: Number, default: 1},
    details: [
        {
            enrollment: String,
            name: String,
            email: String,
        },
    ],
});
const batchesModel = mongoose.model("batches", batch);
module.exports = batchesModel;
