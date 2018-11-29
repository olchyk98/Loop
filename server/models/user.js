const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	name: String,
	login: String,
	password: String,
	avatar: String,
	description: String,
	waitingFriends: Array,
	friends: Array,
	authTokens: Array
});

module.exports = mongoose.model("User", UserSchema);