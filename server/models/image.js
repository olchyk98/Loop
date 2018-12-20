const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	creatorID: String,
	postID: String,
	url: String,
	time: Date,
	likes: Array,
	targetType: String
});

module.exports = mongoose.model("Image", ImageSchema);