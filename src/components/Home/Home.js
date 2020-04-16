import React, { Fragment, useState, useEffect } from "react"
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

export const useDataInput = initialValue => {
	const [value, setValue] = useState(initialValue);

	return {
		value,
		setValue,
		reset: () => setValue(""),
		bind: {
			value,
			onChange: (event) => {
				setValue(event.target.value);
				console.log(event.target.value);
			}
		}
	};
};

function Table({ columns, data }) {
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
							<th {...column.getHeaderProps()}>{column.render('Header')}</th>
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
}


const Home = () => {
	// State for track data thats being fetched from the api
	const [tracks, setTracks] = useState({ data: [] });

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
		form.append("image", new Blob([img], {type: "image/png"}))
		form.append("mp3", new Blob([mp3], {type: "audio/mp3"}))
		form.append("title", valueTitle)
		form.append("desc", valueDesc)
		api.createTrack(form);
		alert(`Submitting Name ${valueTitle}, ${valueDesc}`)
		// resetTitle()
		// resetDesc()
		resetImg()
		resetMp3()
	}

	// On component mount fetch all tracks from the api
	useEffect(() => {
		const fetchData = async () => {
			const result = await api.getTracks()
			setTracks(result.data);
		}
		fetchData()
	}, []);

	const columns = React.useMemo(
		() => [
			{
				Header: 'ID',
				accessor: '_id',
				filterable: true
			},
			{
				Header: 'Title',
				accessor: 'title',
				filterable: true
			},
			{
				Header: 'ImgName',
				accessor: 'imgName',
				// row and original are callbacks (i didn't define them)
				Cell: ({row, original}) => {
					return <div><img height={100} src={"/api/track/image/" + row.values.title} /></div>
					// return <div>test</div>
				},
				filterable: false
			}
			,
			{
				Header: 'Mp3',
				accessor: 'mp3',
				// row and original are callbacks (i didn't define them)
				Cell: ({row, original}) => {
					return <div><audio controls type="audio/mpeg" height={100} src={"/api/track/sound/" + row.values.title} /></div>
					// return <div>test</div>
				},
				filterable: false
			}
		], [])

	return (
		<Fragment>
			<Navigation />
			<h1>Root</h1>
			<form onSubmit={handleSubmit} encType="multipart/form-data" method="POST">
				<fieldset>
					<legend>Track information:</legend>
					<label>
						Name: <input type="text" name="name" {...bindTitle} />
					</label>
					<br />
					<label>
						Description: <input type="text" name="desc" {...bindDesc} />
					</label>
				</fieldset>
				<input type="file" name="img" accept="image/*" {...bindImg} />
				<br />
				<input type="file" name="mp3"  {...bindMp3} />
				<br />
				<input type="submit" value="Submit" />
			</form>

			<Table columns={columns} data={tracks.data} />
		</Fragment>
	);
}

export default Home;