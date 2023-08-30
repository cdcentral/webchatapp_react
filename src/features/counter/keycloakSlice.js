/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


import { createSlice } from '@reduxjs/toolkit'

import  Keycloak from 'keycloak-js';

export const keycloakSlice = createSlice({
  name: 'keycloak',
  initialState: {
    keycloak: new Keycloak({
        url: process.env.REACT_APP_API_KEYCLOAK_URL,
        realm: process.env.REACT_APP_API_REALM,
        clientId: process.env.REACT_APP_API_CLIENT_ID
    })
  },
  reducers: {
    getKeycloak:(state) => {
       return state.keycloak; 
    }, 
  },
})

// Action creators are generated for each case reducer function
export const { getKeycloak } = keycloakSlice.actions

export default keycloakSlice.reducer