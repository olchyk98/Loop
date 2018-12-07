const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
	creatorID: String,
	postID: String,
	content: String,
	time: Date,
	likes: Array
});

module.exports = mongoose.model("Comment", CommentSchema);