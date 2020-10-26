import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const { ipcRenderer, remote } = window.require('electron');

const eye = <FontAwesomeIcon icon={faEye} />;


function PutUser() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError]                     = useState(null);
    const [loading, setLoading]                 = useState(false);
    const [submitted, setSubmitted]             = useState(false);

    const [username, setUsername]               = useState('');
    const [updatedUsername, setUpdatedUsername] = useState('');
    const [password, setPassword]               = useState('');
    const [mode, setMode]                       = useState('insert');
    const [block, setBlock]                     = useState(false);
    const [restrictedPwd, setRestrictedPwd]     = useState(false);
    const [admin, setAdmin]                     = useState(false);


    useEffect(() => {
        ipcRenderer.on('putwindow:put-results', () => {
            //!! if no errpr setError(null) else setError(err)
            setLoading(false);
            setSubmitted(false);
        });
        ipcRenderer.on('failure:putwindow-querying', (e, error) => {
            setLoading(false);
            setSubmitted(false);
            setError(error.toString());
        });
        ipcRenderer.on('putwindow:putdata', (e, payload) => {
            console.log('putwindow:putdata, Data received', payload);
            setUsername(payload.username);
            setUpdatedUsername(payload.username);
            setBlock(payload.block);
            setRestrictedPwd(payload.restrictedPwd);
            setAdmin(payload.admin);
            setMode(payload.mode.toLowerCase());
            console.log('---->Payload::', payload);
        });
        ipcRenderer.on('user:edited', (e, payload) => {
            setUsername(payload.newElement.username); // setting current username after successful update
        });
        ipcRenderer.on('user:added', (e, payload) => {
            setUsername(payload.username); // setting current username after successful update
        });
    }, []);


    const togglePasswordVisiblity = () => {
        setPasswordVisible(!passwordVisible);
    };


    const setPasswordFieldType = () => {
        return passwordVisible ? "text" : "password";
    };


    const handleCancel = async () => {
        ipcRenderer.send('putwindow:shut');
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        setSubmitted(true);

        if (!updatedUsername) {
            return;
        }

        setLoading(true);

        console.log('sending putwindow:put...');
        ipcRenderer.send('putwindow:put', {
            updatedUsername
            , username: username || updatedUsername
            , password: password || null
            , block
            , restrictedPwd
            , admin
            , mode
        });
    }

    return (remote.getGlobal('sharedObj') && remote.getGlobal('sharedObj').loggedUser && remote.getGlobal('sharedObj').loggedUser.admin) ? (
        <div className="cool-black" style={{minHeight: '100vh', width: 'auto'}}>
            <Form style={{padding: '5%', paddingTop: 25}} onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label className="cool-green" style={{fontWeight: 'bold'}}>Username</Form.Label>
                    <Form.Control type="username" placeholder="Username..." value={updatedUsername} onChange={(e) => setUpdatedUsername(e.target.value)}
                                    isInvalid={!!error || (submitted && !updatedUsername)} disabled={!!admin} />
                    <Form.Text style={{color: 'red'}}>
                        {submitted && !updatedUsername &&
                                    'Username is required'
                        }
                    </Form.Text>
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                    <Form.Label style={{fontWeight: 'bold'}}>Password</Form.Label>
                    <div style={{display: 'flex'}}>
                        <Form.Control type={setPasswordFieldType()} placeholder="password..." value={password} onChange={(e) => setPassword(e.target.value)} isInvalid={!!error} />
                        <i onClick={togglePasswordVisiblity}
                            style={{marginLeft: 10, marginTop: 8}}
                        >
                            {eye}
                        </i>
                    </div>
                </Form.Group>
                <Form.Group controlId="prop-block">
                    <Form.Check type="checkbox" label="Block" checked={block} onChange={(e) => setBlock(!block) }  disabled={!!admin} />
                </Form.Group>
                <Form.Group controlId="prop-restrpwd">
                    <Form.Check type="checkbox" label="Restrict Password" checked={restrictedPwd} onChange={ (e) => setRestrictedPwd(!restrictedPwd) }/>
                </Form.Group>
                {/* <div style={{color: 'red', height: 40}}>{error || null }</div> */}
                <Button variant="danger" onClick={handleCancel} style={{float: 'right'}}>
                    Cancel
                </Button>
                <Button variant="primary" type="submit" style={{float: 'right', marginRight: 10}}>
                    Save
                </Button>
                {loading &&
                    <div style={{textAlign: 'center', marginTop: 75}}>
                        <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                    </div>
                }
                { error && <div style={{color: 'red', height: 40, textAlign: 'center', marginTop: 75, fontWeight: 'bold'}}>{ error.toString() }</div> }
            </Form>
        </div>
    ) : 'Permission denied';
}

export default PutUser;
