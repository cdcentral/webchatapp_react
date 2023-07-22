/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


import React, { useState } from 'react';

const ImageUploader = () => {
  const [image, setImage] = useState('');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        console.log('[handleImageUpload] reader result: ' + reader.result);
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
{/*      <h2>Image Uploader</h2>    */}
      <input type="file" onChange={handleImageUpload} accept="image/*" />
      {image && <img src={image} alt="Uploaded" />}
    </div>
  );
};

export default ImageUploader;