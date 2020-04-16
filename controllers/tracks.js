const Track = require('../models/Tracks');
const Formidable = require('formidable');
const fs = require('fs');
const util = require('util');
const path = require('path');
const { v5: uuidv5 } = require('uuid');
const FormData = require('form-data');
var Binary = require('mongodb').Binary;
var multer = require('multer');
require('dotenv').config();

// check this one for a progress bar! WOULD BE COOL THO
// https://stackoverflow.com/questions/8359902/how-to-rename-files-parsed-by-formidable
createTrack = (req, res) => {
	console.log("parsing")

	// const form = formidable(
	// 	{
	// 		multiples: false,
	// 		uploadDir: process.env.ROOT + "/uploads",
	// 		keepExtensions: true
	// 	}
	// );

	// const form = new formidable.IncomingForm();

	// create a new Track object from the mongoose schema


	const form = new Formidable({ multiples: true });
	let fields = {};
	let img = {};
	let mp3 = {};

	form
		.on('error', (err) => {
			console.log('err!', err);
			res.writeHead(200, { 'content-type': 'text/plain' });
			res.end(`error:\n\n${util.inspect(err)}`);
		})
		.on('field', (fieldName, fieldValue) => {
			// console.log('fieldName:', fieldName);

			fields = {
				...fields,
				[fieldName]: fieldValue
			}
		})
		.on('file', (filename, file) => {
			console.log('filename:', filename);

			// save the image to a file stream buffer which mongodb can accept
			if (filename == "image") {
				img = {
					data: fs.readFileSync(file.path),
					contentType: "Buffer"
				}
			} else {
				mp3 = {
					data: fs.readFileSync(file.path),
					contentType: "Buffer"
				}
			}
		})
		.on('end', () => {
			// create a new track based on the schema
			const track = new Track({ ...fields, mp3, img })
			track.save()
			console.log(track)
			// console.log({...img.mp3})

			console.log('-> post done from "end" event');

			// return 200 and the fields we got
			res.writeHead(200, { 'content-type': 'text/plain' });
			res.end(`received fields:\n\n${util.inspect(fields)}`);
		});

	form.parse(req, () => {
		console.log('-> post done from callback');
	});

}

deleteTrack = async (req, res) => {
	await Track
		.findOneAndDelete({ title: req.params.id }, (err, track) => {
			if (err) {
				return res.status(400).json({ success: false, error: err })
			}

			if (!track) {
				return res
					.status(404)
					.json({ success: false, error: "track not found" })
			}
			return res.status(200).json({ success: true, data: track })
		})
		.catch(err => console.log(err))
}

getTracks = async (req, res) => {
	// const query =  await Track.find({}, 'title')
	// query.exec((err, tracks) => {
	// 	return res.status(200).json({ success: true, data: tracks })
	// })
	await Track
		.find({}, 'title desc', (err, tracks) => {
			if (err) {
				return res.status(400).json({ success: false, error: err })
			}
			if (!tracks.length) {
				return res
					.status(404)
					.json({ success: false, error: "Tracks not found" })
			}
			return res.status(200).json({ success: true, data: tracks })
		})
		.catch(err => console.log(err))
}

getTrackInfoById = async (req, res) => {
	await Track
		.findOne({ title: req.params.id }, (err, track) => {
			if (err) {
				return res.status(400).json({ success: false, error: err })
			}

			if (!track) {
				return res
					.status(404)
					.json({ success: false, error: `Track not found` })
			}
			res.status(200).json({ success: true, data: { title: track.title, desc: track.desc } })
		})
		.catch((err) => console.log(err))
}

getTrackImgById = async (req, res) => {
	await Track
		.findOne({ title: req.params.id }, 'img', (err, track) => {
			if (err) {
				return res.status(400).json({ success: false, error: err })
			}

			if (!track) {
				return res
					.status(404)
					.json({ success: false, error: "Track not found" })
			}
			res.status(200).send(new Buffer.from(track.img.data, "binary"))
		})
		.catch((err) => console.log(err))
}

getTrackMp3ById = async (req, res) => {
	res.setHeader('content-type', 'audio/mp3');
	res.setHeader('accept-ranges', 'bytes');

	Track
	.find({ title: req.params.id }, "mp3")
	.cursor()
	.on('data', (doc) => { 
		// res.setHeader('Content-type', 'audio/mp3');
		res.status(200).send(new Buffer.from(doc.mp3.data, "binary"))
	})
	.on('end', () => { console.log("send some data!"); });
	
	// Refer to the docs for how cursors work
	// here https://mongoosejs.com/docs/api.html#query_Query-cursor
	// and here https://thecodebarbarian.com/cursors-in-mongoose-45
}

getTrackMedia = async (req, res) => {
	await Track
		.findOne({ title: req.params.id }, (err, track) => {
			if (err) {
				return res.status(400).json({ success: false, error: err })
			}

			if (!track) {
				return res
					.status(404)
					.json({ success: false, error: "Track not found" })
			}

			console.log(track)
			return res.status(200).sendFile(path.resolve(process.env.ROOT, "uploads", track.imgName))
			// return res.status(200).json({ success: true, data: track })
		})
		.catch((err) => console.log(err))
}

module.exports = {
	createTrack,
	deleteTrack,
	getTracks,
	getTrackImgById,
	getTrackMp3ById,
	getTrackInfoById
}