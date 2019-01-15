const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
	influenced: Array,
	urlID: String,
	content: String,
	initID: String,
	time: Date,
	pathType: String
});

module.exports = mongoose.model("Notification", NotificationSchema);