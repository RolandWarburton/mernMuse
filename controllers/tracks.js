const Track = require('../models/Tracks');
const Formidable = require('formidable');
const fs = require('fs');
const util = require('util');
const path = require('path');
const { v5: uuidv5 } = require('uuid');
const FormData = require('form-data');
const Binary = require('mongodb').Binary;
const ffmpeg = require('fluent-ffmpeg');
const mime = require('mime-types')
require('dotenv').config();

// check this one for a progress bar! WOULD BE COOL THO
// https://stackoverflow.com/questions/8359902/how-to-rename-files-parsed-by-formidable
createTrack = (req, res) => {
	console.log("parsing")

	// Heres some other things you can add to formidable:...
	// uploadDir: process.env.ROOT + "/uploads",
	// keepExtensions: true
	const form = new Formidable({ multiples: true, uploadDir: './uploads', keepExtensions: true });
	let fields = {};
	let files = {}

	form
		.on('error', (err) => {
			console.log('err!', err);
			res.writeHead(200, { 'content-type': 'text/plain' });
			res.end(`error:\n\n${util.inspect(err)}`);
		})
		.on('field', (fieldName, fieldValue) => {
			fields = {
				...fields,
				[fieldName]: fieldValue
			}
		})
		.on('fileBegin', function (name, file) {
			//rename the incoming file to the file's name
			file.path = form.uploadDir + "/" + uuidv5(file.path, uuidv5.URL) + "." + mime.extension(file.type);
		})
		.on('file', (filename, file) => {
			files = {
				...files,
				[filename]: file.path
			}
		})
		.on('end', () => {
			// create a new track based on the schema
			const track = new Track({ ...fields, ...files })
			track.save()

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
			return res.status(200).json(tracks)
		})
		.catch(err => console.log(err))
}

getTrackById = async (req, res) => {
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
	res.setHeader('content-type', 'image/png');
	res.setHeader('accept-ranges', 'bytes');
	Track
		.find({ title: req.params.id }, "img")
		.cursor()
		.on('error', (err) => {
			console.log(err);
			res.status(400).json({ success: false, err: err })
		})
		.on('data', (track) => {
			res.status(400).send(fs.readFileSync(track.img))
		})
		.on('end', () => { });
}

// getTrackWaveById = async (req, res) => {
// 	res.setHeader('content-type', 'image/png');
// 	res.setHeader('accept-ranges', 'bytes');
// 	Track
// 		.find({ title: req.params.id }, "mp3")
// 		.cursor()
// 		.on('error', (err) => {
// 			console.log(err);
// 			res.status(400).json({ success: false, err: err })
// 		})
// 		.on('data', (doc) => {
// 			// res.status(200).send(new Buffer.from(doc.img.data, "binary"))
// 		})
// 		.on('end', () => { });
// }

getTrackMp3ById = async (req, res) => {
	res.setHeader('content-type', 'audio/mp3');
	res.setHeader('accept-ranges', 'bytes');

	Track
		.find({ title: req.params.id }, "mp3")
		.cursor()
		.on('error', (err) => {
			console.log(err);
			res.status(400).json({ success: false, err: err })
		})
		.on('data', (track) => {
			const filePath = track.mp3;
			const stat = fs.statSync(filePath);
			const total = stat.size;
			if (req.headers.range) {
				const range = req.headers.range;
				const parts = range.replace(/bytes=/, "").split("-");
				const partialstart = parts[0];
				const partialend = parts[1];

				const start = parseInt(partialstart, 10);
				const end = partialend ? parseInt(partialend, 10) : total - 1;
				const chunksize = (end - start) + 1;
				const readStream = fs.createReadStream(filePath, { start: start, end: end });
				res.writeHead(206, {
					'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
					'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
					'Content-Type': 'video/mp3'
				});
				readStream.pipe(res);
			} else {
				res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mp3' });
				fs.createReadStream(filePath).pipe(res);
			}
		})
		.on('end', () => { });

	// Refer to the docs for how cursors work
	// here https://mongoosejs.com/docs/api.html#query_Query-cursor
	// and here https://thecodebarbarian.com/cursors-in-mongoose-45
}

module.exports = {
	createTrack,
	deleteTrack,
	getTracks,
	getTrackImgById,
	getTrackMp3ById,
	getTrackById
}

// Heres the other way of doing binary transfers
// await Track
// 	.findOne({ title: req.params.id }, 'img', (err, track) => {
// 		if (err) {
// 			return res.status(400).json({ success: false, error: err })
// 		}

// 		if (!track) {
// 			return res
// 				.status(404)
// 				.json({ success: false, error: "Track not found" })
// 		}
// 		res.status(200).send(new Buffer.from(track.img.data, "binary"))
// 	})
// 	.catch((err) => console.log(err))


// fluent ffmpeg options
// 
// .on('start', () => {
// 	console.log('FFMPEG started');
// })
// .on('progress', (progress) => {
// 	console.log('progress:', progress);
// })
// .on('error', error => {
// 	console.log('FFMPEG error:', error);
// 	reject(error.message);
// })
// .on('end', () => {
// 	console.log('FFMPEG is done!');
// })

// if (filename == "image") {
			// 	img = {
			// 		data: fs.readFileSync(file.path),
			// 		contentType: "Buffer"
			// 	}
			// } else {



			// 	ffmpeg()
			// 		.input(file.path)
			// 		.complexFilter(
			// 			[
			// 				`[0:a]aformat=channel_layouts=mono,compand=gain=+2,showwavespic=s=640x120:colors=#A9A9A9[waveform]`
			// 			],
			// 			['waveform']
			// 		)
			// 		.outputOption('-vframes 1')
			// 		.saveToFile(file.path + "_waveformTemp.png")
			// 		.on('end', () => {
			// 			ffmpeg()
			// 				.input(file.path + "_waveformTemp.png")
			// 				.outputOption('-filter:v:0 crop=in_w:in_h/2:0:0')
			// 				.saveToFile(file.path + "_waveform.png")
			// 				.on('end', () => {
			// 					console.log("saving mp3")
			// 					// delete the temp file
			// 					fs.unlink(file.path + "_waveformTemp.png", () => { })

			// 					// read in the stuff
			// 					mp3.spectrum = fs.readFileSync(file.path + "_waveform.png")
			// 				})
			// 		})

			// 	mp3 = {
			// 		location: file.path
			// 	}
			// }