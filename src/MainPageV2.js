/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


import * as React from 'react';
import Header from './Header';
import { Outlet, Link } from "react-router-dom";
import Footer from './Footer';
import {checkLocalStorage, handleLogout} from './Common.js';
import { useSelector, useDispatch } from 'react-redux'

export default function MainPageV2({}) {
    const [logoutLinkHTML, setLogoutLinkHTML] = React.useState(null);
    const [inviteFriendHTML, setInviteFriendHTML] = React.useState(null);

  const initKeycloak = () => {
    console.log('init keycloak from MainPageV2');
    const kc = useSelector((state) => state.keycloak.keycloak);
  };

  return (
                <div>
                    <Header />
                    <div className="navSection">
                        <nav className="mainPageNav">
                            <a><span onClick={() => initKeycloak()}>Login</span></a> |{" "}
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
