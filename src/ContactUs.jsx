import './css/ContactUs.css';
import React, { useState }  from 'react';
import { Link } from "react-router-dom";

function ContactUs() {
    // Declare a new state variable, which we'll call "count"  
    const [count, setCount] = useState(0);

    const SendMessage = () =>
            {
                console.log('[ContactUs] SendMessage() -> user sent message');
            }
    return (
            <div className="ContactUs">
            
                <div className="contactUsNavDiv">
                    <nav className="contactUsNav">
                        <Link to="/">Home</Link> |{" "}
                        <Link to="/AboutUs">AboutUs</Link> |{" "}
                        <Link to="/ContactUs">ContactUs</Link> |{" "}
                    </nav>
                </div>
            
                <div  id="contactUsForm">
                    <header className="ContactUs-header">
                        <h1>
                            Contact us.
                        </h1>
                        <form>
                            <label>	Email:	</label> <br/>
                            <input type="text" id="emailInput" name="emailInput"/> <br/>
                            <label>Message:</label> <br/>
                            <textarea id="userInput" rows="2" cols="50"></textarea> <br/>
                            <input type="submit" id="submitButton" value="Submit" onClick={SendMessage} />
                        </form>
                    </header>
                </div>
            </div>
            );
}

export default ContactUs;
