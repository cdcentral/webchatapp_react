/**************************************************************************************************************
 License:
 MIT License
 
 Copyright (c) [2022] [cdcentral]
 
 ***************************************************************************************************************
 
 From source code author: Chris Duran
 
 This project and its source code is free for anyone to use and modify.  Please retain this header and the following links.
 
 This source code can be found in the following youtube video https://youtu.be/7TYL6BPZVmw
 The main channel is https://www.youtube.com/@CDCentral
 Donations are appreciated at https://paypal.me/AncoCentral?country.x=US&locale.x=en_US
 **************************************************************************************************************/

import React from 'react';

import MainPage from './MainPage';
import ChatPage from './ChatPage';
import InviteFriend from './InviteFriend';
import InviteAccepted from './InviteAccepted';
import AboutUs from './AboutUs';
import ContactUs from './ContactUs';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

/*
 * This is the main app component.  Simply creates the Routes that links to Components.
 */
class MainApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // contains user keycloak info passed from parent component.
            appKeycloak: props.parentKeycloak,
            // logout url to be invoked when user selects the Logout URL link, Replace the below with your keycloak url and the redirect_uri you want it to be
            logoutUrl: process.env.REACT_APP_API_LOGOUT_URL + process.env.REACT_APP_SELF_URL
        };

    }

    /***********************************************************
     * Component is loaded/mounted on the page. 
     ***********************************************************/
    componentDidMount() {
        // intentionally blank
        console.log('[MainApp] componentDidMount');
    }

    /***********************************************************
     * Component is unloaded/unmounted from the page.
     ***********************************************************/
    componentWillUnmount() {
        // intentionally blank
    }

    /*****************************************************************
     * HTML to be rendered.	 
     * Documentation on some elements below:
     * - BrowserRouter https://v5.reactrouter.com/web/api/BrowserRouter
     * - Route https://v5.reactrouter.com/web/api/Route
     *
     * This also passes the state keycloak object and the logout URL to the child components.
     *****************************************************************/
    render() {
        return (
                <div>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={ < MainPage logoutUrl = {this.state.logoutUrl}
                                    persistKeycloakObj = {this.props.parentPersistKeycloakMethod} keycloakObj = {this.props.parentKeycloak} / > } />
                            <Route path="ChatPage" element={ < ChatPage logoutUrl = {this.state.logoutUrl}
                                    persistKeycloakObj = {this.props.parentPersistKeycloakMethod} keycloakObj = {this.props.parentKeycloak}
                                    parentChatGroupObj = {this.props.parentChatGroupData} persistParentChatGroupDataMethod = {this.props.persistParentChatGroupDataMethod} / > } />
                            <Route path="InviteFriend" element={ < InviteFriend logoutUrl = {this.state.logoutUrl}
                                    persistKeycloakObj = {this.props.parentPersistKeycloakMethod} keycloakObj = {this.props.parentKeycloak} / > } />
                            <Route path="InviteAccepted" element={ < InviteAccepted keycloakObj = {this.props.parentKeycloak} logoutUrl = {this.state.logoutUrl} / > } />
                            <Route path="AboutUs" element={ < AboutUs logoutUrl = {this.state.logoutUrl} / > } />
                            <Route path="ContactUs" element={ < ContactUs logoutUrl = {this.state.logoutUrl} / > } />
                        </Routes>
                    </BrowserRouter>
                </div>
                );
           }
       }
       export default MainApp;