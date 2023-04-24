import './css/ChatPage.css';

import React from 'react';
import {  Link } from "react-router-dom";
import {checkLocalStorage, handleLogout, removeItemOnce, removeItemOnceObjectArray} from './Common.js';

// auto complete
import FreeSoloCreateOptionV3 from './FreeSoloCreateOptionV3';

import AlertDialogue from './AlertDialogue';

/******************************************************************************************************
 * This will contain the chat page.  Here's where the user can send and receive messages.
 ******************************************************************************************************/
class ChatPage extends React.Component {
constructor(props) {
super(props);
        this.state = {

            friendsListEndpoint: process.env.REACT_APP_API_JAVA_BACKEND_BASE_URL + '/GetFriendsList',
            groupChatCreateEndpoint: process.env.REACT_APP_API_JAVA_BACKEND_BASE_URL + '/CreateGroupChat',
            getUsersSavedGroupsEndpoint: process.env.REACT_APP_API_JAVA_BACKEND_BASE_URL + '/GetUsersSavedChatGroups', //GetUsersSavedChatGroups
            deleteChatGroupEndpoint: process.env.REACT_APP_API_JAVA_BACKEND_BASE_URL + '/DeleteChatGroup',
            removeFromChatGroupEndpoint: process.env.REACT_APP_API_JAVA_BACKEND_BASE_URL + '/RemoveFromChatGroup', // this should make deleteChatGroupEndpoint obsolete.
            postMessageEndpoint: process.env.REACT_APP_API_JAVA_BACKEND_BASE_URL + '/PostMessageServlet',
            getLatestMessagesEndpoint: process.env.REACT_APP_API_JAVA_BACKEND_BASE_URL + '/GetLatestMessages',
            getMessagesTimerId: - 1, // used to set and clear the timer for getting the latest messages
            getSavedGroupTimerId: - 1, // userd to set and clear the timer for getting the saved chat groups
            existingFriends: '',
            groupAddSelected: false,
            gotFriendList: false,
            tempFriendsSelectedArr: [], // temporary list.  When user finalizes group chat list then it will be saved into savedChatGroupsArr
            //savedChatGroupsArr: [], // array of saved chat groups in the DB
            savedChatGroupsObjectArr: [], // array of saved chat groups in db.  this will include the group id and the list of names.
            chatGroupMessages: '', // will contain the groups chats/messages retrieved from the DB.
            // user's name to be displayed in the welcome/logged in page.
            usersName: '',
            // boolean that will be used to open the delete confirmation dialogue
            openDeleteDialogue: false,
            // chat group that user selects to delete, this will have the group id
            chatGroupToDelete: '',
            // logout url passed in from parent component.
            logoutUrl: props.logoutUrl,
            // keycloak object passed in from parent.
            appKeycloak: props.keycloakObj,
            // current selected chat group, which has groupID and groupMembers
            parentChatGroupObj: props.parentChatGroupObj
        };
        // binded functions
        this.loadData = this.loadData.bind(this);
        this.reloadData = this.reloadData.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
        this.unhandleLoad = this.unhandleLoad.bind(this);
        this.setStateCallBack = this.setStateCallBack.bind(this);
        this.loadFailure = this.loadFailure.bind(this);
        this.handleCheckSSO = this.handleCheckSSO.bind(this);
        //this.timer = this.timer.bind(this);

        this.handleGroupAdd = this.handleGroupAdd.bind(this);
        this.handleCancelGroupAdd = this.handleCancelGroupAdd.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.getAcceptedFriends = this.getAcceptedFriends.bind(this);
        this.handleUserSelected = this.handleUserSelected.bind(this);
        this.sendCreateGroupChat = this.sendCreateGroupChat.bind(this);
        this.selectGroupToChatV2 = this.selectGroupToChatV2.bind(this);
        this.getUsersSavedGroupsFromDB = this.getUsersSavedGroupsFromDB.bind(this);
        this.handleDeleteGroupV2 = this.handleDeleteGroupV2.bind(this);
        this.submitMessage = this.submitMessage.bind(this);
        this.getLatestMessages = this.getLatestMessages.bind(this);
        this.doNothing = this.doNothing.bind(this);
        this.handleDialogueOpen = this.handleDialogueOpen.bind(this);
        this.handleDialogueClose = this.handleDialogueClose.bind(this);
        this.handleConfirmDeletion = this.handleConfirmDeletion.bind(this);
        this.handleCancelDeletion = this.handleCancelDeletion.bind(this);
        this.handleDeletionBoolean = this.handleDeletionBoolean.bind(this);
}

/**************************************************************************
 * Handles opening the delete confirmation dialogue.
 **************************************************************************/
handleDialogueOpen() {
    this.setState({openDeleteDialogue: true});
}
/**************************************************************************
 * Handles closing the delete confirmation dialogue.
 **************************************************************************/
handleDialogueClose() {
    this.setState({openDeleteDialogue: false});
}

/**************************************************************************
 * The user confirmed that they wanted to delete the chat group.
 * Should also clear out the text area displaying the chat group.
 **************************************************************************/
/**/
handleConfirmDeletion() {
    console.log('[ChatPage] handleConfirmDeletion() -> user selected to DELETE this chat group.');
    this.handleDialogueClose();
    // send http request to delete from backend
    // then update the current list.
    // need to know the chat group ID AND the users email that will be removed.

    var dataToSend = new FormData();
    dataToSend.append("userChatGroupToRemoveUser", this.state.chatGroupToDelete);
    dataToSend.append("userEmailToRemove", this.state.appKeycloak.idTokenParsed.email);
    // send http request to delete this chat group
    fetch(this.state.removeFromChatGroupEndpoint, {
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
    // do something with jsonResponse
    console.log('[ChatPage]  handleConfirmDeletion() -> fetch api v2:  ' + JSON.stringify(jsonResponse) + ' -- status: ' + jsonResponse.status);
            if (jsonResponse.status === 'success') {
    // updates saved chat groups by removing the chat group that was just deleted.
    // here should do also:
    // - Clear out the text area chat since this contained the chat group that was just deleted.
    // - Clear out the chat group name selected as well.

    // NEED the chat group id to delete.
    var tempFriendsObject = this.state.savedChatGroupsObjectArr;
            tempFriendsObject = removeItemOnceObjectArray(tempFriendsObject, this.state.chatGroupToDelete);
            this.setState({savedChatGroupsObjectArr: tempFriendsObject});
            // this should set groupID and groupMembers to null
            this.props.persistParentChatGroupDataMethod( - 1, '');
            this.setState({
            parentChatGroupObj: '', // removes current selected group chat
                    chatGroupMessages: ''// clears out text history
            });
    } else {
    console.log('[ChatPage] handleConfirmDeletion() -> failed to delete.');
    }

    }.bind(this));
    var msgOfUserRemoved = '{' + this.state.appKeycloak.tokenParsed.preferred_username + ' left the group }';
    this.submitMessage(msgOfUserRemoved);
}

/* Original  
 handleConfirmDeletion() {
 console.log('[ChatPage] handleConfirmDeletion() -> user selected to DELETE this chat group.');
 this.handleDialogueClose();
 
 // send http request to delete from backend
 // then update the current list.
 var dataToSend = new FormData();
 dataToSend.append("userChatGroupToDelete", this.state.chatGroupToDelete);
 
 // send http request to delete this chat group
 fetch(this.state.deleteChatGroupEndpoint, {
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
 // do something with jsonResponse
 console.log('[ChatPage]  handleConfirmDeletion() -> fetch api v2:  ' + JSON.stringify(jsonResponse) + ' -- status: ' + jsonResponse.status);
 
 if (jsonResponse.status === 'success') {
 // updates saved chat groups by removing the chat group that was just deleted.
 // here should do also:
 // - Clear out the text area chat since this contained the chat group that was just deleted.
 // - Clear out the chat group name selected as well.
 
 // NEED the chat group id to delete.
 var tempFriendsObject = this.state.savedChatGroupsObjectArr;
 tempFriendsObject = removeItemOnceObjectArray(tempFriendsObject, this.state.chatGroupToDelete);
 this.setState({savedChatGroupsObjectArr: tempFriendsObject});
 
 // this should set groupID and groupMembers to null
 this.props.persistParentChatGroupDataMethod(-1, '');
 
 this.setState({
 parentChatGroupObj: '',// removes current selected group chat
 chatGroupMessages: ''// clears out text history
 });
 } else {
 console.log('[ChatPage] handleConfirmDeletion() -> failed to delete.');
 }
 
 }.bind(this));
 }
 */
/**********************************************************************************************
 * User decided to not delete the chat group.  So simply close the dialogue.
 **********************************************************************************************/
handleCancelDeletion() {
    console.log('[ChatPage] handleCancelDeletion() -> user selected to not delete this chat group.');
    this.handleDialogueClose();
}
/**************************************************************************
 * Will contain the user response to the delete confirmation dialogue.
 * If the user selected to confirm the deletion 'true' will be passed in.
 * It will be 'false' otherwise.
 **************************************************************************/
handleDeletionBoolean(deleteGroup) {
    console.log('[ChatPage] handleDeletionBoolean() -> deleteGroup: ' + deleteGroup);
}
/**************************************************************************
 * Makes an http request to backend to get list of saved chat groups. 
 * This does not include the chat history but just the list of the users/friends that are in this
 * users saved groups.
 **************************************************************************/
getUsersSavedGroupsFromDB() {

    console.log('[ChatPage] getUsersSavedGroupsFromDB called.');
    var dataToSend = new FormData();
    if (this.state.appKeycloak.subject !== undefined) {
        dataToSend.append("userKeycloakId", this.state.appKeycloak.subject);
        dataToSend.append("userKeycloakEmail", this.state.appKeycloak.idTokenParsed.email);
    } else {
        var localKC = localStorage.getItem('keycloakInfo');
        localKC = JSON.parse(localKC);
        dataToSend.append("userKeycloakId", localKC.subject);
        if (localKC.idTokenParsed !== undefined) {
            dataToSend.append("userKeycloakEmail", localKC.idTokenParsed.email);
        }
    }

    /*	fetch request	 */
    fetch(this.state.getUsersSavedGroupsEndpoint, {
    method: 'POST',
            //method: 'GET',// using GET gives this error: Unhandled Rejection (TypeError): Window.fetch: HEAD or GET Request cannot have a body.
            body: dataToSend,
            headers: {
            'Content-type': 'application/x-www-form-urlencoded'
            }
    })
    .then(function(response) {
    var localResponse = response.json();
            console.log('[getUsersSavedGroupsFromDB] fetch api -> localResponse: ' + localResponse + ', stringify: ' + JSON.stringify(localResponse));
            return localResponse;
    })
    .then(function(jsonResponse) {

    console.log('[getUsersSavedGroupsFromDB] fetch api v2:  ' + JSON.stringify(jsonResponse));
            var localSavedChatGroupsArray = jsonResponse.savedChatGroups;
            console.log('[getUsersSavedGroupsFromDB] array size: ' + localSavedChatGroupsArray.size + ' -- ' + localSavedChatGroupsArray.length);
            // Here localSavedChatGroupsArray has array for each chat group, here's example of one: 0: "bock92383@yahoo.com,jriley@ggsm.com"
            this.setState({savedChatGroupsObjectArr: localSavedChatGroupsArray});
    }.bind(this));
}
/**************************************************************************
 *  Call back method for when setState for users name is set.
 * this will set the keycloak object to session/local storage.
 **************************************************************************/
setStateCallBack (saveData) {
    //console.log('[ChatPage] setStateCallBack() -> saveData: ' + saveData + ' -- kc authenticated: ' + this.state.appKeycloak.authenticated);
    if (saveData) {
        this.props.persistKeycloakObj(this.state.appKeycloak);
        localStorage.setItem('keycloakInfo', JSON.stringify(this.state.appKeycloak));
    } else {
        localStorage.removeItem('keycloakInfo');
    }
}

/**************************************************************************
 *  Supposed to be called once when the page is loaded.
 **************************************************************************/
componentDidMount() {

    // 10,000 ms = 10 seconds
    this.setState({getMessagesTimerId: setInterval(this.getLatestMessages, 10000),
            getSavedGroupTimerId: setInterval(this.getUsersSavedGroupsFromDB, 10000)});
    if (this.state.appKeycloak.authenticated !== undefined && this.state.appKeycloak.authenticated !== null &&
                    this.state.appKeycloak.authenticated === true) {
        // keycloak object is still valid and authenticated.
        console.log('[ChatPage] componentDidMount user keycloak object is still authenticated and valid');
        this.setState({usersName: this.state.appKeycloak.idTokenParsed.name});
        this.getAcceptedFriends(this.state.appKeycloak);
        this.getUsersSavedGroupsFromDB(); // componentDidMount
        this.setStateCallBack(true);
    } else {
        this.setStateCallBack(false);
    }

    // check if user refreshed the page or not.
    if (window.performance) {
        if (performance.navigation.type === 1) {
            console.log("[ChatPage] componentDidMount() -> This page is reloaded.  This state username: " + this.state.usersName + " -- is user authenticated: " + this.state.appKeycloak.authenticated);
            if (this.props.keycloakObj.authenticated) {
                console.log('[ChatPage] componentDidMount() -> props keycloakObj is authenticated. Do nothing more?');
                return;
            }
            // if user is not authenticated then invoke the init function again.
            if (this.state.appKeycloak.authenticated === undefined || this.state.appKeycloak.authenticated === null || 
                    this.state.appKeycloak.authenticated === false) {
                // check local storage.
                var localKC = checkLocalStorage();
                if (localKC !== null && localKC !== undefined) {
                    console.log('[ChatPage] componentDidMount() -> localKC from localStorage isn\'t null.');
                    this.setState({usersName: localKC.idTokenParsed.name});
                    this.getAcceptedFriends(localKC);
                    this.getUsersSavedGroupsFromDB(); // componentDidMount

                    return;
                }
                this.state.appKeycloak.init({
                onLoad: 'login-required',
                        enableLogging: true,
                        redirectUri: process.env.REACT_APP_SELF_URL +'/ChatPage'
                        //onLoad: 'check-sso',
                        //enableLogging: true, 
                        //silentCheckSsoRedirectUri: process.env.REACT_APP_SELF_URL +'/ChatPage'
                }).then(function(authenticated) {
                    if (!authenticated) {
                        // if user still not authenticated then re-routes user to the main page.
                        window.location.replace(process.env.REACT_APP_SELF_URL +'/');
                    } else {
                        // if authenticated then will reload the users data and updates the token.
                        this.reloadData('componentDidMount-page refresh'); // componentDidMount, page refresh
                    }
                }.bind(this)).catch(function() {
                    console.log('check sso called.  Error occurred');
                });
            }
        } else {
        // page was not refeshed, so calling handleLoad
        //console.log( "[LoggedInPage] componentDidMount() -> This page is not reloaded");
        this.handleLoad();
        }
    }
}


/******************************************************************************
 * Will be called when component is unloaded/unmounted from the page.
 ******************************************************************************/
componentWillUnmount() {
    window.removeEventListener('load', this.unhandleLoad);
    clearTimeout(this.state.getMessagesTimerId);
    clearTimeout(this.state.getSavedGroupTimerId);
}

/***************************************************************************
 * Gets called when the component is updated.  Here just displaying 
 * debug data.
 ***************************************************************************/
componentDidUpdate(prevState) {


}

/**************************************************************************
 * Called by ComponentDidMount() function.  Only called when the user 
 * clicks to another page then clicks on the ChatPage.  This isn't called if the user does a page refresh.
 * Checks if the user is authenticated
 * If so the reloadData functio nwill be invoked which will update users token, set the users name state, and gets the list of accepted friends.
 * 
 * If the user is not authenticated then it will invoke the keycloak init to verify users authenticated.  If so the reloadData, users name and http request for accepted friends are called.
 **************************************************************************/
handleLoad() {

    if (this.state.appKeycloak.authenticated === true) {
    //console.log('[LoggedInPage] handleLoad() -> user authenticated.  Users name: ' + this.state.appKeycloak.idTokenParsed.name);

        this.reloadData('handleLoad - user is authenticated'); // handleLoad() user is authenticated
        this.setState({usersName: this.state.appKeycloak.idTokenParsed.name}, this.setStateCallBack(true));
        this.getAcceptedFriends();
    } else {

        //console.log('[LoggedInPage] handleLoad() -> user not authenticated.  Calling keycloak init check-sso');

        this.state.appKeycloak.init({
        onLoad: 'check-sso',
                enableLogging: true,
                silentCheckSsoRedirectUri: process.env.REACT_APP_SELF_URL +'/ChatPage'
        }).then(function(authenticated) {
        console.log('[LoggedInPage] handleLoad() -> check-sso authenticated: ' + authenticated);
            if (authenticated) {
                this.reloadData('handleLoad - user not auth, keycloak init then authenticated'); // handleLoad, user is not authenticated, but did keycloak init and now authenticated
                this.setState({usersName: this.state.appKeycloak.idTokenParsed.name}, this.setStateCallBack(true));
                this.getUsersSavedGroupsFromDB();
            } else {
                this.setState({usersName: ''}, this.setStateCallBack(false));
                handleLogout(this.state.logoutUrl);
            }
        }.bind(this)).catch(function() {
        //console.log('[LoggedInPage] handleLoad() -> check-sso call failed.');
        });
    }

}

/********************************************************************
 * Called when the component is unloaded.  Here simply just display a log message.
 ********************************************************************/
unhandleLoad() {
//console.log('[LoggedInPage] unloaded () -> called.');
}

/********************************************************************
 * Loads user data from this.state.appKeycloak.
 * This is called from keycloak updateToken callback.
 ********************************************************************/
loadData () {
    //console.log('[ChatPage] loadData() -> user id: ' + this.state.appKeycloak.subject  + ', still authenticated? ' + this.state.appKeycloak.authenticated);
    if (this.state.appKeycloak.authenticated) {
        this.getAcceptedFriends();
    }
    if (this.state.appKeycloak.idToken) {

        console.log('[ChatPage] loadData() -> IDToken -> username' + this.state.appKeycloak.idTokenParsed.preferred_username + ', email: ' + this.state.appKeycloak.idTokenParsed.email +
            ', name: ' + this.state.appKeycloak.idTokenParsed.name + ', given name: ' + this.state.appKeycloak.idTokenParsed.given_name + ', family name: ' + this.state.appKeycloak.idTokenParsed.family_name);
        this.setState({usersName: this.state.appKeycloak.idTokenParsed.name}, this.setStateCallBack(true));
    } else {

        this.state.appKeycloak.loadUserProfile(function() {
        console.log('[ChatPage] loadData()-> loadUserProfile() -> Account Service -> username: ' + this.state.appKeycloak.profile.username + ', email: ' + this.state.appKeycloak.profile.email +
                ', first name: ' + this.state.appKeycloak.profile.firstName + ', last name: ' + this.state.appKeycloak.profile.lastName);
        this.setState({usersName: this.state.appKeycloak.profile.firstName + ' ' + this.state.appKeycloak.profile.lastName}, this.setStateCallBack(true));
    }, function() {
        //console.log('[ChatPage] loadData()-> Failed to retrieve user details. Please enable claims or account role');
    });
    }

}

/************************************************************************************************
 * Updates the users keycloak token
 ************************************************************************************************/
reloadData (methodCalledFrom) {
    var logData = (this.state.appkeycloak !== undefined && this.state.appkeycloak !== null) ?
        ' keycloak user ' + this.state.appkeycloak.idTokenParsed.name + ' authenticated: ' + this.state.appkeycloak.authenticated : 'Keycloak object is undefined or null';
    console.log('[ChatPage] reloadData() -> called from <' + methodCalledFrom + '>. Calling updateToken.  First appKeycloak: ' + logData);
    if (this.state.appKeycloak === undefined || this.state.appKeycloak === null) {
        console.log('[ChatPage] reloadData() -> appkeycloak is undefined or null.  Can\'t call update token');
        return;
    }
    this.loadData();
        /*
         try {
         this.state.appKeycloak.updateToken(40) // does this have to be lesser than the 'Client Session Idle', 'Client Session Max', and 'Access Token Lifespace'
         .success(this.loadData)
         .error((response) => {
         console.log('[ChatPage] reloadData() ->Failed to load data.  User is logged out?? Will attempt with this.props.keycloakObj.: ' + response);
         this.props.keycloakObj.updateToken(40)
         .success(this.loadData)
         .error(() => {
         console.log('[ChatPage] reloadData() ->Failed to load data.  User is logged out??');// Clearing token and logging out.');
         //var localKeycloak = checkLocalStorage();
         //if (localKeycloak
         
         //this.state.appKeycloak.clearToken();
         //this.state.appKeycloak.logout();
         });
         
         //this.state.appKeycloak.clearToken();
         //this.state.appKeycloak.logout();
         });
         
         } catch(e) {
         console.log('[ChatPage] reloadData() -> caught error updateToken. Error ->' + e);
         }
         */
        //;
}

/**************************************************************************
 *  Will get list of accepted friends.  This will make an http request to the back end.
 * This is not the list of saved group chats of your friends.
 **************************************************************************/
getAcceptedFriends(passedInKeycloakObject)  {
    console.log('[ChatPage] getAcceptedFriends() -> calling fetch to this endpoint: ' + this.state.friendsListEndpoint);
    var dataToSend = new FormData();
    if (passedInKeycloakObject === undefined) {
        dataToSend.append("userKeycloakId", this.state.appKeycloak.subject);
    } else {
        dataToSend.append("userKeycloakId", passedInKeycloakObject.subject);
    }

    /*	fetch request	 */
    fetch(this.state.friendsListEndpoint, {
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
    console.log('[getAcceptedFriends] fetch api:  ' + JSON.stringify(jsonResponse));
            // consider using sessionStorage for storing existingFriends
            this.setState({
            existingFriends: jsonResponse.friends,
                    gotFriendList: true}, function() {
            console.log('[getAcceptedFriends] existing friends ' + this.state.existingFriends + ' -- json stringify ' + JSON.stringify(this.state.existingFriends));
            });
    }.bind(this));
}

/**************************************************************************
 * TEST -> incrementing a counter on the render function.
 * See if can check if the keycloak data here.
 **************************************************************************/
/*
 timer() {
 // setState method is used to update the state
 console.log('[ChatPage] timer() -> Before check-sso.  JSON.stringify (keycloak): ' + JSON.stringify(keycloak));
 //this.handleLoad();
 
 if(this.state.appKeycloak.authenticated === true) {
 console.log('[ChatPage] Timer() -> Before check-sso, user is authenticated.  Calling this.reloadData() which calls update token.');
 this.reloadData(); // timer, commented out
 }
 else 
 {
 try {
 console.log('[ChatPage] timer() -> Before check-sso, is keycloak token expired: ' + this.state.appKeycloak.isTokenExpired());
 }catch(error) {
 console.log('[ChatPage] timer() -> Before check-sso, error while trying to see if token is expired. error -> ' + error);
 // if there's an error, it might be due to user not being authenticated.  Call keycloak init check-sso
 this.state.appKeycloak.init({
 onLoad: 'check-sso',
 enableLogging: true, 
 silentCheckSsoRedirectUri: process.env.REACT_APP_SELF_URL +'/ChatPage' // with this here, we can finally get to the success below.
 }).then(function(authenticated) {
 
 if (!authenticated) {
 console.log('[ChatPage] Timer () -> check-sso called, user is not authenticated.');
 //this.state.appKeycloak.clearToken();
 // if user isn't authenticated then route to main page.   So this routes the user, but this is being false to often.
 // similar behavior as an HTTP redirect
 //window.location.replace(process.env.REACT_APP_SELF_URL +'/");
 //// similar behavior as clicking on a link
 //window.location.href = "http://stackoverflow.com";
 } else {
 //console.log('[ChatPage] Timer () -> check-sso called, user is authenticated, do I NEED to call reloadData function???');
 console.log('[ChatPage] Timer () -> check-sso called, user is authenticated, calling reloadData function...');
 this.reloadData(); // timer, commented out
 }
 }.bind(this)).catch(function() {
 console.log('[ChatPage] Timer() -> check-sso called, error trying to call check-sso');
 });
 };
 }
 }
 */
/********************************************************************************
 * Intended to be called by FreeSoloCreateOptionV3
 * This method contains the users selected/inputted friend from the AutoComplete
 * input field.
 ********************************************************************************/
handleUserSelected(data) {
// extract friend from the FreeSoloCreateOptionV3 component
    var friend = '';
    if (data === undefined || data === null) {
        console.log('[ChatPage] handleUserSelected() -> data is undefined or null.  Not processing more.');
        return;
    }

    if (typeof data === 'object') {
        friend = data.title;
    }
    else if (typeof data === 'string') {
        friend = data;
    }
    else {
        console.log('[ChatPage] unknown type of data passed in: ' + data);
        return;
    }

    // should compare if data inputted in matches one of the lists
    if (this.state.existingFriends.includes(friend)) {
        console.log('[ChatPage] friend: ' + friend + ' exists in existingFriends list.');
    } else {
        console.log('[ChatPage] friend: ' + friend + ' does NOT exist in existingFriends list. Returning...');
        return;
    }

    if (this.state.tempFriendsSelectedArr.includes(friend)) {
        // prevents user from adding same friend in chat group multiple times.
        return;
    }

    var localTempChatGroupArr = this.state.tempFriendsSelectedArr;
    localTempChatGroupArr.push(friend);
    this.setState({tempFriendsSelectedArr: localTempChatGroupArr});
}
/************************************************************************************
 * Method: handleCancelGroupAdd
 * Here the user selected to cancel creating a new chat group.  So want to hide the auto complete component here.
 ************************************************************************************/
handleCancelGroupAdd() {
    console.log('[ChatPage] handleCancelGroupAdd() ->');
    this.setState({groupAddSelected: false,
                tempFriendsSelectedArr: []});
}
/************************************************************************************
 * Method: handleGroupAdd
 * Handles user button click, this should bring up a window where the user can select to chat with their friends (people who accepted their invite)
 ************************************************************************************/
handleGroupAdd() {
        console.log('[ChatPage] handleGroupAdd() -> ');
        // negates the previous boolean value.
        this.setState({groupAddSelected: !this.state.groupAddSelected}, function() {

            // if is false, and temp friends array is not 0, this means the user actually set this to true and had selected some friends
            // so if this is true then this means the user decided to save this chat group.
            if (this.state.groupAddSelected === false && this.state.tempFriendsSelectedArr.length > 0) {

                //var localKC = checkLocalStorage(); // see if can use passed in keycloak object.

                // add current user
                this.state.tempFriendsSelectedArr.push(this.state.appKeycloak.idTokenParsed.email);
                // sorts alphabetically
                this.state.tempFriendsSelectedArr.sort();
                // check if this tempFriendsSelectedArr matches any existing list in this.state.savedChatGroupsObjectArr.groupMembers..
                // if so then return 
                for (let index = 0; index < this.state.savedChatGroupsObjectArr.length; index++) {
                    var savedChatTemp = this.state.savedChatGroupsObjectArr[index].groupMembers.split(','); // need to do split here as groupMembers has all chatGroup Members in a string separated by a comma
                    savedChatTemp.sort();
                    var tempFriendsString = JSON.stringify(this.state.tempFriendsSelectedArr);
                    var savedChatTempString = JSON.stringify(savedChatTemp);
                    if (tempFriendsString === savedChatTempString) {
                        // the friends group already exists.  EXIT.
                        console.log('[ChatPage] handleGroupAdd() -> B this.state.tempFriendsSelectedArr already exists. Exiting.');
                        this.handleCancelGroupAdd();
                        return;
                    }
                }

                var dataToSend = new FormData();
                dataToSend.append("group_chat_members", this.state.tempFriendsSelectedArr);
                dataToSend.append("group_chat_owner", this.state.appKeycloak.idTokenParsed.email);
                // Update logic to wait for response from HTTP request 
                this.sendCreateGroupChat(dataToSend);
            }
        });
}

/*****************************************************************
 * Method to help send http post request for sending a group chat
 * This occurs when the user selects their 'private chat group'
 *****************************************************************/
sendCreateGroupChat(dataToSend) {
    console.log('[ChatPage] sendCreateGroupChat() -> sending http request to create group chat');
    // send http request to chat groups
    fetch(this.state.groupChatCreateEndpoint, {
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
        // do something with jsonResponse
        console.log('[ChatPage]  sendCreateGroupChat() -> fetch api v2:  ' + JSON.stringify(jsonResponse) + ' -- status: ' + jsonResponse.status);
        if (jsonResponse.status === 'success') {
            console.log('[ChatPage] chat group created with group id: ' + jsonResponse.chat_group_id);
            // proceed to update GUI via the render method?
            var newSavedChatGroup = '';
            for (let i = 0; i < this.state.tempFriendsSelectedArr.length; i++)
            {
                if (i === 0) {
                    newSavedChatGroup = this.state.tempFriendsSelectedArr[i];
                } else {
                    newSavedChatGroup = newSavedChatGroup + ',' + this.state.tempFriendsSelectedArr[i];
                }
            }

            var tempObjectArray = this.state.savedChatGroupsObjectArr;
            tempObjectArray.push({groupID: jsonResponse.chat_group_id, groupMembers: newSavedChatGroup});
            console.log('[ChatPage] sendCreateGroupChat() -> Object Group: ' + tempObjectArray + ' -- ' + JSON.stringify(tempObjectArray));
            this.setState({savedChatGroupsObjectArr: tempObjectArray, tempFriendsSelectedArr: []});
        }

    }.bind(this));
}

/********************************************************************
 *
 ********************************************************************/
handleCheckSSO (authenticated) {
    console.log(authenticated ? 'ChatPage::handleCheckSSO -> user authenticated' : 'ChatPage::handleCheckSSO -> user not authenticated'); // works.
}

/************************************************************************************************
 *
 ************************************************************************************************/
loadFailure () {
    console.log('[ChatPage] loadFailure() ->Failed to load data.  Check console log');
};
/**************************************************************************************************
 * handleInputChange method.
 * As user enters letters they should see an autocomplete list of their existing friends.
 **************************************************************************************************/
handleInputChange(event) {
    console.log('value is: ' + event.target.value);
}

/*****************************************************************************************************
 * This gets invoked when user selects on an item/row in the list of unique groups.
 * The intent of this is to extract the usernames/emails and show the chat history of this group.
 *****************************************************************************************************/
selectGroupToChatV2(data) {
    if (data === undefined || data === null || data === '') {
            console.log('[ChatPage] selectGroupToChat() -> data passed in is undefined, null or empty. Exiting from method.');
            return;
    } else {
            console.log('[selectGroupToChatV2] group id selected: ' + data.chatGroups.groupID + ' -- group members selected: ' + data.chatGroups.groupMembers);
    }
    this.props.persistParentChatGroupDataMethod(data.chatGroups.groupID, data.chatGroups.groupMembers); // passes groupID and groupMembers
    // intent of this below is to:
    // - save to a state variable the 'chat group' selected, 
    // - blank out the 'chatGroupMessages' state variable (this is intended to blank out previous group chats text)
    // - in the call back, get the latest messages for this newly selected chat group.
    this.setState({
        //currentChatGroupSelected: data.chatGroups.groupMembers,	// set currentChatGroupSelected
        chatGroupMessages: ''											// blank out existing group chat box
        }, function() {
        this.getLatestMessages();
    });
}

/****************************************************************************************
 * Method: handleDeleteGroup
 * Handles when user selects to delete a saved chat group.  First it will
 * ask the user to confirm the deletion.
 ****************************************************************************************/
handleDeleteGroupV2(groupToDelete) {
    /* Perhaps add a react modal dialogue https://mui.com/material-ui/react-dialog/ */
    console.log('[handleDeleteGroupV2] group to delete: ' + groupToDelete + ' ---- ' + JSON.stringify(groupToDelete)); // groupToDelete.group_id 	groupToDelete.group_members
    console.log('[handleDeleteGroupV2] group id to delete : ' + groupToDelete.groupID + ' -- the members there: ' + groupToDelete.groupMembers); // groupToDelete.group_id 	groupToDelete.group_members
    this.setState({chatGroupToDelete: groupToDelete.groupID}, function() {
        this.handleDialogueOpen();
    });
}
/*********************************************************************************
 * Method: getLatestMessages
 * Description: Get the latest messages from the chat group.
 *********************************************************************************/
getLatestMessages() {

    // verify parent chat group object is not null nor undefined
    if (this.state.parentChatGroupObj === undefined || this.state.parentChatGroupObj === null ||
            this.state.parentChatGroupObj.groupID === undefined || this.state.parentChatGroupObj.groupMembers === null ||
            this.state.parentChatGroupObj.groupID === - 1)
    {
            console.log('[ChatPage] getLatestMessages()-> currentChatGroupSelected is undefined or .number is undefined.');
            return;
    }

    var dataToSend = new FormData();
    dataToSend.append("chatGroupMembers", this.state.parentChatGroupObj.groupMembers);
    dataToSend.append("chatGroupID", this.state.parentChatGroupObj.groupID);
    // send http request to get latest messages
    fetch(this.state.getLatestMessagesEndpoint, {
    //method: '-d GET', // Can't use get or else will get an error about having a body (with the data) in a GET fetch
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
        if (jsonResponse !== undefined) {
                // do something with jsonResponse
                console.log('[ChatPage]  getLatestMessages() -> fetch api v2:  ' + JSON.stringify(jsonResponse) + ' -- status: ' + jsonResponse.status);
                if (jsonResponse.status === 'success') {
                    //console.log('[ChatPage]  getLatestMessages() -> fetch api v2.  Message posted successfully.');
                    var messagesFromDB;
                    messagesFromDB = jsonResponse.messages;
                    console.log('[ChatPage] getLatestMessages()-> # of messages: ' + messagesFromDB.length);
                    var formattedContent = '';
                    for (let i = 0; i < messagesFromDB.length; i++) {

                        // formattedContent += 'Username-id: ' + messagesFromDB[i].user_name + ' - ' + messagesFromDB[i].user_id + '\n' + messagesFromDB[i].message;
                        formattedContent += 'From: ' + messagesFromDB[i].user_name + '\t\t' + messagesFromDB[i].msg_timestamp + '\n\n' + messagesFromDB[i].message;
                        formattedContent += '\n--------------------------------------------\n';
                    }

                    this.setState({chatGroupMessages: formattedContent});
                }
        } else {
            console.log('[ChatPage] getLatestMessages()-> jsonResponse is null.');
        }
    }.bind(this));
}

/***************************************************************************************************
 * Method: submitMessage
 * Description: takes text from the input box and submits it to backend.
 * This is intended to be the actual group chat.
 ***************************************************************************************************/
submitMessage(removedUserMessage) {

    var userMessage = '';
    userMessage = removedUserMessage;
    if (userMessage === undefined || userMessage === null || userMessage === '') {
        // then this message was invoked by the user posting a message
        userMessage = document.getElementById('userInput').value;
        if (userMessage === '') {
                console.log('[ChatPage] submitMessage()-> userMessage or currentChatGroupSelected is empty.  Not posting message.');
                return;
        }
    }

        console.log('[ChatPage] submitMessage() -> user selects to submit message. ' + userMessage);
        document.getElementById('userInput').value = ''; // clear out value

        var dataToSend = new FormData();
        dataToSend.append("userMessageToPost", userMessage);
        dataToSend.append("chatGroup", this.state.currentChatGroupSelected);
        dataToSend.append("chatGroupMembers", this.props.parentChatGroupObj.groupMembers);
        dataToSend.append("chatGroupID", this.props.parentChatGroupObj.groupID);
        if (this.state.appKeycloak !== undefined && this.state.appKeycloak.idTokenParsed !== undefined) {
            dataToSend.append("keycloakUserId", this.state.appKeycloak.subject);
            dataToSend.append("keycloakUserName", this.state.appKeycloak.idTokenParsed.preferred_username);
        } else {
            var localKC = checkLocalStorage();
            dataToSend.append("keycloakUserId", localKC.subject);
            dataToSend.append("keycloakUserName", localKC.idTokenParsed.preferred_username);
        }

        // send http request to store the latest message to the chat group.  This will be stored in the DB.
        fetch(this.state.postMessageEndpoint, {
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
            if (jsonResponse !== undefined) {
                // do something with jsonResponse
                console.log('[ChatPage]  submitMessage() -> fetch api v2:  ' + JSON.stringify(jsonResponse) + ' -- status: ' + jsonResponse.status);
                if (jsonResponse.status === 'success') {
                    console.log('[ChatPage]  submitMessage() -> fetch api v2.  Message posted successfully.');
                }   
            }
        });
}


doNothing() {
// intentionally blank.
}
/***************************************************************************************************
 * RENDER method.
 ***************************************************************************************************/
render() {

    // Retrieves users username from keycloak object.
    const UserHTML = (this.state.usersName !== undefined ? this.state.usersName : 'no name');
    // For rendering list of group chats of friends **************************************************************************************************************************

    var savedChatGroupsHTML;
    // see about generating friends list out of object array
    const renderChatGroupObjects = this.state.savedChatGroupsObjectArr;
    if (renderChatGroupObjects.length > 0) {
        savedChatGroupsHTML = renderChatGroupObjects.map((chatGroups) =>
                <li  key={chatGroups.groupID} onClick={() => this.selectGroupToChatV2({chatGroups})}> {chatGroups.groupMembers} <span onClick={() => this.handleDeleteGroupV2(chatGroups)}> Del </span> <span className="debugClass">{chatGroups.groupID}</span></li>
                );
    }

    // For conditional rendering of the AutoComplete feature in the left side bar **************************************************************
    // first part here gets list of friends to put in the auto complete (FreeSoloCreateOptionV3) component.
    let renderedAutoCompleteHTML;
    const didUserSelectAdd = this.state.groupAddSelected;
    if (didUserSelectAdd) {
        // set up array of objects
        var friendsObjectArray = [];
        var arrayLength = this.state.existingFriends.length;
        for (var i = 0; i < arrayLength; i++) {
            var localObject = {title: this.state.existingFriends[i]};
            friendsObjectArray[i] = localObject;
        }

        // second parth here places friends list in auto complete component.
        renderedAutoCompleteHTML =
            <div className="autoCompleteDivElement">
                <FreeSoloCreateOptionV3 modifiedFriends={friendsObjectArray} functionToCall={this.handleUserSelected} />
            </div>;
    }

    // Handle Chat Group Add / Cancel // ***************************************************************************************
    let handleAddCancelChatGroupHTML =
        <div className="addCancelSection">
            <a><span onClick={() => this.handleGroupAdd()}>+ Add</span></a>
        </div>;
    if (didUserSelectAdd) {
        // if here then user selected to select friends from auto complete component. so add a button to cancel.
        handleAddCancelChatGroupHTML =
        <div className="addCancelSection">
            <span>
                <a><span onClick={() => this.handleGroupAdd()}>+ Save</span> </a>
                <a><span onClick={() => this.handleCancelGroupAdd() }> Cancel</span></a>
            </span>
        </div>;
    }
// *******************************************************************************************************************************

    // This part handles when user is actively creating a chat group. //  *******************************************************
    // Once change group is finalized then this html will be blanked out // *****************************************************
    var tempFriendsAsString = '';
    const temporaryFriendsChatGroup = this.state.tempFriendsSelectedArr;
    for (let i = 0; i < temporaryFriendsChatGroup.length; i++) {
        if (i === 0) {
            tempFriendsAsString = temporaryFriendsChatGroup[i];
        }
        else {
            tempFriendsAsString = tempFriendsAsString + ', ' + temporaryFriendsChatGroup[i];
        }
    }
    let tempChatGroup =
            <div className="temporaryFriendsChatGroup">{tempFriendsAsString}</div>

// *******************************************************************************************************************************

    // will only render anything on the page if the appkeycloak object is an authenticated user.
    const renderPage = this.state.appKeycloak.authenticated !== undefined && this.state.appKeycloak.authenticated !== null &&
    this.state.appKeycloak.authenticated === true;
    return (
        <div>
            {renderPage &&
            <div className="ChatPage">

                <nav className="sidenavChat">

                    <Link to="/">Home</Link> 
                    <Link to="/AboutUs">AboutUs</Link> 
                    <Link to="/ContactUs">ContactUs</Link> 
                    <a><span onClick={() => handleLogout(this.state.logoutUrl)}>Logout</span> </a>
                    <Link to="/InviteFriend">Invite</Link>
                    <div className="lineSeparator">
                        ---------------------
                        {/* intended to separate nav with group chats */}
                    </div>
                    <div className="groups">
                        <p>Groups</p>

                        {handleAddCancelChatGroupHTML}
                        {renderedAutoCompleteHTML}
                        <ul className="listSavedChatGroups">{savedChatGroupsHTML}</ul>
                        {tempChatGroup}
                    </div>
                </nav>

                <div className="mainChat">
                    <header className="ChatPage-header">
                        {/* Need a left panel or option to create chat groups */}

                        <AlertDialogue handleOpenParam={this.handleDialogueOpen} handleCloseParam={this.handleDialogueClose} 
                               openDialogue={this.state.openDeleteDialogue} 
                               groupToDelete={this.props.parentChatGroupObj.groupMembers}
                               handleUserResponse={this.handleDeletionBoolean}
                               confirmDelete={this.handleConfirmDeletion} cancelDelete={this.handleCancelDeletion} />

                        <h1>Chat.</h1>
                        <h2 id="welcomeHeader"> Welcome {UserHTML}! </h2>
                        <p>You're now logged in!</p>
                        {/*
                         <p>Selected Chat {this.state.parentChatGroupObj.groupMembers}</p>
                         */}
                        <p>Selected Chat: {this.props.parentChatGroupObj.groupMembers}</p>
                        {/*	  <form> */}
                        <label>Chat:</label>
                        <br/>
                        < textarea id="userInput" rows="2" cols="50">< /textarea>
                        <br/>
                        <input type="submit" value="Post Message" onClick={() => this.submitMessage()}/>
                        <br/>
                        <label>Group messages:</label>
                        <br/>
                        < textarea id="chatHistory" value={this.state.chatGroupMessages} onChange={() => this.doNothing()} rows="4" cols="50" readOnly >< /textarea>
                        {/*      </form> */}
                    </header>
                    <br/><br/>
                </div>
            </div>
            }
        </div>
    );
}

}
export default ChatPage;
