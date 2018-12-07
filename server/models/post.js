const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
	creatorID: String,
	content: String,
	time: Date,
	likes: Array
});

module.exports = mongoose.model("Post", PostSchema);