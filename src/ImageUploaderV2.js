/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


import React, { useState } from 'react';
import {checkLocalStorage, handleLogout} from './Common.js';

/**
 * 
 * @param {type} callback Method to associate the avatar selected with the friend.
 * 
 * @param {type} friend To be used in form submit to the back end. The image 
 * will be associated with the friend.
 * 
 * @param {type} friendAvatar, this is the actual avatar/image of this specific friend.
 * This will be displayed.
 * 
 * @returns {handleFormSubmit@var;handleImageChange|String|Boolean}
 */
function ImageUploaderV2({callback, friend, friendAvatar}) {
  // this is actual image/avatar to be displayed for the friend
  const [selectedImage, setSelectedImage] = useState(friendAvatar);

  // this is temporary saved html text upon user saving an image/avatar for a friend by hitting the 'upload' button.
  const [savedImageHtml, setSavedImageHTML] = useState(null); // useState(<label>component html</label>); works also.

  /**
   * Handles when user selects an image for a friend.
   * @param {type} event
   * @returns {undefined}
   */
  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
    console.log('[handleImageChange] event target files[0] ' + event.target.files[0]);
    if (event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        console.log('[handleImageChange] reader result: ' + reader.result);
        console.log('reader result stringify: ' + JSON.stringify(reader));
        console.log('[] selectedImage: ' + selectedImage + ', type of: ' + typeof selectedImage);
        setSelectedImage(reader.result);
        callback(selectedImage);
      };
      reader.readAsDataURL(event.target.files[0]);
    }  };

  /**
   * Set the Saved HTML text back to null after the timer expires.
   * @returns {undefined}
   */
  const timerFinished = () => {
      setSavedImageHTML(null);
  }

  /**
   * Handles when user selects to upload saved image to the db.
   * @param {type} event
   * @returns {undefined}
   */
  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (selectedImage) {
      const formData = new FormData();
      formData.append('image', selectedImage);
      console.log('[handleFormSubmit] selectedImage -> ' + selectedImage);
      /*
       selectedImage above showed:
            23:23:24.720
            [handleFormSubmit] selectedImage -> data:image/jpeg;base64,/9j/4A..0MxP7FuP+gtaf9+BWfIwP/9k=
            ImageUploaderV2.js:45

       */

      formData.append('friend', friend);
      // local storage
      var localKC = checkLocalStorage();
      formData.append("userKeycloakId", localKC.subject);

      console.log('[ImageUploaderV2-handleFormSubmit] selected image -> ' + selectedImage + ', friend -> ' + friend + ', keycloak id -> ' + localKC.subject);

      var saveImageEndpoint = process.env.REACT_APP_API_JAVA_BACKEND_BASE_URL + '/SaveImage';
      fetch(saveImageEndpoint, {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        console.log('Image saved successfully:', data);
        // Do something with the response if needed
        // Should show GUI update.
        if (data.Success === true) {
            // saved successfully
            console.log('Image really saved successfully.');
            setSavedImageHTML(<label>Image Saved!</label>);
            setInterval(timerFinished, 2000);
        }

      })
      .catch(error => {
        console.error('Error saving image:', error);
      });
    }
  };

  var mySavedImageLabelHTML = savedImageHtml;

  return (

    <form onSubmit={handleFormSubmit}>
      <input type="file" onChange={handleImageChange} />
      <button type="submit">Upload</button>
      {selectedImage && <img src={selectedImage} alt="Uploaded" width="100" height="200"/>}
      {mySavedImageLabelHTML}
    </form>
  );
}

export default ImageUploaderV2;
