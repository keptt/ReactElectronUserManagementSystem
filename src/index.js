import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-bootstrap-table/dist/react-bootstrap-table.min.css';
import { HashRouter as Router, Route } from 'react-router-dom'

import Home from "./App";
import About from "./components/About";
import AdminPage from "./components/AdminPage";
import PutUser from './components/PutUser';
import ChangePassword from './components/ChangePassword';
import WelcomePage from './components/WelcomePage';
import Main from './components/Main';
import PrivateRoute from './components/PrivateRoute';


ReactDOM.render(
    <Router>
        <div>
            <main>
                <Route exact path="/" component={Home} />
                <Route path="/about" component={About} />
                <PrivateRoute path="/adminpage" component={AdminPage} />
                <PrivateRoute path="/main" component={Main} />
                <Route path="/put" component={PutUser} />
                <Route path="/changepwd" component={ChangePassword} />
                <PrivateRoute path="/welcome" component={WelcomePage} />
            </main>
        </div>
    </Router>,
    document.getElementById("root")
);
