import '../css/AvatarChat.css';
import React from 'react';
import {  Link } from "react-router-dom";


/******************************************************************************************************
 * This will contain the chat page.  Here's where the user can send and receive messages.
 ******************************************************************************************************/
class AvatarChat extends React.Component {
constructor(props) {
super(props);
        this.state = {
            avatarImage:  props.friendAvatar,
            friendsAvatars: props.friendsAvatars,
            currentMsgs: props.currentMsgs,
            prevMsgs: props.prevMsgs
        };
 
}

/**
 * 
 */
componentDidMount() {

}
/***************************************************************************************************
 * RENDER method.
 ***************************************************************************************************/
render() {

    const image = this.state.avatarImage;
    console.log('[AvatarChat-render] image -> ' + image);

    return (
        <div>
{/*
            <p>Avatar Section</p>
*/}
            <img src={image} height="100px" width="100px" alt="image"/>
        </div>
    );
}

}
export default AvatarChat;
