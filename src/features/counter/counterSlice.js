/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


import { createSlice } from '@reduxjs/toolkit'

import  Keycloak from 'keycloak-js';

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
    keycloak: new Keycloak({
        url: process.env.REACT_APP_API_KEYCLOAK_URL,
        realm: process.env.REACT_APP_API_REALM,
        clientId: process.env.REACT_APP_API_CLIENT_ID
    })
  },
  reducers: {
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },
    getKeycloak:(state) => {
       return state.keycloak; 
    }, 
  },
})

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount, getKeycloak } = counterSlice.actions

export default counterSlice.reducer