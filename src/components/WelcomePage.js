import React from 'react'

const { remote } = window.require('electron');

function WelcomePage() {
    return (
        <div style={{height: '100vh'}}>
            <div className="cool-black header" style={{padding: 0, height: 60}}>
                <img style={{width: 70, height: 50, marginTop: 10}} src="/img/pika-gif.gif"></img>
            </div>
            <div style={{alignItems: 'center', alignContent: 'center', textAlign: 'center', marginTop: '20%'}}>
                <h1 style={{fontWeight: 'bold'}} className="cool-green-dark">WELCOME!</h1>
                <h3>Glad to see you, {(remote.getGlobal('sharedObj') && remote.getGlobal('sharedObj').loggedUser && remote.getGlobal('sharedObj').loggedUser.username) || 'friend'}, in the system!</h3>
                <h6 className="cool-blue">From government with love {'<3'}</h6>
            </div>
        </div>
    );
}

export default WelcomePage
