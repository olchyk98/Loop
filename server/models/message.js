const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	time: Date,
	content: String,
	type: String,
	creatorID: String,
	conversationID: String
});

module.exports = mongoose.model("Message", MessageSchema);