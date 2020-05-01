import React, { Fragment, useState } from "react"
import Meta from "../Meta"
import TrackCanvas from "./trackCanvas"

const Track = ({ match }) => {
	const params = match.params
	console.log(params)
	return (
		<Fragment>
			<Meta pageName={params.name} />
			<h1>Track</h1>
			<div>
				<p>{params.name}</p>
				<TrackCanvas />
			</div>
		</Fragment>
	);
}

export default Track;