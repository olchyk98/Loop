const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
	creatorID: String,
	contributors: Array, // ids
	title: String,
	content: String,
	time: Date
	estWords: Number // estimate words in the note
});

module.exports = mongoose.model("Note", NoteSchema);