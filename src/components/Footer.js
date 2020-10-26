import React from 'react'
import { footerText } from '../consts';


function Footer() {
    return (
        <div className="footer cool-black" style={{minHeight: 50, userSelect: 'none'}}>
            <p style={{fontSize: 14, marginTop: 14, fontStyle: 'oblique'}}>{footerText}</p>
        </div>
    );
}

export default Footer;
