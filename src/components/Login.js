import React, { useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

import { footerText } from '../consts';
// const config = require('../../public/config');

// import { ipcRenderer } from "electron";
const { ipcRenderer } = window.require('electron');

const eye = <FontAwesomeIcon icon={faEye} />;


function Login(props) {
    const [logginAuthorized, setLogginAuthorized] = useState(false);
    const [error, setError]   = useState(null);
    useEffect(() => {
        // console.log('LOGIN.JS LOGGED IN USER FROM LOCAL STORAGE:', localStorage.getItem('loggeduser'));

        ipcRenderer.on('login:authorized', (e, payload) => {
            // add to localStorage and stuff
            setLoading(false);
            setSubmitted(false);
            setSentToBackEnd(false);
            console.log('authorization response received!', payload);
            if (payload.block) {
                setError('User is blocked. Please contact your administrator');
                return;
            }
            // console.log('authorized!');
            // console.log('LOGGED USER STORED', payload);
            // localStorage.setItem('loggedUser', JSON.stringify(payload));
            // console.log(localStorage.getItem('loggedUser'));
            setLogginAuthorized(true);
        });

        ipcRenderer.on('login:denied', (e, payload) => {
            setLoading(false);
            setSubmitted(false);
            setSentToBackEnd(false);

            // add to localStorage and stuff
            console.log('denied!', payload);
            if (!payload.left) {
                ipcRenderer.send('main:shut');
            }
            setError( (<div>{payload.error}<br/>{ `${payload.left} attempts left`}</div>) );
        });

        ipcRenderer.on('failure:querying', (e, payload) => {
            setLoading(false);
            setSubmitted(false);
            setSentToBackEnd(false);
        });
    }, []);

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading]             = useState(false);
    const [submitted, setSubmitted]         = useState(false);
    const [sentToBackEnd, setSentToBackEnd] = useState(false);
    const [username, setUsername]           = useState(null);
    const [password, setPassword]           = useState('');


    const togglePasswordVisiblity = () => {
        setPasswordVisible(!passwordVisible);
    };

    const setPasswordFieldType = () => {
        return passwordVisible ? "text" : "password";
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setSubmitted(true);

        // stop here if form is invalid
        if (!username || sentToBackEnd) {
            return;
        }

        // set loading to true to display loading wheel gif
        setLoading(true);
        setError(null);

        //! send signal to backend
        console.log('sending signal', username, password);
        ipcRenderer.send('login:request-login', {
                        username
                        , password
        });
        setSentToBackEnd(true);
    }

    return logginAuthorized ? (
        <Redirect
            to={{
                pathname: '/main'
                , state: { from: props.location }
            }}
            from='/'
        />
    ) : (
        <div style={{userSelect: 'none'}}>
            {/* <Form.Label>PKA User Management System</Form.Label> */}
            <h2 className="cool-green rotate" style={{position: 'relative', top: 20, zIndex: 1}}>User Management System</h2>
            <div style={{position: 'relative', zIndex: 2, left: 10}}>
                <img src="/img/pika.png" style={{width: 230, height: 230}}></img>
            </div>
            <Form style={loginFormStyle} onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label className='cool-green'>Username</Form.Label>
                    <Form.Control type="username"
                        placeholder="Enter username"
                        isInvalid={(submitted && !username) ? true : false}
                        onChange={ (e) => setUsername(e.target.value) }
                    />
                    <Form.Text style={{color: 'red'}}>
                        {submitted && !username &&
                                    'Username is required'
                        }
                    </Form.Text>
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                    <Form.Label className='cool-green'>Password</Form.Label>
                    <div style={{display: 'flex'}}>
                        <Form.Control type={setPasswordFieldType()}
                                    placeholder="Enter password"
                                    onChange={ (e) => setPassword(e.target.value) }
                        />
                        <i onClick={togglePasswordVisiblity}
                            style={{marginLeft: 10, marginBottom: 10}}
                        >
                                {eye}
                        </i>
                    </div>
                </Form.Group>
                {/* <Link className="App-link" to="/about"> */}
                <Button variant="primary" type="submit">
                    Submit
                </Button>
                {loading &&
                    <img style={{marginLeft: 10}}
                        src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                }
                <br />
                <p style={{fontSize: 14, marginTop: 14, fontStyle: 'oblique'}}>{footerText}</p>
                {/* </Link> */}
                {error &&
                    <Form.Text style={{color: 'red', fontWeight: 'bold'}}>
                        { error }
                    </Form.Text>
                }
            </Form>
        </div>
    );
}

export default Login;


const loginFormStyle = {
    minWidth: 400
    , position: 'relative'
};
