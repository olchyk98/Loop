const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
	name: String,
	contributors: Array,
	avatar: String,
	creatorID: String,
	color: String
});

module.exports = mongoose.model("Conversation", ConversationSchema);