const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
	creatorID: String,
	contributors: Array, // ids
	title: String,
	contentHTML: String,
	time: Date,
	estWords: Number // approximate words in the note
});

// TODO: create noteMessage for note conversation

module.exports = mongoose.model("Note", NoteSchema);