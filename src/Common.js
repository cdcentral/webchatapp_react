/**************************************************************************************************************
 License:
 MIT License
 
 Copyright (c) [2022] [cdcentral]
 
 ***************************************************************************************************************
 
 From source code author: Chris Duran
 
 This project and its source code is free for anyone to use and modify.  Please retain this header and the following links.
 
 This source code can be found in the following youtube video https://youtu.be/7TYL6BPZVmw
 The main channel is https://www.youtube.com/@CDCentral
 Donations are appreciated at https://paypal.me/AncoCentral?country.x=US&locale.x=en_US
 **************************************************************************************************************/

/************************************************************************
 * Checks local storage if a keycloak object is stored.
 ************************************************************************/
function checkLocalStorage() {
    //console.log('[Common] checkLocalStorage().');
    var localKC = localStorage.getItem('keycloakInfo');

    try {
        if (localKC !== undefined && localKC !== null) {
            localKC = JSON.parse(localKC);
            console.log('[Common] checkLocalStorage() -> is authenticated: ' + localKC.authenticated);

            if (localKC.idTokenParsed === undefined || localKC.idTokenParsed === null) {
                return null;
            } else {
                return localKC;
            }
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

/*******************************************************************************
 * Gets invoked when the user clicks the Logout button.  This does two things.
 * 1. Clears local storage for 'keycloakInfo'
 * 2. Invokes logout url
 *******************************************************************************/
function handleLogout(logoutUrl) {
    console.log('[Common] handleLogout() -> removing keycloakInfo from local storage then route user to logout url');
    localStorage.removeItem('keycloakInfo');
    window.location.replace(logoutUrl);
}


/***********************************************************************************
 * Deletes an item from an array just once.
 ***********************************************************************************/
function removeItemOnceObjectArray(arr, value) {

    for (var i = arr.length - 1; i >= 0; --i) {
        if (arr[i].groupID === value) {
            arr.splice(i, 1);
        }
    }
    return arr;
}

/***********************************************************************************
 * Deletes an item from an array just once.
 ***********************************************************************************/
function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

/***********************************************************************************
 * Deletes an item from an array.  Removes all instances.
 ***********************************************************************************/
function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}
export { checkLocalStorage, handleLogout, removeItemOnce, removeItemAll, removeItemOnceObjectArray};