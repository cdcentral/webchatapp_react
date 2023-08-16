/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/reactjs.jsx to edit this template
 */
import './css/Settings.css';
import React  from 'react';
import {checkLocalStorage, handleLogout} from './Common.js';
import {  Link } from "react-router-dom";
//import ImageUploader from './ImageUploader';
import ImageUploaderV2 from './ImageUploaderV2';

/**
 * One main focus for this is to assign an image/jpeg to each of your chat group members and also to yourself.
 * 
 * These images/avatars will be used in another component to display who's actually typing/sending messages
 * 
 * 
 * Requirements:
 *  1. Allow you to edit/add a picture for yourself.
 *  2. Allow you to edit/add a picture for your friends.
 * 
 * 
 * 
 * @type type
 */
class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            friendsListEndpoint: process.env.REACT_APP_API_JAVA_BACKEND_BASE_URL + '/GetFriendsList',
            friendsAvatarsEndpoint: process.env.REACT_APP_API_JAVA_BACKEND_BASE_URL + '/GetFriendsAvatars',
            // logout url passed in from parent component.
            logoutUrl: props.logoutUrl,
            // keycloak object passed in from parent.
            appKeycloak: props.keycloakObj,
            // current selected chat group, which has groupID and groupMembers
            parentChatGroupObj: props.parentChatGroupObj,
            avatarImage: '',
            avatarImageStr: '',
            friendsAvatars: '',
            existingFriends: '',
            friendsAndAvatar: '', // same as 'existingFriends' but this will have their associated avatar/image.
            gotFriendList: false
        };

        this.loadUserImage = this.loadUserImage.bind(this);
        this.getFriends = this.getFriends.bind(this);
        this.getAvatars = this.getAvatars.bind(this);
        this.setFileReaderBindings = this.setFileReaderBindings.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
        this.associateAvatarWithFriend = this.associateAvatarWithFriend.bind(this);
    }

    /**
     * 
     * @param {type} image
     * @returns {undefined}
     */
    associateAvatarWithFriend(image) {
        console.log('associateAvatarWithFriend -> image: ' + image);
    }
    /**************************************************************************
     *  Supposed to be called once when the page is loaded.
     **************************************************************************/
    componentDidMount() {
        //this.getFriends();
        this.getAvatars(null);
    }

    /*****************************************************
     * Make http request to get friends list from the database.
     *****************************************************/
    getFriends() {
//        var dataToSend = new FormData();
//        dataToSend.append("from", "Settings");
//        if (this.state.appKeycloak === undefined || this.state.appKeycloak.authenticated === undefined) {
//            console.log("keycloak object is undefined.");
//
//            // local storage
//            var localKC = checkLocalStorage();
//            dataToSend.append("userKeycloakId", localKC.subject);
//
//        } else {
//            dataToSend.append("userKeycloakId", this.state.appKeycloak.subject);
//        }
//
//        console.log('user keycloak id: ' + dataToSend.get("userKeycloakId"));
//
//        /*	fetch request	 */
//        fetch(this.state.friendsListEndpoint, {
//        method: 'POST',
//                body: dataToSend,
//                headers: {
//                'Content-type': 'application/x-www-form-urlencoded'
//                }
//        })
//        .then(function(response) {
//        var localResponse = response.json();
//                return localResponse;
//        })
//        .then(function(jsonResponse) {
//            console.log('[Settings] fetch api:  ' + JSON.stringify(jsonResponse));
//            // consider using sessionStorage for storing existingFriends
//            this.setState({
//                existingFriends: jsonResponse.friends,
//                gotFriendList: true}, function() {
//                console.log('[Settings] existing friends ' + this.state.existingFriends + ' -- json stringify ' + JSON.stringify(this.state.existingFriends));
//            });
//            // do avatar request.
//            this.getAvatars(jsonResponse.friends);
//        }.bind(this));
//        this.setFileReaderBindings();
    }
    /*****************************************************
     * Make http request to get avatars from database.
     *****************************************************/
    getAvatars(friends) {

        var dataToSend = new FormData();

        if (this.state.appKeycloak === undefined || this.state.appKeycloak.authenticated === undefined) {
            console.log("keycloak object is undefined.");

            // local storage
            var localKC = checkLocalStorage();
            dataToSend.append("userKeycloakId", localKC.subject);
            dataToSend.append("userKeycloakEmail", localKC.idTokenParsed.email);

        } else {
            dataToSend.append("userKeycloakId", this.state.appKeycloak.subject);
            dataToSend.append("userKeycloakEmail", this.state.appKeycloak.idTokenParsed.email);
        }

        console.log('user keycloak id: ' + dataToSend.get("userKeycloakId"));

        /*	fetch request	 */
        fetch(this.state.friendsAvatarsEndpoint, {
        method: 'POST',
                body: dataToSend,
                headers: {
                'Content-type': 'application/x-www-form-urlencoded'
                }
        })
        .then(function(response) {
        var localResponse = response.json();
                return localResponse;
        })
        .then(function(jsonResponse) {
            console.log('[Settings] getAvatars fetch api:  ' + JSON.stringify(jsonResponse));
            let index = 0;
            for (index = 0; index < jsonResponse.friends.length; index++) {
                console.log('[Settings] avatar image only -> index ' + index + ' -> avatar image ' + jsonResponse.friends[index].avatarImage);

                this.setState({avatarImage: jsonResponse.friends[index].avatarImage,
                                avatarImageStr: jsonResponse.friends[index].avatarImageString,
                                friendsAvatars: jsonResponse.friends});
            }

        }.bind(this));
        this.setFileReaderBindings();
    }
    /**************************************************************************
     * 
     **************************************************************************/
    componentWillUnmount() {

    }

    /**************************************************************************
     * 
     **************************************************************************/
    loadUserImage(friendData) {
        console.log("In loadUserImage.");
    }

    // causes exception.
    // What I want: Load image from users pc to react app.
    // This is a way for me to load an avatar/image to represent each friend.
    // These avatar's/images will be used in the ChatPage component.
    changeHandler(data) {
        console.log("Inside [ChangeHandler]");
        const { files } = data.target;
        for (let i = 0; i < files.length; i++) {
          const file = files[i]; // OR const file = files.item(i);
          console.log("[ChangeHandler] file: " + file);
        }
    }
    /**
     * Handles user action on clicking the input file reader.
     * @returns {undefined}
     */
    setFileReaderBindings() {
        try {
            const file = document.getElementById('file').files[0];
            const result = document.getElementById('result');
            const reader = new FileReader;
            reader.addEventListener('load', () => {
                result.innerHTML = reader.result;
                console.log('reader result: ' + reader.result);
            });
            reader.readAsText(file, 'UTF-8');
        } catch(error) {
            console.log("[Settings-setFileReaderBindings] error -> " + error);
        }

    }

    /************************************************************
     HTML Gui output
     ************************************************************/
    render() {

        const localAImage = this.state.avatarImage;

        const friendsAndAvatars = this.state.friendsAvatars;
        var friendsAvatarsHTML = <div>Friends Avatars List Placeholder</div>;
        if (friendsAndAvatars.length > 0) {
            // has friends with avatars already selected.
            friendsAvatarsHTML = friendsAndAvatars.map((friend) => 
                <li key={friend.friendRequestId}> {friend.friend} 
                    <ImageUploaderV2 callback={this.associateAvatarWithFriend} friend={friend.friend} friendAvatar={friend.avatarImageString} />

                </li>
                    );

        }
//        // Generate HTML list to display list of friends.
//        var friendsListHTML = <div>Friends List Placeholder</div>;
//        const renderFriendsList = this.state.existingFriends;
//        if (renderFriendsList.length > 0) {
//            friendsListHTML = renderFriendsList.map((friend) =>
//                <li  key={friend.friendRequestId}> {friend.friend} <ImageUploaderV2 callback={this.associateAvatarWithFriend} friend={friend.friend} /></li>
//            );
//        }

        /*
         * Display list of friends.
         */
        return (
            <div>
                <nav className="sidenavChat flex-child">

                    <Link to="/">Home</Link> 
                    <Link to="/ChatPage">Chat Page</Link> 
                    <Link to="/AboutUs">AboutUs</Link> 
                    <Link to="/ContactUs">ContactUs</Link> 
                    <a><span onClick={() => handleLogout(this.state.logoutUrl)}>Logout</span> </a>
                    <Link to="/InviteFriend">Invite</Link>
                </nav>
                <p>Settings page</p>
                {/*
                {friendsListHTML}
                */}
                {friendsAvatarsHTML}

            </div>
            );
    }
}
export default Settings;