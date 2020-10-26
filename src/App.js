import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import './App.css';

import Login from './components/Login';
import ErrorBox from './components/ErrorBox';
// import bootstrap from 'bootstrap';


const { ipcRenderer } = window.require('electron');

function App() {
    const [error, setError] = useState(null);
    useEffect(() => {
        setError(null);

        ipcRenderer.on('failure:startup', (e, payload) => {
            setError(payload);
        });

        ipcRenderer.on('failure:querying', (e, payload) => {
            console.log('querying error:', e.name + ' ' + e.message);
            console.log('querying error obj:', e, payload);
            setError(payload);
        });

        ipcRenderer.on('status:logout', (e) => {
            console.log('Removing loggedUser <<<<<<<<<<<<<<<<<<<<<<<<<<');
            // localStorage.removeItem('loggedUser');
            ipcRenderer.send('mainwindow:reload');
        });
    }, []);
    return (
        <div className="App">
            <ErrorBox error={error}/>
            <header className="App-header">
                {/* <Link className="App-link" to="/about">Link to the About Page</Link>
                <Link className="App-link" to="/main">Link to the Main Page</Link>
                <Link className="App-link" to="/put">Link to the Put User</Link>
                <Link className="App-link" to="/changepwd">Link to the Change Pwd</Link>
                <Link className="App-link" to="/welcome">Link to the Welcome Page</Link> */}
                <Login />
            </header>
        </div>
    );
}

export default App;
