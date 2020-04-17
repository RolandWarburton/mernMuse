import React, { Fragment, useState } from "react"
import Meta from "../Meta"

const TrackInfoBox = ({ match }) => {
	const params = match.params
	console.log(params)
	return (
			<div>
				<p>{params.name}</p>
				<img src={"/api/track/" + params.name}></img>
			</div>
	);
}

export default TrackInfoBox;