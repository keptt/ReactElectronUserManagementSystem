import React from 'react';
import Alert from 'react-bootstrap/Alert';


function ErrorBox(props) {
    return props.error ? (
        <div style={{ width: '100%', height: '7%'}}>
            <Alert variant="danger">
                {props.error.toString()}
            </Alert>
        </div>
    ) : null;
}

export default ErrorBox;
