import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import  Keycloak from 'keycloak-js';

import MainApp from './MainApp';

const root = ReactDOM.createRoot(document.getElementById('root'));

/*
 Global Keycloak object that points to the keycloak instance, realm and client app to verify/authenticate against.
 */
var keycloak = new Keycloak({
    url: process.env.REACT_APP_API_KEYCLOAK_URL,
    realm: process.env.REACT_APP_API_REALM,
    clientId: process.env.REACT_APP_API_CLIENT_ID
});

/*
 Used to help persist the keycloak object data.
 */
function persistKeycloakObjectIndex(pKeycloak) {
    if (pKeycloak !== undefined && pKeycloak !== null) {
        console.log('[index.js] persistKeycloakObjectIndex method called user authenticated.' + pKeycloak.authenticated);
    } else {
        console.log('[index.js] persistKeycloakObjectIndex method called. pKeycloak object passed in is undefined or null');
    }
    keycloak = pKeycloak;
}

/*
 Object used to select the specific chat group which will have an ID and a list of members associated wtih it.
 */
var chatGroupObj = {groupID: -1, groupMembers: ''};


/*
 This will be used to persist the chat group data to the 'chatGroupObj' variable.
 */
function persistChatGroupData(localChatGroupID, localChatGroupMembers) {
    console.log('[index.js] persistChatGroupData method called: ' + localChatGroupID);

    chatGroupObj.groupID = localChatGroupID;
    chatGroupObj.groupMembers = localChatGroupMembers;
}


/* Logout URL.  This removes the users session token, and this can be verified in keycloak web console. */
//const logoutUrl = 'http://localhost:8081/auth/realms/ReactChatApp/protocol/openid-connect/logout?redirect_uri=http://localhost:3000';
//'http://localhost:8081/auth/realms/ReactChatApp/protocol/openid-connect/logout?redirect_uri=http://localhost:3000';
/* Defined and passed as a prop to another class, but not actively used.*/

root.render(
        <MainApp parentKeycloak={keycloak} parentPersistKeycloakMethod={persistKeycloakObjectIndex} 
                 parentChatGroupData={chatGroupObj} persistParentChatGroupDataMethod={persistChatGroupData} />
        );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
