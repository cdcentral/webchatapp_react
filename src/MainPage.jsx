import React  from 'react';
import './css/MainPage.css';
import Header from './Header';
import { Outlet, Link } from "react-router-dom";
import Footer from './Footer';
import {checkLocalStorage, handleLogout} from './Common.js';

/*********************************************
 *
 *********************************************/
class MainPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appKeycloak: props.keycloakObj,
            logoutUrl: props.logoutUrl
        };

        this.setStateCallBack = this.setStateCallBack.bind(this);
        this.initKeycloak = this.initKeycloak.bind(this);
    }

    /**************************************************************************
     *  Call back method for when setState for users name is set.
     * this will set the keycloak object to session/local storage.
     **************************************************************************/
    setStateCallBack(saveData) {
        if (saveData) {
            this.props.persistKeycloakObj(this.state.appKeycloak);
            localStorage.setItem('keycloakInfo', JSON.stringify(this.state.appKeycloak));
        } else {
            localStorage.removeItem('keycloakInfo');
        }
    }
    /*********************************************************************************************
     * Inits keycloak variable and brings user to the login page via keycloak.
     *********************************************************************************************/
    initKeycloak() {

        console.log('init Keycloak -> login required');

        // Makes user login
        this.state.appKeycloak.init({
            onLoad: 'login-required',
            redirectUri: 'http://localhost:3000/ChatPage'
        }).success(function () {
            console.log("keycloak init success");
        })
                .error(function (error) {
                    console.log('keycloak init error: ' + error);
                })
                .catch(function () {
                    console.log('keycloak init failed');
                });
    }

    /*****************************************************
     * componentDidMount method.
     *****************************************************/
    componentDidMount() {

        if (this.state.appKeycloak.authenticated !== undefined && this.state.appKeycloak.authenticated !== null &&
                this.state.appKeycloak.authenticated === true) {
            // keycloak object is still valid and authenticated.
            console.log('[MainPage] componentDidMount user keycloak object is still authenticated and valid');
            this.setStateCallBack(true);
        } else {
            this.setStateCallBack(false);
        }
    }

    /*****************************************************
     * componentWillUnmount method.
     *****************************************************/
    componentWillUnmount() { }

    render() {

        // **** For generating invite friend link html ***************************
        // This link should only appear if the user is authenticated
        const userAuthenticated = this.state.appKeycloak.authenticated;
        let inviteFriendHTML = <span></span>;
        if (userAuthenticated) {
            inviteFriendHTML =
                    <span>
                        <Link to="/InviteFriend">InviteFriend</Link> |  {" "}
                    </span>;
        }
        // The logout link should only appear if the user is authenticated and logged in.
        let logoutLinkHTML = <span></span>;
        if (userAuthenticated) {
            logoutLinkHTML =
                    <span>
                        <a><span onClick={() => handleLogout(this.state.logoutUrl)}>Logout</span> </a> |{ " "}
                    </span>;
        }
        // *************************************************************************
        return (
                <div>
                    <Header />
                    <div className="navSection">
                        <nav className="mainPageNav">
                            <a><span onClick={() => this.initKeycloak()}>Login</span></a> |{" "}
                            {logoutLinkHTML}
                            <Link to="/ChatPage">ChatPage</Link> |{" "}
                            {inviteFriendHTML}
                            <Link to="/AboutUs">AboutUs</Link> |{" "}
                            <Link to="/ContactUs">ContactUs</Link> |{" "}
                        </nav>
                        <Outlet />
                    </div>
                
                    <div className="MainPage">
                        <p>
                            Welcome everyone!  We're excited to talk to you about a chat application that can help you communicate with your friends, family or anyone else!
                        </p>
                        <p>insert image here or a graphic</p>
                        <p>
                            Since 2022 we have been growing and bringing people from all over the world together by allowing them to easily communicate with each other.
                        </p>
                    </div>
                    <Footer />
                </div>
                );
    }
}
export default MainPage;