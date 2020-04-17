import React, { Fragment, useState, useEffect, Suspense } from "react"
import Navigation from '../Navigation'
import api from '../../../api'
import { v5 as uuidv5 } from 'uuid';
import Track from "../Track";
import { jsx, css } from '@emotion/core'
import styled from '@emotion/styled'

const TrackWrapper = styled.div`
	display: grid;
	grid-template-columns: auto auto auto;
	grid-template-rows: auto;
	justify-content: space-around;
	box-sizing: border-box;
	&:hover: {
		background: 'lightgreen'
	}
	//   background-color: red;
`

const TrackContent = styled.div`
	// background-color: rgba(0,0,0,0.9);
	background: linear-gradient(to bottom, black, rgba(0,0,0,0.9) 90%, transparent);
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	height: 60px;
	padding: 10px;
	width: 300px;
	transition: height 0.2s ease-out;
	color: white;
`

const TrackBox = styled.div`
	background: url(/api/track/image/${props => props.background});
	margin: 20px;
	border-radius: 0 0 5px 5px;
	background-position: center center;
	background-size: cover;
	height: 300px;
	&:hover ${TrackContent} {
		height: 80px;
	}
	&hover {
		background-size(200%);
	}
`

const DescriptionBox = styled.span`
	white-space: nowrap;
	text-overflow: ellipsis;
	width: 200px;
	display: block;
	overflow: hidden
`


const Tracks = ({ tracks }) => {
	if (tracks != undefined) {
		const themes = []
		tracks.map(t => themes.push(encodeURIComponent(t.title)))
		console.log(themes)

		return (
			tracks.map((track, i) => {
				// return <li key={i}>{item.title}</li>
				const url = encodeURIComponent(track.title)
				return (
					<TrackBox background={themes[i]} key={i}>
						<TrackContent>
							<h2>{track.title}</h2>
							<DescriptionBox>
								{track.desc}
							</DescriptionBox>

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
			<TrackWrapper>
				<Suspense fallback="loading..."><Tracks tracks={tracks} /></Suspense>
			</TrackWrapper>
		</Fragment>
	);
}

export default Home;