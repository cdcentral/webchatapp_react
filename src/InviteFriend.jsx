import React  from 'react';
import {  Link } from "react-router-dom";
import './css/InviteFriend.css';
import {checkLocalStorage, handleLogout} from './Common.js';

/*
 This class will have a GUI to have the user send an invite request to another colleague.
 */
class InviteFriend extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            webappEndpoint: 'http://localhost:8080/react_chat_app_backend/InviteRequest',
            date: new Date(),
            keycloakBaseUrl: 'http://localhost:8081/auth/',
            logoutUrl: props.logoutUrl,
            intervalId: 0,
            backendResponse: null, /* Contains response from java web application. */
            inviteStatus: '', /*Status of invite request.  Was it successful in being sent or not.*/
            appKeycloak: props.keycloakObj,
            wasEmailSent: false // indicates if user actually entered an email to be sent.  This will be used to help render a message if the email was successfully sent or not.
        };


        // Defining methods in this class
        this.sendEmailInvite = this.sendEmailInvite.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.timer = this.timer.bind(this);
        this.reloadData = this.reloadData.bind(this);
        this.loadData = this.loadData.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
        this.unhandleLoad = this.unhandleLoad.bind(this);

        // handle response to http request.
        this.handleResponse = this.handleResponse.bind(this);
    }

    /**************************************************************************
     *  Supposed to be called once when the page is loaded.
     **************************************************************************/
    componentDidMount() {
        if (this.state.appKeycloak.authenticated !== undefined && this.state.appKeycloak.authenticated !== null && this.state.appKeycloak.authenticated) {
            // user already authenticated
        } else {
            // if not authenticated grab the keycloak user data from local storage.
            var localKC = checkLocalStorage();
            if (localKC === undefined || localKC === null || localKC.authenticated === undefined || localKC.authenticated === null || localKC.authenticated === false) {
                // user not logged in, return to main page.
                window.location.replace("http://localhost:3000");
            } else {
                this.setState({appKeycloak: localKC});
            }
        }

        this.setState({wasEmailSent: false});

        window.addEventListener('load', this.handleLoad);
    }

    /**************************************************************************
     * 
     **************************************************************************/
    componentWillUnmount() {
        console.log('[InviteFriend] componentWillUnmount');// -> clearing the interval: ' + this.state.intervalId);

        window.removeEventListener('load', this.unhandleLoad)
    }

    /**************************************************************************
     * WEIRD: this method should only be called once or twice, but it is being called repeatedly.
     **************************************************************************/
    handleLoad() {

        console.log('[InviteFriend] handleLoad() -> before check-sso, keycloak object -> ' + JSON.stringify(this.state.appKeycloak.toString()));
    }

    /********************************************************************
     *
     ********************************************************************/
    unhandleLoad() {
        console.log('[InviteFriend] unloaded () -> called.');
    }
    /********************************************************************
     *
     ********************************************************************/
    loadData() {

        console.log('[InviteFriend] loadData () -> keycloak subject: ' + this.state.appKeycloak.subject + ' -- authenticated: ' + this.state.appKeycloak.authenticated);

        if (this.state.appKeycloak.idToken) {
            console.log('[InviteFriend] loadData() -> IDToken -> username' + this.state.appKeycloak.idTokenParsed.preferred_username + ', email: ' + this.state.appKeycloak.idTokenParsed.email +
                    ', name: ' + this.state.appKeycloak.idTokenParsed.name + ', given name: ' + this.state.appKeycloak.idTokenParsed.given_name + ', family name: ' + this.state.appKeycloak.idTokenParsed.family_name);
        } else {
            this.state.appKeycloak.loadUserProfile(function () {
                console.log('[InviteFriend] loadData()-> loadUserProfile() -> Account Service -> username: ' + this.state.appKeycloak.profile.username + ', email: ' + this.state.appKeycloak.profile.email +
                        ', first name: ' + this.state.appKeycloak.profile.firstName + ', last name: ' + this.state.appKeycloak.profile.lastName);
            }, function () {
                console.log('[InviteFriend] loadData()-> loadUserProfile() -> Failed to retrieve user details. Please enable claims or account role');
            });
        }

    }
    ;
        /**************************************************************************
         * 
         **************************************************************************/
        timer() {
        //e.preventDefault();

        if (this.state.appKeycloak.authenticated === true)
        {
            console.log('[InviteFriend] Timer() -> Before check-sso, user is authenticated.  Calling this.reloadData() which calls update token.?? ' +
                    ', keycloak subject: ' + this.state.appKeycloak.subject + ', email: ' + this.state.appKeycloak.idTokenParsed.email);

            this.reloadData();
        } else {
            /* 			
             // This causes the componentWillMount again and again.  This shouldn't be in a setInterval but perhaps a setTimeout???*/
            this.state.appKeycloak.init({
                onLoad: 'check-sso',
                enableLogging: true,
                silentCheckSsoRedirectUri: 'http://localhost:3000/InviteFriend' // with this here, we can finally get to the success below.
            }).then(function (authenticated) {

                if (authenticated) {
                    console.log('[InviteFriend] Timer() -> check-sso called, user authenticated. Calling reloadData().  First id; ' + this.state.appKeycloak.subject);
                    this.reloadData();
                } else
                {
                    console.log('[InviteFriend] Timer() -> check-sso called user not authenticated'); // works.
                    window.location.replace('http://localhost:3000/'); // route user to login page.
                }
            }.bind(this)).catch(function () {
                console.log('[InviteFriend] Timer() -> check-sso called, error trying to call check-sso');
            });

        }
        //}

    }
    /************************************************************************************************
     Calls keycloak updateToken
     ************************************************************************************************/
    reloadData() {
        /*  */
        if (this.state.appKeycloak !== undefined && this.state.appKeycloak !== null) {
            console.log('[InviteFriend] reloadData() -> calling updateToken');

            /*			*/
            this.state.appKeycloak.updateToken(5)
                    .success(this.loadData)
                    .error(() => {
                        console.log('[InviteFriend] reloadData() ->Failed to load data.  User is logged out??');
                    });
        } else {
            console.log('[InviteFriend] keycloak object is either undefined or null');
        }
    }

    /************************************************************
     Handles input field change.
     ************************************************************/
    handleChange(event) {

        console.log('value is: ' + event.target.value);
    }
    /************************************************************
     Handles response from java web app
     ************************************************************/
    handleResponse(response) {

        console.log('[handleResponse] response: ' + response);
        // simply displaying web app's response in console log
        var localData = JSON.parse(response);//JSON.parse(this.responseText);

        // Because of this should consider using axios or fetch api below.
        // end goal is to call setState to update a GUI render object to show that email was successfully sent.
        console.log('Reponse from back end server: ' + JSON.stringify(this.responseText));
        if (localData.status === 'success') {
            console.log('[InviteFriend] email sent success');
        }
    }

    /*************************************************************************
     * sends email.
     *************************************************************************/
    sendEmailInvite() {
        if (this.state.appKeycloak.authenticated === undefined || this.state.appKeycloak.authenticated === null || !this.state.appKeycloak.authenticated) {
            console.log('[InviteFriend] user isn\'t authenticated.  Returning..');
            return;
        }
        // checks if user email length is valid.  If it isn't then return.
        if (document.getElementById("email").value.length < 10) {
            console.log('[InviteFriend] email to invite is  invalid size. Returning...');
            return;
        }

        this.setState({wasEmailSent: true});
        // here send http request to backend.
        var dataToSend = new FormData();
        dataToSend.append("requestee", document.getElementById("email").value); // old school javascript way of getting value from html field
        dataToSend.append("requestor", this.state.appKeycloak.subject);

        // Sending post web request to tomcat web servlet to save user message to the db
        /*	fetch request	*/
        fetch(this.state.webappEndpoint, {
            method: 'POST',
            body: dataToSend,
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            }
        })
        .then(function (response) {
            var localResponse = response.json();
            console.log('[processSubmit] fetch api: ' + localResponse);
            return localResponse;
        })
        .then(function (jsonResponse) {

            console.log('[processSubmit] fetch api v2: status: ' + jsonResponse.status + ' -- reason: ' + jsonResponse.reason + ' -- email Sent Status: ' + jsonResponse.emailSentStatus);
            this.setState({inviteStatus: jsonResponse.emailSentStatus});
        }.bind(this));

    }

    /************************************************************
     HTML Gui output
     ************************************************************/
    render() {

        const renderEmailSent = this.state.wasEmailSent;
        const renderInviteStatus = this.state.inviteStatus;

        let emailStatusHTML = <span></span>;

        // if email was sent and back end web app was successfully able to send invite
        if (renderEmailSent && renderInviteStatus)
        {
            emailStatusHTML =
                    <span>
                        <p>Email successfully sent</p>
                    </span>;
        }
        // if email was sent but the back end app was not successful in sending the invite, one possible cause is that the user sent a bad email address
        else if (renderEmailSent && !renderInviteStatus)
        {
            emailStatusHTML =
                    <span>
                        <p>Invite not successfully sent</p>
                    </span>;
        }
        return (
                <div className="InviteFriend">
                    <nav className="sidenav">
                        <Link to="/">Home</Link> 
                        <Link to="/AboutUs">AboutUs</Link> 
                        <Link to="/ContactUs">ContactUs</Link> 
                        <a href="javascript:void(0);"><span onClick={() => handleLogout(this.state.logoutUrl)}>Logout</span> </a>
                    </nav>
                
                    <div className="main">
                
                        <header className="InviteFriend-header">
                            <h1>
                                Invite Friend
                            </h1>
                            <p>
                                Enter the email of your friend you would like to invite.
                            </p>
                        </header>
                        <label>Email:</label>
                        <input type="text" id="email" name="email" onChange={this.handleChange}></input><br/><br/>
                        <input type="submit" id="submitButton" value="Submit" onClick={this.sendEmailInvite} />
                        {emailStatusHTML}
                    </div>
                
                </div>
                );
    }
}
export default InviteFriend;


