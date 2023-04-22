import './css/NavBar.css';
import React from "react";
import {
BrowserRouter,
        Route,
        Routes
        } from "react-router-dom"; // requires this command: npm i react-router-dom
import Services from './Services';

// Following this example for using routing with nav bar https://v5.reactrouter.com/web/guides/quick-start


function Header() {
    return (
            <BrowserRouter>
                <Routes>
                    <Route path="Services" element={ < Services / > } />
                </Routes>
            </BrowserRouter>
            );
}
export default Header;
