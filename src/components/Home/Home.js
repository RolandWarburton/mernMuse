import React, { Fragment, useState, useEffect, Suspense, useRef } from "react"
import Navigation from '../Navigation'
import { Link } from "react-router-dom"
import api from '../../../api'
import { v5 as uuidv5 } from 'uuid';
import Track from "../Track";
import { jsx, css } from '@emotion/core'
import styled from '@emotion/styled'

const TrackArt = styled.div`	
	background: url(/api/track/image/${props => props.background});
	background-position: center center;
	background-size: cover;
	height: 200px;
	width: 200px;
	border-radius: 200px 200px 0 200px;
	transition: height 0.2s ease-out;
	color: white;
`

const TrackBox = styled.div`
	display: grid;
	border-radius: 200px 0 0 200px;
	grid-template-columns: auto 1fr;
	grid-template-rows: 1;
	justify-content: flex-start;
	margin: 0.5rem 0;
	background-color: #1f1f1f;
	transition: background-color 0.1s ease-out;
	&:hover {
		background-color: #2b2b2b;
	}
`

const TrackContent = styled.div`
	display: grid;
	padding: 1rem 1rem 0 1rem;
	grid-template-rows: 1fr 1fr;
`

const TrackSpectrum = styled.div`
	background: url(https://i.imgur.com/ZoTI40Z.png);
	// background-position: center center;
	// background-size: cover;
	// justify-content: flex-end;
	position: relative;
	bottom: 0px;
	width: 100%;
	height: 50px;
`


const Tracks = ({ tracks }) => {
	if (tracks != undefined) {
		const themes = []
		tracks.map(t => themes.push(encodeURIComponent(t.title)))
		return (
			tracks.map((track, i) => {
				return (
					<TrackBox key={i}>
						<TrackArt background={themes[i]} />
						<TrackContent>
							<h1>{track.title}</h1>
							{track.desc}
							{/* the actual audio player */}
							{/* <audio controls="controls" src={"/api/track/sound/" + track.title}/> */}
							<TrackSpectrum />
						</TrackContent>
					</TrackBox >
				)
			})
		)
	} else {
		return (<div></div>)
	}
}

const Home = () => {
	// State for track data thats being fetched from the api
	const [tracks, setTracks] = useState();

	// On component mount fetch all tracks from the api
	useEffect(() => {
		const fetchData = async () => {
			const result = await api.getTracks()
			setTracks(result.data);
		}
		fetchData()
	}, []);



	return (
		<Fragment>
			<Navigation />
			<Suspense fallback="loading..."><Tracks tracks={tracks} /></Suspense>
		</Fragment>
	);
}

export default Home;