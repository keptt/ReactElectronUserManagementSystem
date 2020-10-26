/*
    Component that encloses the route to a url and only shows it to logged in users (logged in users have access token and user object in local storage)
    It redirects to login page if user is not already logged in
*/
import React, { Component } from 'react';
import { Redirect, Route } from 'react-router-dom';

const { remote } = window.require('electron');


const PrivateRoute = ({ component: Component, props_: props_, ...rest }) => {
        return (<Route
            {...rest}
            render={ props => {
                return remote.getGlobal('sharedObj') && remote.getGlobal('sharedObj').loggedUser ? (
                    <Component {...props} {...props_} />
                ) : (
                    <Redirect
                        to={{
                            pathname: '/'
                            , state: { from: props.location }
                        }}
                        from='/'
                    />
                )
            }
        }
        />)
    };


export default PrivateRoute;
