import React, { Fragment, useState, useEffect, Suspense } from "react"
import Navigation from '../Navigation'
import api from '../../../api'
import { v5 as uuidv5 } from 'uuid';
import Track from "../Track";

const Tracks = ({tracks}) => {
	if (tracks != undefined) {
		return (
			tracks.map((item, i) => {
				console.log('test');
				return <li key={i}>{item.title}</li>
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