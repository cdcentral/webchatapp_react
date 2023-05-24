import './css/AboutUs.css';
import React  from 'react';
import { Link } from "react-router-dom";
import Footer from './Footer';
import {checkLocalStorage, handleLogout} from './Common.js';


class AboutUs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: new Date(),
            keycloakBaseUrl: process.env.REACT_APP_API_KEYCLOAK_URL,
            logoutUrl: props.logoutUrl,
            appKeycloak: props.keycloakObj,
            intervalId: -1
        };

        this.handleLoad = this.handleLoad.bind(this);
        this.handleUnload = this.handleUnload.bind(this);

        this.forceUserLogin = this.forceUserLogin.bind(this);
        this.loadData = this.loadData.bind(this);
    }

    /**************************************************************************
     **************************************************************************/
    handleLoad() {
        console.log('[AboutUs] handleLoad() -> ....');
    }

    /**************************************************************************
     **************************************************************************/
    handleUnload() {
        console.log('[AboutUs] handleUnload');

    }
    /**************************************************************************
     **************************************************************************/
    forceUserLogin() {

    }

    /********************************************************************
     *
     ********************************************************************/
    loadData() {

    }
    /**************************************************************************
     *  Supposed to be called once when the page is loaded.
     **************************************************************************/
    componentDidMount() {

        window.addEventListener('load', this.handleLoad);
        console.log('[AboutUs] ComponentDidMount() -> calling setTimeout()');
    }

    /**************************************************************************
     **************************************************************************/
    componentWillUnmount() {
        console.log('[AboutUs] componentWillUnmount -> clearing the interval: ' + this.state.intervalId);
        clearInterval(this.state.intervalId);
        window.removeEventListener('load', this.handleUnloadLoad);
    }

    render() {
        // *************** Links that should only be present if user is logged in/authenticated *****
        const userAuthenticated = (this.state.appKeycloak !== undefined && this.state.appKeycloak !== null && this.state.appKeycloak.authenticated);
        let htmlToGenerate = <span></span>;
        if (userAuthenticated) {
            htmlToGenerate =
                    <span>
                        <Link to="/ChatPage">ChatPage</Link> |{" "}
                        <Link to="/InviteFriend">InviteFriend</Link> |{" "}
                        <a><span onClick={() => handleLogout(this.state.logoutUrl)}>Logout</span> </a>
                    </span>;
        }
        // ***********************************************************************************************

        return (
                <div className="AboutUsMain">
                
                    <div className="aboutUsNavDiv">
                        <nav className="aboutUsNav">
                            <Link to="/">Home</Link> |{" "}
                            <Link to="/AboutUs">AboutUs</Link> |{" "}
                            <Link to="/ContactUs">ContactUs</Link> |{" "}
                            {htmlToGenerate}
                        </nav>
                    </div>
                
                    <header className="AboutUs-header">
                        <div className="aboutUsMainText">
                            <h1>
                                About us.
                            </h1>
                            <p>
                                We're a company founded in Virginia.  It started in 2022 by creating a web chat app that allows anyone to chat with anyone else anywhere in the world!
                            </p>
                            <p>
                                You can invite your friends to join you using this chat.  You can add them into private chat groups and start communicating!
                            </p>
                            <p>
                                All you have to do is register with the site for free!
                            </p>
                            <p>
                                How amazing is that?
                            </p>
                        </div>
                    </header>
                    <Footer />
                </div>
                );
    }
}
export default AboutUs;
