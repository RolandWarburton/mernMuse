import React from 'react';
import { useTable, usePagination } from 'react-table'

const Table = function Table({ columns, data })  {
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

export default Table;