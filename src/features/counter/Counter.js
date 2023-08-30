/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment, getKeycloak } from './counterSlice'
//import styles from './Counter.module.css'

export function Counter() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()

  const kc = useSelector((state) => state.counter.keycloak)
  
  const LoginNow = () => {
    kc.init({
            onLoad: 'login-required',
            enableLogging: true,
            redirectUri: process.env.REACT_APP_SELF_URL +'/ChatPage'
            //onLoad: 'check-sso',
            //enableLogging: true, 
            //silentCheckSsoRedirectUri: process.env.REACT_APP_SELF_URL +'/ChatPage'
    })
  };

  return (
    <div>
      <div>
        <button
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          Increment
        </button>
        <span>{count}</span>
        <button
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          Decrement
        </button>
        <button
          aria-label="login value"
          onClick={() => LoginNow()}
        >
          Login
        </button>
      </div>
    </div>
  )
}