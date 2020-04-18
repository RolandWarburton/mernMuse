import React, { Fragment, useState, useEffect, Suspense } from "react"
import Navigation from '../Navigation'
import api from '../../../api'
import { v5 as uuidv5 } from 'uuid';

import { useTable, usePagination } from 'react-table'


export const useInput = initialValue => {
	const [value, setValue] = useState(initialValue);

	return {
		value,
		setValue,
		reset: () => setValue(""),
		bind: {
			value,
			onChange: (event) => {
				setValue(event.target.value);
			}
		}
	};
};

function Table({ columns, data }) {
	if (data) {
		// Use the state and functions returned from useTable to build your UI
		const {
			getTableProps,
			getTableBodyProps,
			headerGroups,
			rows,
			prepareRow,
		} = useTable({
			columns,
			data,
		})

		// Render the UI for your table
		return (
			<table {...getTableProps()}>
				<thead>
					{headerGroups.map(headerGroup => (
						<tr {...headerGroup.getHeaderGroupProps()}>
							{headerGroup.headers.map(column => (
								<th {...column.getHeaderProps()}><h3>{column.render('Header')}</h3></th>
							))}
						</tr>
					))}
				</thead>
				<tbody {...getTableBodyProps()}>
					{rows.map((row, i) => {
						prepareRow(row)
						return (
							<tr {...row.getRowProps()}>
								{row.cells.map(cell => {
									return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
								})}
							</tr>
						)
					})}
				</tbody>
			</table>
		)
	} else {
		return <div>loading</div>
	}

}


const Manage = () => {
	// State for track data thats being fetched from the api
	const [tracks, setTracks] = useState();

	// Get form hooks for each field in the form
	const { value: valueTitle, bind: bindTitle, reset: resetTitle } = useInput('');
	const { value: valueDesc, bind: bindDesc, reset: resetDesc } = useInput('');
	const { value: valueImg, bind: bindImg, reset: resetImg } = useInput('');
	const { value: valueMp3, bind: bindMp3, reset: resetMp3 } = useInput('');

	// do something when you complete the form
	const handleSubmit = (evt) => {
		evt.preventDefault();
		const form = new FormData()
		const img = document.querySelector('input[name=img]').files[0]
		const mp3 = document.querySelector('input[name=mp3]').files[0]
		// input.setAttribute("name", uuidv5(input.files[0].name, uuidv5.DNS))
		// input.setValue("name", "t")
		// input.name = "aaa"
		// console.log(input.name)
		form.append("img", new Blob([img], { type: "image/png" }))
		form.append("mp3", new Blob([mp3], { type: "audio/mp3" }))
		form.append("title", valueTitle)
		form.append("desc", valueDesc)
		api.createTrack(form);
		alert(`Submitting Name ${valueTitle}, ${valueDesc}`)
		// resetTitle()
		// resetDesc()
		// resetImg()
		// resetMp3()
	}

	// On component mount fetch all tracks from the api
	useEffect(() => {
		const fetchData = async () => {
			const result = await api.getTracks()
			setTracks(result.data);
			// console.log(tracks)
		}
		fetchData()
	}, []);
	console.log(tracks)

	const columns = React.useMemo(
		() => [
			{
				Header: 'Title',
				accessor: 'title',
				filterable: true
			},
			{
				Header: 'ImgName',
				accessor: 'imgName',
				// row and original are callbacks (i didn't define them)
				Cell: ({ row, original }) => {
					return <div><img height={100} src={"/api/track/image/" + row.values.title} /></div>
					// return <div>test</div>
				},
				filterable: false
			}
		], [])

	return (
		<Fragment>
			<Navigation />
			<div className="formWrapper">
				<form onSubmit={handleSubmit} encType="multipart/form-data" method="POST">
					<fieldset>
						<legend><h3>Enter track information:</h3></legend>
						<label>
							<input type="text" name="name" placeholder="Track name" {...bindTitle} />
						</label>
						<br />
						<label>
							<input type="text" name="desc" placeholder="Description" {...bindDesc} />
						</label>
					</fieldset>

					<fieldset>
					<legend><h3>Submit track data:</h3></legend>
						<label>
							PNG<br />
							<input type="file" name="img" accept="image/*" {...bindImg} />
						</label>
						<br />
						<label>
							MP3:<br />
							<input type="file" name="mp3"  {...bindMp3} />
						</label>
						<br />
					</fieldset>

					<fieldset>
						<input type="submit" value="Submit" />
					</fieldset>

				</form>
			</div>

			<Table columns={columns} data={tracks} />
		</Fragment>
	);
}

export default Manage;