import React from "react";

import { footerText } from '../consts';

const { shell } = window.require('electron')


const About = () => {

    const goToLink = (link) => {
        shell.openExternal(link);
    }

    return (
        <div className="about" >
            <img style={{width: 150, height: 150}} src='/img/pika-handwave.png'></img>
            <p style={{fontWeight: 'bold'}}>Author: <span className="cool-blue">Sergey Orlovskiy</span></p>
            <p style={{fontWeight: 'bold'}}>University Group: <span className="cool-blue">BS-71</span></p>
            {/* <Link className ="App-link" to= "/" style={{fontWeight: 'bold'}}>GitHub</Link> */}
            <a className="App-link" onClick={() => goToLink('https://github.com/keptt')} style={{fontWeight: 'bold'}} className="App-link-dark">GitHub</a>
            <p style={{fontSize: 14, marginTop: 14, fontStyle: 'oblique'}}>{footerText}</p>
        </div>
    );
}

export default About;
