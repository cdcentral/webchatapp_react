/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


import * as React from 'react';
import { useState } from 'react';
import Header from './Header';
import { Outlet, Link } from "react-router-dom";
import Footer from './Footer';
import {checkLocalStorage, handleLogout} from './Common.js';
import { useSelector, useDispatch } from 'react-redux'


const MyComponent = (props) => {
     const kc = useSelector((state) => state.keycloak.keycloak);
        // Makes user login
        kc.init({
            onLoad: 'login-required',
            redirectUri: process.env.REACT_APP_SELF_URL +'/ChatPage'
        }).success(function () {
            console.log("keycloak init success");
        })
        .error(function (error) {
            console.log('keycloak init error: ' + error);
        })
        .catch(function () {
            console.log('keycloak init failed');
        });
  return (
    <div>Hello {props.name}!</div>
  );
}
const InitKeycloak = (props) => {
     console.log("in InitKeycloak function component");

     function foo () {
         console.log("foo");
         //const kc = useSelector((state) => state.keycloak.keycloak);
     }
     //
     /**/
//     console.log("props xyz: " + props.xyz);
//     if (props.xyz === 'false') {
//         console.log("props xyz is false");
//     }
       const kc = useSelector((state) => state.keycloak.keycloak);     
        // Makes user login
        kc.init({
            onLoad: 'login-required',
            redirectUri: process.env.REACT_APP_SELF_URL +'/ChatPage'
        }).success(function () {
            console.log("keycloak init success");
        })
        .error(function (error) {
            console.log('keycloak init error: ' + error);
        })
        .catch(function () {
            console.log('keycloak init failed');
        });
    
  return (
    <div>
        {/*<a><span onClick={() => foo()}>Login - IK</span></a> |{" "}*/}
    </div>
    
  );
}

const {useEffect } = React;

/**
 * A functional component called App that returns a 
 * React element.
 */       
function MainPageV3 () {
    const [loginClicked, setLoginClicked] = useState(false);
    const updateClicked = () => setLoginClicked((value) => !value);

    // TRYING TO SEE IF CAN MAKE 
    const [inviteFriendHTML, setInviteHTML] = useState(<span></span>);
    const updateFriendHTML = () => setInviteHTML((text) => text);
 
    const kc = useSelector((state) => state.keycloak.keycloak);  
    const userAuthenticated = kc.authenticated;  //authenticated shows up as undefined.
    if (userAuthenticated) {
        updateFriendHTML (<span>AUTHENTICATED</span>);
    }
    /*
    let inviteFriendHTML = <span></span>;
    
    if (userAuthenticated) {
            inviteFriendHTML =
                <span>
                    <Link to="/InviteFriend">InviteFriend</Link> |  {" "}
                </span>//;
    }*/
    let logoutLinkHTML = <div></div>;


    // shows login clicked value changing
    useEffect( () => {
        console.log('login clicked: ' + loginClicked);
    });

  return (
                <div>
                    <Header />
                    <div className="navSection">
                        <nav className="mainPageNav">
                            {loginClicked && <InitKeycloak />}
                            {/*<InitKeycloak xyz="false" />*/}
                            <a><span onClick={()=> updateClicked()}>Login</span></a> |{" "}
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
    // Passing the name when using the component
  /*
    <div>
      <MyComponent name='World'/> 
      <MyComponent name='Educative'/>
    </div>
   */
  );
}

export default MainPageV3;