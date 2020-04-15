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

	// parse the form
	// form.parse(req, (err, fields, files) => {
	// 	if (err) {
	// 		next(err);
	// 		return res.status(400).json({
	// 			success: false,
	// 			error: 'Failed to parse the form data'
	// 		})
	// 	}
	// 	console.log(files)
	// })


	// form.on('field', (fieldName, fieldValue) => {
	// 	console.log(fieldName)
	// 	track.fieldName = fieldValue
	// });


	// form.once('end', () => {
	// 	console.log('Done!');
	// 	track.save()
	// });


	// form.on('data', ({ name, key, value, buffer, start, end, ...more }) => {
	// 	console.log("anything !")
	// 	if (name === 'partBegin') {
	// 	}
	// 	if (name === 'partData') {
	// 	}
	// 	if (name === 'headerField') {
	// 	}
	// 	if (name === 'headerValue') {
	// 	}
	// 	if (name === 'headerEnd') {
	// 	}
	// 	if (name === 'headersEnd') {
	// 	}
	// 	if (name === 'field') {
	// 		console.log('field name:', key);
	// 		console.log('field value:', value);
	// 	}
	// 	if (name === 'file') {
	// 		console.log('file:', key, value);
	// 	}
	// 	if (name === 'fileBegin') {
	// 		console.log('fileBegin:', key, value);
	// 	}
	// });



	// 	// add the uuid to the fields to pass into the Track schema
	// 	// const uuid = uuidv5(files.image.name, uuidv5.DNS)
	// 	// fields.imgName = uuid + ".png"

	// 	const track = new Track()
	// 	track.img.data = files.image
	// 	track.img.contentType = "image/png";
	// 	console.log(track)
	// 	track.save()



	// 	// console.log(files)
	// 	// track.img.data = fs.readFileSync(files.image.path)
	// 	// track.img.data= Binary(files.image);
	// 	// console.log(files)

	// 	// track.img.contentType = "image/png";
	// 	// track
	// 	// 	.save()
	// 	// 	.then(() => {
	// 	// 		return res.status(201).json({
	// 	// 			success: true,
	// 	// 			id: track._id,
	// 	// 			title: track.title,
	// 	// 			desc: track.desc,
	// 	// 			imgName: track.uuid,
	// 	// 			message: "success!"
	// 	// 		})
	// 	// 	})
	// 	// 	.catch((err) => {
	// 	// 		return res.status(400).json({
	// 	// 			success: false,
	// 	// 			err
	// 	// 		})
	// 	// 	})

	// });

	// form.on('field', (fieldName, fieldValue) => {
	// 	values.fieldName = fieldValue;
	// 	// console.log(form)
	// 	// form.emit('data', { name: 'field', key: fieldName, value: fieldValue });
	// });

	// form.on('file', (filename, file) => {
	// 	// console.log(file)
	// 	// const track = new Track({img: {data: file, type: "image/png"}})
	// 	// track.save()
	// 	// form.emit('data', { name: 'file', key: filename, value: file });
	// });

	// console.log(values)
	// console.log(track)

	// console.log(fields)
	// const track = new Track(fields)

	// if (!track) {
	// 	return res.status(400).json({ success: false, error: err })
	// }


	// Rename the file when saving it
	// form.on('fileBegin', function (name, file, files) {
	// 	console.log(files)
	// 	file.path = form.uploadDir + "/" + uuidv5(file.name, uuidv5.DNS) + ".png";
	// })



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
					.json({ success: false, error: `track not found` })
			}
			return res.status(200).json({ success: true, data: track })
		})
		.catch(err => console.log(err))
}

getTracks = async (req, res) => {
	await Track
		.find({}, (err, tracks) => {
			if (err) {
				return res.status(400).json({ success: false, error: err })
			}
			if (!tracks.length) {
				return res
					.status(404)
					.json({ success: false, error: `Tracks not found` })
			}
			return res.status(200).json({ success: true, data: tracks })
		})
		.catch(err => console.log(err))
}

getTrackImgById = async (req, res) => {
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
			res.status(200).send(new Buffer.from(track.img.data, 'binary'))
		})
		.catch((err) => console.log(err))
}

getTrackMp3ById = async (req, res) => {
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
			res.status(200).send(new Buffer.from(track.mp3.data, 'binary'))
		})
		.catch((err) => console.log(err))
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
					.json({ success: false, error: `Track not found` })
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
	getTrackMp3ById
}