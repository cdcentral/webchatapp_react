/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 * 
 * 
 */

// tutorial I'm following https://react-redux.js.org/tutorials/quick-start
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import keycloakReducer from '../features/counter/keycloakSlice'
export default configureStore({
  reducer: {
//    counter: counterReducer,
    keycloak: keycloakReducer,
  },
})