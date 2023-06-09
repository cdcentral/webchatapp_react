import React  from 'react';

import {  Link } from "react-router-dom";
import './css/InviteAccepted.css';

// test email link to use on front end (reactjs which will send a request here).
// http://localhost:3000/InviteAccepted/?rid=1

/*
 This class will have a GUI to have the user send an invite request to another colleague.
 */
class InviteAccepted extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: new Date(),
            keycloakBaseUrl: process.env.REACT_APP_API_KEYCLOAK_URL,
            successfulLogin: false,
            appKeycloak: props.keycloakObj,
            logoutUrl: props.logoutUrl,
            webappEndpoint: process.env.REACT_APP_API_JAVA_BACKEND_BASE_URL + '/react_chat_app_backend/InviteRequest',
            inviteAcceptedEndpoint: process.env.REACT_APP_API_JAVA_BACKEND_BASE_URL + '/InviteAccepted',
            userInvite: '',
            debugCounter: 0,
            intervalId: 0,
            currentCount: 0,
            userAuthenticated: false
        };

        // Defining methods in this class

        this.handleChange = this.handleChange.bind(this);

        this.loadData = this.loadData.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
        this.unhandleLoad = this.unhandleLoad.bind(this);
        this.userLoginRegister = this.userLoginRegister.bind(this);
        this.updateAcceptedStatus = this.updateAcceptedStatus.bind(this);
    }

    /**************************************************************************
     *  Supposed to be called once when the page is loaded.
     **************************************************************************/
    componentDidMount() {
        console.log('[InviteAccepted] componentDidMount ...');
        window.addEventListener('load', this.handleLoad);
    }

    /**************************************************************************
     * 
     **************************************************************************/
    componentWillUnmount() {
        console.log('[InviteAccepted] componentWillUnmount ...');
        clearInterval(this.state.intervalId);
        window.removeEventListener('load', this.unhandleLoad)
    }

    /**************************************************************************
     * Has guest user actually login.
     **************************************************************************/
    userLoginRegister() {
        /* USE THIS in the onLoad() function. 		 */
        var requestId = '';
        const searchParams = new URLSearchParams(window.location.search);
        requestId = searchParams.get('rid');


        this.state.appKeycloak.init({
            onLoad: 'login-required',
            redirectUri: process.env.REACT_APP_SELF_URL +'/InviteAccepted/?rid=' + requestId + '&process_id=100'
        }).then(function (authenticated) {
            console.log(authenticated ? '[userLoginRegister] userLoginRegister() -> login-required called, user authenticated' : '[InviteAccepted] userLoginRegister() -> login-required called, user not authenticated'); // works.
            if (!authenticated) {
            } else {
                console.log('[userLoginRegister] userLoginRegister () -> login-required called, user is authenticated, calling updateToken.');

                // update the users token
                this.state.appKeycloak.updateToken(2)
                        .success(this.loadData)
                        .error(() => {
                            console.log('[InviteAccepted] userLoginRegister() ->Failed to load data.  User is logged out??');
                        });
            }
        }.bind(this)).catch(function () {
            console.log('[userLoginRegister] userLoginRegister() -> login-required called, error trying to call check-sso');
        });
    }

    /***************************************************************************
     * Once user is authenticated/registered/logged in then this will be invoked.
     ***************************************************************************/
    updateAcceptedStatus() {
        console.log('[InviteAccepted] handleLoad() -> fully loaded.  Before check-sso.');
        var requestId = '';
        const searchParams = new URLSearchParams(window.location.search);
        requestId = searchParams.get('rid');
        var processId = searchParams.get('process_id');

        console.log('[InviteAccepted] handleLoad() -> request id from query string: ' + requestId + ' -> processId: ' + processId);

        if (requestId !== undefined && requestId !== null) {

            var dataToSend = new FormData();
            dataToSend.append("requestee", this.state.requesteeEmail);
            dataToSend.append("requestId", requestId);

            /*	fetch request	*/
            fetch(this.state.inviteAcceptedEndpoint, {
                method: 'POST',
                body: dataToSend,
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded'
                }
            })
            .then(function (response) {
                var localResponse = response.json();
                console.log('[updateAcceptedStatus] fetch api: ' + localResponse);
                return localResponse;
            })//.bind(this))
            .then(function (jsonResponse) {
                // do something with jsonResponse
                console.log('[updateAcceptedStatus] fetch api v2: status: ' + jsonResponse.status + ' -- reason: ' + jsonResponse.reason);
                if (jsonResponse.status === 'success') {
                    this.setState({userAuthenticated: true});
                } else {
                    this.setState({userAuthenticated: false});
                }

            }.bind(this));
        }
    }
    /**************************************************************************
     * Parses query string to extract the request id.
     * This will then be sent in a post request to the backend servlet to update
     * the friend request to be accepted.
     **************************************************************************/
    handleLoad() {

        // Make sure user is registered/logs in before we update the back end servlet/database
        console.log('[InviteAccepted] handleLoad() -> calling userLoginRegister');
        this.userLoginRegister();
    }

    /********************************************************************
     *
     ********************************************************************/
    unhandleLoad() {
        console.log('[InviteAccepted] unloaded () -> called.');
    }
    /********************************************************************
     * loadData - This is a function call back to print out keycloak user status.
     ********************************************************************/
    loadData() {
        console.log('[InviteAccepted] loadData () -> keycloak subject: ' + this.state.appKeycloak.subject);
        if (this.state.appKeycloak.idToken) {
            console.log('[InviteAccepted] loadData() -> IDToken -> username' + this.state.appKeycloak.idTokenParsed.preferred_username + ', email: ' + this.state.appKeycloak.idTokenParsed.email +
                    ', name: ' + this.state.appKeycloak.idTokenParsed.name + ', given name: ' + this.state.appKeycloak.idTokenParsed.given_name + ', family name: ' + this.state.appKeycloak.idTokenParsed.family_name);
        } else {
            this.state.appKeycloak.loadUserProfile(function () {
                console.log('[InviteAccepted] loadData()-> loadUserProfile() -> Account Service -> username: ' + this.state.appKeycloak.profile.username + ', email: ' + this.state.appKeycloak.profile.email +
                        ', first name: ' + this.state.appKeycloak.profile.firstName + ', last name: ' + this.state.appKeycloak.profile.lastName);
            }, function () {
                console.log('[InviteAccepted] loadData()-> Failed to retrieve user details. Please enable claims or account role');
            });
        }

        if (this.state.appKeycloak.authenticated) {
            console.log('[InviteAccepted loadData() -> authenticated. Send accepted status to back end.');
            this.updateAcceptedStatus();
        }
    }
    ;
    /************************************************************
     Handles input field change.
     ************************************************************/
    handleChange(event) {
        console.log('value is: ' + event.target.value);
    }

    /************************************************************
     HTML Gui output
     ************************************************************/
    render() {

        const isUserAuthenticated = this.state.userAuthenticated;
        let userAuthHtml;
        if (isUserAuthenticated) {
            userAuthHtml =
                    <div>
                        <h1>
                            Invite Accepted
                        </h1>
                        <p>
                            Welcome to the Chat App.
                        </p>
                    </div>
        } else {
            userAuthHtml =
                    <h1>
                        Invite Not Accepted Yet
                    </h1>
        }

        return (
                <div className="InviteAccepted">
                    <nav className="sidenav">
                
                        <Link to="/">Home</Link> 
                        <Link to="/AboutUs">AboutUs</Link> 
                        <Link to="/ContactUs">ContactUs</Link> 
                        <a href={this.state.logoutUrl}>Logout</a> |{ " "}
                    </nav>
                
                    <div className="main">
                
                        <header className="InviteAccepted-header">
                            {userAuthHtml}
                        </header>
                    </div>
                </div>
                );
    }
}
export default InviteAccepted;
