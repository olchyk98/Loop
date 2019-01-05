const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	time: Date,
	content: String,
	type: String,
	creatorID: String,
	conversationID: String,
	isSeen: false,
	images: Array
});

module.exports = mongoose.model("Message", MessageSchema);