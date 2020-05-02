import React, { Fragment, useState, useEffect } from "react"
import Meta from "../Meta"

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
	// TODO clean up all the sound arrays. messy messy uwu
	// const sound = [0, 0.2, 0.2, 0.1, 0.4, 0.3, 0.1, 0.5, 0.2, 0.2, 0.5, 0.3, 0.1, 0, 0.2, 0.1, 0.4, 0.1, 0.1, 0, 0.9, 0.1, 0.2, 0.5, 0, 0.3, 0.3, 0, 0.3, 0.2, 0.1, 0.2, 0.3, 0.5, 0.1, 0.1, 0.5, 0.2, 0.3, 0.9, 0.2, 0.4, 0.5, 0, 0, 0.2, 0.1, 0.5, 0.5, 0.2, 0.2, 0.3, 0.4, 0.3, 0.2, 0.1, 0, 0, 0.4, 0.3, 0.2, 0.3, 0.2, 0.2, 0, 0.3, 0.5, 0, 0.1, 0.2, 0.5, 0.3, 0.3, 0.3, 0.1, 0.3, 0.4, 0.1, 0.3, 0.7, 0.4, 0.2, 0.2, 0.2, 0.4, 0.4, 0.3, 0.3, 0.1, 0.2, 0.3, 0.1, 0.1, 0.3, 0.1, 0.5, 0.1, 0.3, 0.3, 0.1]
	const sound = [-1, -0.1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
	const sound2 = [-0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5]
	const sound3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

	const canvasRef = React.useRef(null);
	const [barProgress, setBarProgress] = React.useState(1);
	const [mouseX, setMouseX] = React.useState(0);
	const [playing, setPlaying] = React.useState(false);
	const [trackProgress, setTrackProgress] = React.useState(1);
	const [trackID, setTrackID] = React.useState("track");
	const [spectrum, setSpectrum] = React.useState(sound3);

	// set the canvas size ONCE on load (using ,[])
	useEffect(() => {
		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')
		canvas.width = 600;
		canvas.height = 50;

		drawBar(canvas, ctx)

		setTrackID(match.id)

		fetch(`/api/track/spectrum/${match.id}`)
			.then((d) => {
				return d.json()
			})
			.then((d) => {
				// setSpectrum(d.spectrum)
				setSpectrum(d.spectrum)
				console.log("updated the spectrum")
				drawBar(canvas, ctx)
			})
		}, [])
		
		useEffect(() => {
			const canvas = canvasRef.current
			const ctx = canvas.getContext('2d')
			console.log(spectrum)
		drawBar(canvas, ctx)
	}, [spectrum])

	// redraw the bar when it needs to be redrawn
	useEffect(() => {
		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')

		drawBar(canvas, ctx)
	}, [mouseX, barProgress])

	useEffect(() => {
		const track = document.getElementById(trackID)
		if (playing) track.play()
		else track.pause()
	}, [playing])

	useEffect((e) => {
		const track = document.getElementById(trackID)
		// console.log("setting track progress")

		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')

		// set the time to between 0 and the length of the track based on the mouse X
		const mouseProgress = mouseX / canvas.width;
		const trackProgress = Math.floor(mouseProgress * track.duration)

		if (trackProgress > 0 && trackProgress < track.duration) {
			track.currentTime = trackProgress;
		} else {
			// console.log("something went wrong. the song is out of range")
		}

		drawBar(canvas, ctx)
	}, [trackProgress])

	// update the bars progress as the track progresses
	const handleTrackTimer = (e) => {
		const canvas = canvasRef.current
		const ctx = canvas.getContext('2d')

		const track = e.target;
		const soundProgress = (track.currentTime != 0) ? track.currentTime / track.duration : 0
		const barProgress = Math.floor(sound.length * soundProgress)

		setBarProgress(barProgress)

		drawBar(canvas, ctx)
	}

	// draw the bar
	const drawBar = (canvas, ctx) => {
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		// console.log(spectrum)

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
			<a id="playTrack" onClick={() => { setPlaying(!playing) }}>{playing && "pause" || "play"} the choons</a>
			<audio src={"/api/track/sound/" + trackID}
				onTimeUpdate={(e) => {
					handleTrackTimer(e)
				}}
				id={trackID}

			/>
			<canvas
				ref={canvasRef}
				onMouseMove={(e) => {
					const x = e.currentTarget.offsetLeft;
					const dx = e.clientX - x;

					setMouseX(dx);
				}}
				onMouseLeave={(e) => {
					setMouseX(0);
				}}
				onMouseDown={(e) => {
					const track = document.getElementById(trackID)
					const canvas = canvasRef.current
					const ctx = canvas.getContext('2d')

					const mouseProgress = mouseX / canvas.width;
					const trackProgress = Math.floor(mouseProgress * track.duration)

					if (trackProgress > 0 && trackProgress < track.duration) {
						track.currentTime = trackProgress;
					}

					setTrackProgress(track.duration)
					console.log(`track progress ${trackProgress}`)

					drawBar(canvas, ctx)
				}}
			></canvas>
		</Fragment >
	);
}

export default TrackCanvas;