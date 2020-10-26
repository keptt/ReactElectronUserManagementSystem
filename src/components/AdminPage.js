import React, { useState, useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next'; //{ BootstrapTable, TableHeaderColumn }
import Button from 'react-bootstrap/Button';

const { ipcRenderer, remote } = window.require('electron');

// const products = [];

// function addProducts(quantity) {
//   const startId = products.length;
//   for (let i = 0; i < quantity; i++) {
//     const id = startId + i;
//     products.push({
//         username: id,
//         block: 'Item name ' + id,
//         restrictedPwd: 2100 + i,
//         admin: 2100 + i,
//         creationDt: 2100 + i
//     });
//   }
// }

// addProducts(5);

const sortOptions = [{
    dataField: 'creationDt',  // default sort column name
    order: 'desc'  // default sort order
}];


function AdminPage() {
    const [currentRow, setCurrentRow]   = useState({});
    const [allRows, setAllRows]         = useState([]);

    const selectRow = {
        mode: 'radio',
        clickToSelect: true,
        onSelect: (row, isSelect, rowIndex, e) => {
            setCurrentRow({
                username: row.username
                , block: row.block
                , restrictedPwd: row.restrictedPwd
                , admin: row.admin
                , creationDt: row.creationDt
            });
            // console.log(row);
            // console.log(isSelect);
            // console.log(rowIndex);
            // console.log(e);
        }
    };

    useEffect(() => {
        console.log('sending users:ready');
        ipcRenderer.send('users:ready');
        ipcRenderer.on('users:received', (e, payload) => {
            console.log('settig all rows');
            setAllRows(payload.users);
        });

        ipcRenderer.on('user:deleted', (e, payload) => {
            ipcRenderer.send('users:ready');
            // setAllRows(allRows.filter(el => el.username !== payload.username));
        });

        ipcRenderer.on('user:added', (e, payload) => {
            ipcRenderer.send('users:ready');
            ipcRenderer.send('putwindow:shut');
            // console.log('user added received', payload);
            // console.log(allRows.concat([payload]));
            // console.log('[payload]:', [payload]);
            // console.log('allRows:', obj.allRows.allRows);
            // setAllRows(obj.allRows.concat([payload]));
        });

        ipcRenderer.on('user:edited', (e, payload) => {
            ipcRenderer.send('users:ready');
            ipcRenderer.send('putwindow:shut');
            setCurrentRow(payload);
            // setAllRows(allRows.filter(el => el.username !== payload.oldElement.username).concat([payload.newElement]));
        });
    }, []);


    const deleteUser = () => {
        ipcRenderer.send('user:delete', currentRow.username);
    }


    const editUser = () => {
        ipcRenderer.send('user:edit', {
            username:       currentRow.username
            , block:        (currentRow.block.toLowerCase() === 'yes' ? true : false)
            , restrictedPwd:(currentRow.restrictedPwd.toLowerCase() === 'yes' ? true : false)
            , admin:        (currentRow.admin.toLowerCase() === 'yes' ? true : false)
            , creationDt:   currentRow.creationDt
        });
    }


    const addUser = () => {
        ipcRenderer.send('user:add');
    }


    const disableEdit = () => {
        return JSON.stringify(currentRow) === JSON.stringify({})
    }


    const disableDelete = () => {
        if (JSON.stringify(currentRow) === JSON.stringify({})) {
            return true;
        }
        return (currentRow.admin.toLowerCase() === 'yes' ? true : false);
    }

    const columns = [{
            dataField: 'username'
            , text: 'Username'
            , sort: true
        }, {
            dataField: 'block'
            , text: 'Block'
        }, {
            dataField: 'restrictedPwd'
            , text: 'Restricted Password'
        }, {
            dataField: 'admin'
            , text: 'Admin'
        }, {
            dataField: 'creationDt'
            , text: 'Date Created'
            , sort: true
    }];

    //   const columns = [{
    //     dataField: 'id',
    //     text: 'Product ID'
    //   }, {
    //     dataField: 'name',
    //     text: 'Product Name'
    //   }, {
    //     dataField: 'price',
    //     text: 'Product Price'
    //   }];

    //   const selectRow = {
    //     mode: 'radio',
    //     clickToSelect: true
    // };


    return (remote.getGlobal('sharedObj') && remote.getGlobal('sharedObj').loggedUser && remote.getGlobal('sharedObj').loggedUser.admin) ? (
        <div style={{minHeight: '100vh'}}>
            <div className="cool-black header">
                <Button variant="success" style={{marginRight: '1%'}} onClick={addUser} >Add</Button>{' '}
                <Button variant="primary" style={{marginRight: '1%'}} onClick={editUser} disabled={disableEdit()}>Edit</Button>{' '}
                <Button variant="danger" style={{marginRight: '1%'}} onClick={deleteUser} disabled={disableDelete()}>Delete</Button>{' '}
            </div>
            <div style={{marginBottom: 50}}>
                <BootstrapTable data={ allRows } striped={ true } hover={ true } condensed={ false } defaultSorted={ sortOptions }
                                selectRow={ selectRow } keyField='username' columns={columns}>
                </BootstrapTable>
            </div>
        </div>
    ): 'Permission denied';
}

export default AdminPage;


/* eslint max-len: 0 */
// import React from 'react';
// import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

// const jobs = [];
// const jobTypes = [ 'A', 'B', 'C', 'D' ];

// function addJobs(quantity) {
//   const startId = jobs.length;
//   for (let i = 0; i < quantity; i++) {
//     const id = startId + i;
//     jobs.push({
//       id: id,
//       name: 'Item name ' + id,
//       type: 'B',
//       active: i % 2 === 0 ? 'Y' : 'N'
//     });
//   }
// }

// addJobs(5);


// function MainPage() {
//     return (
//         <div>
//             <BootstrapTable data={ jobs } insertRow={ true }>
//                 <TableHeaderColumn dataField='id' isKey={ true } autoValue={ true }>Job ID</TableHeaderColumn>
//                 <TableHeaderColumn dataField='name' editable={ { type: 'textarea' } }>Job Name</TableHeaderColumn>
//                 <TableHeaderColumn dataField='type' editable={ { type: 'select', options: { values: jobTypes } } }>Job Type</TableHeaderColumn>
//                 <TableHeaderColumn dataField='active' editable={ { type: 'checkbox', options: { values: 'Y:N' } } }>Active</TableHeaderColumn>
//             </BootstrapTable>
//         </div>
//     )
// }

// export default MainPage



