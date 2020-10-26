import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
const { ipcRenderer, remote } = window.require('electron');
//! Try import { ipcMani } form 'electron' and requrire without window

const eye = <FontAwesomeIcon icon={faEye} />;


function ChangePassword() {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const [newPassword, setNewPassword]             = useState('');
    const [oldPassword, setOldPassword]             = useState('');
    const [reEnteredPassword, setReEnteredPassword] = useState('');

    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState(null);
    const [allError, setAllError]   = useState(null);
    const [newError, setNewError]   = useState(null);
    const [oldError, setOldError]   = useState(null);

    useEffect(() => {
        ipcRenderer.on('password:changed', () => {
            setLoading(false);
            ipcRenderer.send('pwdwindow:shut');
        });

        ipcRenderer.on('failure:password-changing', (e, payload) => {
            setLoading(false);
            setError(payload.toString());
        });
    }, []);


    useEffect(() => {
        if (newPassword && oldPassword && (newPassword === oldPassword || reEnteredPassword === oldPassword)) {
            setAllError('Old Password and New Password cannot be the same');
        }
        else if (newPassword !== reEnteredPassword) {
            setNewError('New and Re-entered passwords don\'t match');
        }
        else {
            setAllError(null);
            setNewError(null);
            setOldError(null);
        }
    }, [newPassword, oldPassword, reEnteredPassword]);


    const togglePasswordVisiblity = () => {
        setPasswordVisible(!passwordVisible);
    };


    const setPasswordFieldType = () => {
        return passwordVisible ? "text" : "password";
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (newPassword === oldPassword || reEnteredPassword === oldPassword) {
            setAllError('Old Password and New Password cannot be the same');
            return;
        }

        ipcRenderer.send('password:change', {username: ((remote.getGlobal('sharedObj') && remote.getGlobal('sharedObj').loggedUser && remote.getGlobal('sharedObj').loggedUser.username) || '')
                                        , password: newPassword});
    };


    const handleCancel = () => {
        ipcRenderer.send('pwdwindow:shut');
    };


    return (
        <div>
            <Form style={{margin: '5%', paddingTop: 8}} onSubmit={handleSubmit}>
                <Form.Group controlId="prop-oldpwd">
                    <Form.Label style={{fontWeight: 'bold'}}>Old Password</Form.Label>
                    <Form.Control type={setPasswordFieldType()} placeholder="Old Password..." value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                                    isInvalid={ oldError ||  allError }
                    />
                </Form.Group>
                <Form.Group controlId="prop-newpwd">
                    <Form.Label style={{fontWeight: 'bold'}}>New Password</Form.Label>
                    <Form.Control type={setPasswordFieldType()} placeholder="New Password..." value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    isInvalid={ newError ||  allError }
                    />
                </Form.Group>
                <Form.Group controlId="prop-renewpwd">
                    <Form.Label style={{fontWeight: 'bold'}}>Re-enter New password</Form.Label>
                    <Form.Control type={setPasswordFieldType()} placeholder="Re-enter..." value={reEnteredPassword} onChange={(e) => setReEnteredPassword(e.target.value)}
                                    isInvalid={ newError ||  allError }
                    />
                    <i onClick={togglePasswordVisiblity}
                        style={{float: 'left', marginLeft: 10, marginTop: 5}}
                    >
                        {eye}
                    </i>
                </Form.Group>
                <Button variant="danger" style={{float: 'right'}} onClick={handleCancel} >
                    Cancel
                </Button>
                <Button variant="primary" type="submit" style={{float: 'right', marginRight: 10}} disabled={(allError || newError || oldError)}>
                    Save
                </Button>
                {loading &&
                    <div style={{textAlign: 'center', marginTop: 75}}>
                        <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                    </div>
                }
                { (allError || newError || oldError || error) && <div style={{color: 'red', height: 40, textAlign: 'center', marginTop: 75, fontWeight: 'bold'}}>{ (allError || newError || oldError || error).toString() }</div> }
            </Form>
        </div>
    );
}

export default ChangePassword;

