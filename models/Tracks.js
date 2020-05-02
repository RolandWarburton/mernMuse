const mongoose = require('mongoose')

const Track = mongoose.Schema({
	title: {
		type: String,
		require: true
	},
	desc: {
		type: String,
		require: true
	},
	imgName: {
		type: String,
		require: true
	},
	img: {
		type: String,
		require: true
	},
	mp3: {
		type: String,
		require: true
	},
	spectrum: {
		type: Array,
		array: Number,
		require: true
	}

}, { collection: 'testCollection' })

module.exports = mongoose.model('Track', Track)