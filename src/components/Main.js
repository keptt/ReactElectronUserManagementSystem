import React from 'react';
import AdminPage from './AdminPage';
import WelcomePage from './WelcomePage';
import Footer from './Footer';


const { remote } = window.require('electron');


export default function Main() {
    return (
    <div>
        {(remote.getGlobal('sharedObj') && remote.getGlobal('sharedObj').loggedUser && remote.getGlobal('sharedObj').loggedUser.admin) ? (
            <AdminPage />
        ) : ((remote.getGlobal('sharedObj') && remote.getGlobal('sharedObj').loggedUser) ? (<WelcomePage />) : 'Permission denied') }
        <Footer />
    </div>);
}
