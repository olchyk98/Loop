const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	name: String,
	login: String,
	password: String,
	avatar: String,
	cover: String,
	description: String,
	// url: String,
	waitingFriends: Array,
	friends: Array,
	authTokens: Array,
	subscribedTo: Array
});

module.exports = mongoose.model("User", UserSchema);