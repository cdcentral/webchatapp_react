//import './css/ChatPage.css';

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
//    console.log('[AvatarChat-componentDidMount]');
//    // see if last message for each is the same.
//    var prevMsgIndex = this.state.prevMsgs.length - 1;
//    var currMsgIndex = this.state.currentMsgs.length -1;
//    console.log('[AvatarChat-render] prevMsgIndex: ' + prevMsgIndex + ', currMsgIndex: ' + currMsgIndex);
//    if (prevMsgIndex >= 0 && currMsgIndex >= 0) {
//        if (this.state.prevMsgs[prevMsgIndex].msg_timestamp !== this.state.currentMsgs[currMsgIndex].msg_timestamp) {
//            // new message came in. extract user/friend from this.  use this as the key to show the avatar.
//            console.log('[AvatarChat-render] user email that just posted message -> ' + this.state.currentMsgs[currMsgIndex].user_email);
//            // with email iterate through friendsAvatars to find the image to pass in.
//            if (this.state.friendsAvatars.length >= 0) {
//                for (var ix = 0; ix < this.state.friendsAvatars.length; ix++) {
//                    if (this.state.currentMsgs[currMsgIndex].user_email === this.state.friendsAvatars[ix].friend) {
//                        console.log('[AvatarChat-render] AvatarChat component with following avatar -> ' + this.state.friendsAvatars[ix].avatarImageString);
//                        //avatarHTML = <AvatarChat friendAvatar={friendsAvatars[ix].avatarImageString} />
//                        this.setState({avatarImage: this.state.friendsAvatars[ix].avatarImageString});
//                    }
//                }
//            }
//        }
//    }    
}
/***************************************************************************************************
 * RENDER method.
 ***************************************************************************************************/
render() {

//    const rFriendAvatars = this.state.friendsAvatars;
//    if (rFriendAvatars === undefined || rFriendAvatars === null) {
//        console.log('[AvatarChat-render] friend avatars is undefined or null');
//    } else {
//        console.log('[AvatarChat-render] friend avatars list is ' + rFriendAvatars.length + ' long');
//    }
    const image = this.state.avatarImage;
    console.log('[AvatarChat-render] image -> ' + image);
    //const image2 = props.friendAvatar;
    return (
        <div>
            <p>Avatar Section</p>
            <img src={image} height="100px" width="100px" alt="image"/>
     {/*       <img src={image2} height="100px" width="100px" alt="image2"/>    */}
        </div>
    );
}

}
export default AvatarChat;
