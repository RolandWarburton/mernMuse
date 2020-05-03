import React, { Fragment, useState, useEffect, useRef } from "react"

const drawButton = function (ctx) {
	// circle
	ctx.beginPath();
	ctx.fillStyle = "blue";
	ctx.lineWidth = 10;
	ctx.arc(50, 50, 30, 0, Math.PI * 2, false);
	ctx.fill()

	// play triangle
	ctx.beginPath();
	ctx.fillStyle = "white";
	ctx.moveTo(40, 30)
	ctx.lineTo(70, 50)
	ctx.lineTo(40, 70)
	ctx.lineTo(50, 50)
	ctx.fill()
}

const orange = "#FFA500"
const blue = "#00FFFF"
const white = "#FFF"

const TrackCanvas = (match) => {
	// an audio spectrum thats silent
	// used as a placeholder until the actual spectrum data is loaded
	const noSound = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

	// make react references for the track and canvas
	// the references are set in the html: <canvas ref={canvasRef} />
	// now you can magically conjure the reference to the object with canvasRef.current
	const canvasRef = useRef(null);
	const trackRef = useRef(null);

	// set all the hooks...

	// how far the song has progressed (in bars)
	const [barProgress, setBarProgress] = useState(0);
	// how far the song has progressed (in seconds)
	const [trackProgress, setTrackProgress] = useState(1);
	const [mouseX, setMouseX] = useState(0);
	const [playing, setPlaying] = useState(false);
	// the array of values for the spectrum bar. initially all 0s
	const [spectrum, setSpectrum] = useState(noSound);

	// set the canvas size ONCE on load (using ,[])
	useEffect(() => {
		// get the reference to the canvas
		const canvas = canvasRef.current

		// set the canvas size
		canvas.width = 600;
		canvas.height = 50;

		// go and fetch the spectrum data for the track
		fetch(`/api/track/spectrum/${match.id}`)
			.then((d) => {
				// data is fetched and then json is returned
				return d.json()
			})
			.then((d) => {
				// once the json data has been parsed set the spectrum data
				setSpectrum(d.spectrum)
			});
	}, [])

	// triggered by the <canvas> onDown
	// updates the tracks progress (the time of the track)
	const handleTrackOnProgress = () => {
		const track = trackRef.current
		const canvas = canvasRef.current

		const mouseProgress = mouseX / canvas.width;
		const trackProgress = Math.floor(mouseProgress * track.duration)

		if (trackProgress > 0 && trackProgress < track.duration) {
			track.currentTime = trackProgress;
		}

		// keep track of the progress in the component state
		// currently not actually used for anything (but good to have)
		// ? planning to use it for a track progress in seconds display
		setTrackProgress(trackProgress)
	};

	// redraw the bar when it needs to be redrawn
	// triggers on mouse change or track time changes
	useEffect(() => {
		drawBar()
	}, [mouseX, barProgress, spectrum])

	// keep track of if the song is playing or paused
	// the setPlaying(!playing) hook will toggle between play/pause
	// and automatically play or pause the track based on its state
	useEffect(() => {
		// get the track
		// console.log(trackRef.current)
		// console.log(document.getElementById(match.id))
		const track = trackRef.current
		// const track = track

		// if supposed to be playing then play it
		if (playing) track.play()
		else track.pause()
	}, [playing])

	// on the canvas mouse down the track progress is updated
	// this triggers trackProgress to handle the tracks new time
	useEffect(() => {
		const track = trackRef.current

		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')

		// set the time to between 0 and the length of the track based on the mouse X
		const mouseProgress = mouseX / canvas.width;
		// get the tracks new progress in seconds based on where the mouse is 
		const trackProgress = Math.floor(mouseProgress * track.duration)

		if (trackProgress > 0 && trackProgress < track.duration) {
			track.currentTime = trackProgress;
		} else {
			// this usually triggers on the songs load because its not ready yet
			// console.log("something went wrong. the song is out of range")
		}

	}, [trackProgress])

	// update the bars progress as the track progresses
	// this is called by the <audio /> tag and is called every song tick
	const handleTrackTimer = () => {
		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')

		const track = trackRef.current;
		const soundProgress = (track.currentTime != 0) ? track.currentTime / track.duration : 0
		const barProgress = Math.floor(spectrum.length * soundProgress)

		setBarProgress(barProgress)

		drawBar()
	}

	// draw the bars
	const drawBar = () => {

		// get the canvas reference (reacts useRef reference to the <canvas> element)
		const canvas = canvasRef.current;

		// get the context for drawing on the canvas
		const ctx = canvas.getContext('2d');

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		// set the gap between bars
		const barGap = 1 + (canvas.width / spectrum.length) / 4
		// set the length of a bar
		const barLength = canvas.width / spectrum.length - barGap
		// get the aboslute space between each bar
		const barSpace = canvas.width / spectrum.length

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		// draw bar that HAS played already
		for (let i = 0; i < barProgress; i++) {
			ctx.fillStyle = blue

			const x = i * barSpace
			const y = canvas.height
			const height = - 1 + (spectrum[i] * canvas.height)
			// ctx.fillRect(x, y, barLength, height);
			ctx.fillRect(x, y, barLength, height);
		}

		// draw bar that HAS NOT played
		for (let i = barProgress; i < spectrum.length; i++) {
			ctx.fillStyle = white

			// if the mouse is past this bar then draw it orange
			if (mouseX > (i * barSpace)) {
				ctx.fillStyle = orange
			}

			const x = i * barSpace
			const y = canvas.height
			const height = - 1 + (spectrum[i] * canvas.height)
			ctx.fillRect(x, y, barLength, height);
		}
	}

	return (
		<Fragment>
			<a
				id="playTrack"
				onClick={() => {
					setPlaying(!playing)
				}}>
				{playing && "pause" || "play"} the choons
			</a>
			<audio
				ref={trackRef}
				src={"/api/track/sound/" + match.id}
				onTimeUpdate={(event) => {
					handleTrackTimer();
				}}
				id={match.id}
			/>
			<canvas
				ref={canvasRef}
				onMouseMove={(e) => {
					// when the mouse moves...

					// get the 'x' of the element from the left of the window
					const x = e.currentTarget.offsetLeft;
					// normalize x from the left of window to get dx relitive to the canvas
					const dx = e.clientX - x;

					setMouseX(dx);
				}}
				onMouseLeave={(e) => {
					// set mouseX back to 0 to remove the orange shaded bar
					setMouseX(0);
				}}
				onMouseDown={(e) => {
					// update the tracks progress
					handleTrackOnProgress();
				}}
			></canvas>
		</Fragment >
	);
}

export default TrackCanvas;